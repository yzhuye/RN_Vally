import { GroupRepository } from "../repositories/group.repository";

export interface CreateGroupsForCategoryResponse {
    isSuccess: boolean;
    message: string;
}

export class CreateGroupsForCategoryUseCase {
    private repository: GroupRepository;
    constructor(repository: GroupRepository) {
        this.repository = repository;
    }
    async execute(categoryId: string, groupCount: number, studentsPerGroup: number, categoryName: string): Promise<CreateGroupsForCategoryResponse> {
        try {
            await this.repository.createGroupsForCategory(categoryId, groupCount, studentsPerGroup, categoryName);
            return {
                isSuccess: true,
                message: 'Groups created successfully for the category',
            };
        } catch (e) {
            return {
                isSuccess: false,
                message: `Error creating groups: ${e}`,
            };
        }
    }
}