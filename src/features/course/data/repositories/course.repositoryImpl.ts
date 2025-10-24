import { CreateCourseDto } from "../../domain/dto/createCourse.dto";
import { Course } from "../../domain/entities/course";
import { CourseRepository } from "../../domain/repositories/course.repository";
import { CourseDataSource } from "../datasources/course.datasource";

export class CourseRepositoryImpl implements CourseRepository {
  constructor(
    private readonly courseDataSource: CourseDataSource
  ) {}

  async getAllCourses(): Promise<Course[]> {
    return await this.courseDataSource.getAllCourses();
  }

  async getCourseById(id: string): Promise<Course | undefined> {
    return await this.courseDataSource.getCourseById(id);
  }

  async createCourse(request: CreateCourseDto): Promise<any> {
    return await this.courseDataSource.createCourse(request);
  }

  async joinCourseByInvitation(invitationCode: string, studentId: string): Promise<Course> {
    return await this.courseDataSource.joinCourseByInvitation(invitationCode, studentId);
  }
}
