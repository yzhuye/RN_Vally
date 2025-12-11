import { GroupRepository } from "../repositories/group.repository";

export interface FindStudentGroupResponse {
    isSuccess: boolean;
    group: any | null;
    message: string;
}

export class FindStudentGroupUseCase {
    private repository: GroupRepository
    constructor(repository: GroupRepository) {
        this.repository = repository;
    }
    async execute(categoryId: string, studentId: string): Promise<FindStudentGroupResponse> {
        try {
            const group = await this.repository.findStudentGroup(categoryId, studentId);
            if (group) {
                return {
                    isSuccess: true,
                    group: group,
                    message: 'Student group found',
                };
            } else {
                return {
                    isSuccess: false,
                    group: null,
                    message: 'The student is not assigned to any group in this category',
                };
            }
        } catch (e) {
            return {
                isSuccess: false,
                group: null,
                message: `Error finding student group: ${e}`,
            };
        }
    }
}