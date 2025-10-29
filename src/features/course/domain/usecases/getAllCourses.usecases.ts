import { Course } from "../entities/course";
import { CourseRepository } from "../repositories/course.repository";

export class GetAllCoursesUseCase {
    constructor(private repository: CourseRepository) {}

    async execute(): Promise<Course[]> {
        return this.repository.getAllCourses();
    }
}