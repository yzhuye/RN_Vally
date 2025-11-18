import { Group } from '../entities/group';
import { GroupRepository } from '../repositories/group.repository';

export class FindStudentGroupUseCase {
  constructor(private repository: GroupRepository) {}

  async execute(categoryId: string, studentId: string): Promise<{ isSuccess: boolean; group?: Group }> {
    return this.repository.findStudentGroup(categoryId, studentId);
  }
}

