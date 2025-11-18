import { GroupRepository } from "../repositories/group.repository";

export interface JoinGroupResponse {
    isSuccess: boolean;
    message: string;
}

export class JoinGroupUseCase {
    private repository: GroupRepository
    constructor(repository: GroupRepository) {
        this.repository = repository;
    }

    async execute(groupId: string, studentId: string): Promise<JoinGroupResponse> {
        try {
            const success = await this.repository.joinGroup(studentId, groupId);
            if (success) {
                return {
                    isSuccess: true,
                    message: 'Successfully joined the group',
                };
            } else {
                return {
                    isSuccess: false,
                    message: 'Could not join the group. It may be full or you may already be in it.',
                };
            }
        } catch (e) {
            return {
                isSuccess: false,
                message: `Error joining group: ${e}`,
            };
        }
    }
}