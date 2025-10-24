import { Course } from "../entities/course";
import { CourseRepository } from "../repositories/course.repository";

export class JoinCourseUseCase {
    constructor(private repository: CourseRepository) {}
    async execute(invitationCode: string, studentId: string): Promise<Course> {
        if (!invitationCode || !studentId) {
            throw new Error("Invitation code and student id are required");
        }
        const course = await this.repository.joinCourseByInvitation(invitationCode, studentId);
        if (!course) {
            throw new Error("Course not found");
        }
        return course;
    }
}