import { Course } from "../entities/course";
import { CourseRepository } from "../repositories/course.repository";

export class GetCourseByIdUseCase {
    constructor(private repository: CourseRepository) {}
    async execute(id: string): Promise<Course> {
        if (!id) {
            throw new Error("Id is required");
        }
        const course = await this.repository.getCourseById(id);
        if (!course) {
            throw new Error("Course not found");
        }
        return course;
    }
}