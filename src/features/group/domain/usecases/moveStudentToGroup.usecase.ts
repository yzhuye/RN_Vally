import { GroupRepository } from "../repositories/group.repository";

export interface MoveStudentToGroupResponse {
    isSuccess: boolean;
    message: string;
}

export class MoveStudentToGroupUseCase {
    private repository: GroupRepository
    constructor(repository: GroupRepository) {
        this.repository = repository;
    }

    async execute(studentId: string, toGroupId: string): Promise<MoveStudentToGroupResponse> {
        try {
            const success = await this.repository.assignStudentToGroup(studentId, toGroupId);
            if (success) {
                return {
                    isSuccess: true,
                    message: 'Student successfully moved to the new group',
                };
            } else {
                return {
                    isSuccess: false,
                    message: 'Could not move student. The destination group may be full.',
                };
            }
        } catch (e) {
            return {
                isSuccess: false,
                message: `Error moving student: ${e}`,
            };
        }
    }
}