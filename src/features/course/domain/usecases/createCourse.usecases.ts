import { CreateCourseDto } from "../dto/createCourse.dto";
import { Course } from "../entities/course";
import { CourseRepository } from "../repositories/course.repository";

export interface CreateCourseResponse {
    success: boolean;
    course?: Course;
    message?: string;
}

export class CreateCourseUseCase {
    constructor(
        private readonly courseRepository: CourseRepository
    ) { }

    async execute(request: CreateCourseDto): Promise<CreateCourseResponse> {
        try {
            this.validateRequest(request);

            const courseData = await this.courseRepository.createCourse({
                title: request.title,
                description: request.description || "",
                invitationCode: request.invitationCode,
                createdByUserId: request.createdByUserId,
                createdByUserEmail: request.createdByUserEmail
            });

            const course = new Course(
                '',
                courseData.title,
                courseData.description,
                courseData.invitationCode,
                courseData.createdByUserId,
                [],
                [],
                [],
                []
            );

            return {
                success: true,
                course: course,
                message: "Course created successfully"
            };

        } catch (error) {
            console.error('Error creating course:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    private validateRequest(request: CreateCourseDto): void {
        if (!request.title || request.title.trim().length === 0) {
            throw new Error('Course title is required');
        }

        if (!request.invitationCode || request.invitationCode.trim().length === 0) {
            throw new Error('Invitation code is required');
        }

        if (!request.createdByUserId || request.createdByUserId.trim().length === 0) {
            throw new Error('Created by user ID is required');
        }

        if (!request.createdByUserEmail || request.createdByUserEmail.trim().length === 0) {
            throw new Error('Created by user email is required');
        }

        // Validar formato del invitationCode
        if (request.invitationCode.length < 6) {
            throw new Error('Invitation code must be at least 6 characters long');
        }
    }
}