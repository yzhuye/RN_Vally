import { CreateCourseDto } from "../dto/createCourse.dto";
import { Course } from "../entities/course";

export interface CourseRepository {
  getAllCourses(): Promise<Course[]>;
  getCourseById(id: string): Promise<Course | undefined>;
  createCourse(request: CreateCourseDto): Promise<any>;
  joinCourseByInvitation(invitationCode: string, studentId: string): Promise<Course>;
}
