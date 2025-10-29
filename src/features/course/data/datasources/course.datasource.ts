import { CreateCourseDto } from "../../domain/dto/createCourse.dto";
import { Course } from "../../domain/entities/course";

export interface CourseDataSource {
  getAllCourses(): Promise<Course[]>;
  getCourseById(id: string): Promise<Course | undefined>;
  createCourse(request: CreateCourseDto): Promise<any>;
  joinCourseByInvitation(invitationCode: string, studentId: string): Promise<Course>;
}
