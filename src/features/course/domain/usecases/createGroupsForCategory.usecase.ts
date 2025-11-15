import { GroupRepository } from '../repositories/group.repository';

export class CreateGroupsForCategoryUseCase {
  constructor(private repository: GroupRepository) {}

  async execute(
    courseId: string,
    categoryId: string,
    groupCount: number,
    studentsPerGroup: number,
    categoryName: string
  ): Promise<{ isSuccess: boolean; message: string }> {
    return this.repository.createGroupsForCategory(courseId, categoryId, groupCount, studentsPerGroup, categoryName);
  }
}

