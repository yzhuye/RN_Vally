import { GroupRepository } from '../repositories/group.repository';

export class MoveStudentToGroupUseCase {
  constructor(private repository: GroupRepository) {}

  async execute(toGroupId: string, studentId: string): Promise<{ isSuccess: boolean; message: string }> {
    return this.repository.moveStudentToGroup(toGroupId, studentId);
  }
}

