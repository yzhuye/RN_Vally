import { Group } from '../entities/group';
import { GroupRepository } from '../repositories/group.repository';

export class GetGroupsByCategoryUseCase {
  constructor(private repository: GroupRepository) {}

  async execute(categoryId: string): Promise<{ isSuccess: boolean; message: string; groups: Group[] }> {
    return this.repository.getGroupsByCategory(categoryId);
  }
}

