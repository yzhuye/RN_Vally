import { Category } from '../entities/category';
import { CategoryRepository } from '../repositories/category.repository';

export class AddCategoryUseCase {
  constructor(private repository: CategoryRepository) {}

  async execute(
    courseId: string,
    name: string,
    groupingMethod: string,
    groupCount: number,
    studentsPerGroup: number
  ): Promise<{ isSuccess: boolean; message: string; category?: Category }> {
    return this.repository.addCategory(courseId, name, groupingMethod, groupCount, studentsPerGroup);
  }
}

