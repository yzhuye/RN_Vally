import { GroupRepository } from '../repositories/group.repository';

export class AssignStudentToGroupUseCase {
  constructor(private repository: GroupRepository) {}

  async execute(groupId: string, userId: string): Promise<{ isSuccess: boolean; message: string }> {
    return this.repository.assignStudentToGroup(groupId, userId);
  }
}

