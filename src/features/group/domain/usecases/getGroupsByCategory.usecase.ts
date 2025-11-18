import { GroupRepository } from "../repositories/group.repository";

export interface GetGroupsByCategoryResponse {
    isSuccess: boolean;
    groups: any[];
    message: string;
}

export class GetGroupsByCategoryUseCase {
    private repository: GroupRepository
    constructor(repository: GroupRepository) {
        this.repository = repository;
    }
    async execute(categoryId: string): Promise<GetGroupsByCategoryResponse> {
        try {
            const groups = await this.repository.getGroupsByCategory(categoryId);
            return {
                isSuccess: true,
                groups: groups,
                message: 'Groups loaded successfully',
            };
        } catch (e) {
            return {
                isSuccess: false,
                groups: [],
                message: `Error loading groups: ${e}`,
            };
        }
    }
}