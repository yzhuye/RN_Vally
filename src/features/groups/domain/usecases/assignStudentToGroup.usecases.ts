import { GroupRepository } from "../repositories/group.repository";

export class AssignStudentToGroupUseCase {
  private repository: GroupRepository;
    constructor(repository: GroupRepository) {
        this.repository = repository;
    }

    async execute(userId: string, newGroupId: string): Promise<{ isSuccess: boolean; message: string }> {
        try {
            const success = await this.repository.assignStudentToGroup(userId, newGroupId);
            if (success) {
                return {
                    isSuccess: true,
                    message: 'Student successfully assigned to the group',
                };
            } else {
                return {
                    isSuccess: false,
                    message: 'Could not assign student. The group may be full.',
                };
            }
        } catch (e) {
            return {
                isSuccess: false,
                message: `Error assigning student: ${e}`,
            };
        }
    }
}