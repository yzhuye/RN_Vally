import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceImp";
import { CreateCourseDto } from "../../domain/dto/createCourse.dto";
import { Course } from "../../domain/entities/course";
import { CourseDataSource } from "./course.datasource";

export class CourseRemoteDataSourceImp implements CourseDataSource {
  private readonly projectId: string;
  private readonly baseUrl: string;
  private readonly table = "courses";

  private prefs: ILocalPreferences;

  constructor(
    private authService: AuthRemoteDataSourceImpl,
    projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID
  ) {
    if (!projectId) {
      throw new Error("Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var");
    }
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
    this.projectId = projectId;
    this.baseUrl = `https://roble-api.openlab.uninorte.edu.co/database/${this.projectId}`;
  }

  private async authorizedFetch(
    url: string,
    options: RequestInit,
    retry = true
  ): Promise<Response> {
    const token = await this.prefs.retrieveData<string>("token");
    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 && retry) {
      console.warn("401 detected, trying to refresh token…");
      try {
        const refreshed = await this.authService.refreshToken();
        if (refreshed) {
          // retry with new token
          const newToken = await this.prefs.retrieveData<string>("token");
          const retryHeaders = {
            ...(options.headers || {}),
            Authorization: `Bearer ${newToken}`,
          };
          return await fetch(url, { ...options, headers: retryHeaders });
        }
      } catch (e) {
        console.error("Token refresh failed, forcing logout", e);
        // Here you might trigger logout context/state
      }
    }

    return response;
  }

  async getAllCourses(): Promise<Course[]> {
    const url = `${this.baseUrl}/read?tableName=${this.table}`;

    const response = await this.authorizedFetch(url, { method: "GET" });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized (token issue)");
      }
      throw new Error(`Error fetching courses: ${response.status}`);
    }

    const data = await response.json();
    return data.map((course: any) => this.mapToCourse(course));
  }

  async getCourseById(id: string): Promise<Course | undefined> {
    const url = `${this.baseUrl}/read?tableName=${this.table}&_id=${id}`;

    const response = await this.authorizedFetch(url, { method: "GET" });

    if (response.status === 200) {
      const data: any[] = await response.json();
      if (data.length > 0) {
        const course = data[0];
        
        // Get enrolled students
        const enrolledStudents = await this.getEnrolledStudents(id);
        course.enrolledStudents = enrolledStudents;
        
        return this.mapToCourse(course);
      }
      return undefined;
    } else if (response.status === 401) {
      throw new Error("Unauthorized (token issue)");
    } else {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        `Error fetching course by id: ${response.status} - ${
          errorBody.message ?? "Unknown error"
        }`
      );
    }
  }

  async createCourse(request: CreateCourseDto): Promise<any> {
    const url = `${this.baseUrl}/insert`;

    const body = JSON.stringify({
      tableName: this.table,
      records: [{
        title: request.title,
        description: request.description || "",
        invitationCode: request.invitationCode,
        imageUrl: request.imageUrl,
        createdBy: request.createdByUserEmail,
      }]
    });

    const response = await this.authorizedFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (response.status === 200 || response.status === 201) {
      const data = await response.json();
      if (data.inserted && data.inserted.length > 0) {
        const course = data.inserted[0];
        const courseId = course._id;

        // Step 2: Insert into user_courses
        const userCourseBody = JSON.stringify({
          tableName: "user_courses",
          records: [{
            user_id: request.createdByUserId,
            course_id: courseId,
            role: "teacher",
          }]
        });

        const relResponse = await this.authorizedFetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: userCourseBody,
        });

        if (relResponse.status === 200 || relResponse.status === 201) {
          return course;
        } else {
          throw new Error(
            `Course created but error assigning user_courses: ${relResponse.status} ${await relResponse.text()}`
          );
        }
      }
    } else if (response.status === 401) {
      throw new Error("Unauthorized (token issue)");
    } else {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        `Error creating course: ${response.status} - ${
          errorBody.message ?? "Unknown error"
        }`
      );
    }
  }

  async joinCourseByInvitation(invitationCode: string, studentId: string): Promise<Course> {
    const url = `${this.baseUrl}/read?tableName=${this.table}&invitationCode=${invitationCode}`;

    const response = await this.authorizedFetch(url, { method: "GET" });

    if (response.status !== 200) {
      throw new Error(
        `Error searching course: ${response.status} ${await response.text()}`
      );
    }

    const courses = await response.json();
    if (courses.length === 0) {
      throw new Error("No course found with that invitation code");
    }

    const course = courses[0];
    const courseId = course._id;

    // Insert into user_courses
    const insertUrl = `${this.baseUrl}/insert`;
    const body = JSON.stringify({
      tableName: "user_courses",
      records: [{
        user_id: studentId,
        course_id: courseId,
        role: "student",
      }]
    });

    const relResponse = await this.authorizedFetch(insertUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (relResponse.status === 200 || relResponse.status === 201) {
      return this.mapToCourse(course);
    } else {
      throw new Error(
        `Error joining course: ${relResponse.status} ${await relResponse.text()}`
      );
    }
  }

  private async getEnrolledStudents(courseId: string): Promise<any[]> {
    try {
      const url = `${this.baseUrl}/read?tableName=user_courses&course_id=${courseId}`;
      const response = await this.authorizedFetch(url, { method: "GET" });

      if (response.status === 200) {
        const userCourses = await response.json();
        const enrolledStudents = [];

        for (const userCourse of userCourses) {
          if (userCourse.role === "student") {
            const userId = userCourse.user_id;
            const users = await this.authorizedFetch(
              `${this.baseUrl}/read?tableName=users&_id=${userId}`,
              { method: "GET" }
            );
            
            if (users.status === 200) {
              const userData = await users.json();
              if (userData.length > 0) {
                const user = userData[0];
                enrolledStudents.push({
                  id: userId,
                  email: user.email,
                  name: user.username,
                  enrollmentDate: new Date()
                });
              }
            }
          }
        }

        return enrolledStudents;
      }
    } catch (error) {
      console.error("Error fetching enrolled students:", error);
    }
    
    return [];
  }

  private mapToCourse(data: any): Course {
    return new Course(
      data._id,
      data.title,
      data.description,
      data.invitationCode,
      data.createdBy,
      data.enrolledStudents || [],
      data.enrolledStudentInfo || [],
      data.categories || [],
      data.groups || [],
      data.imageUrl
    );
  }
}
