import { Category } from '../entities/category';
import { CategoryRepository } from '../repositories/category.repository';

export class UpdateCategoryUseCase {
  constructor(private repository: CategoryRepository) {}

  async execute(
    category: Category
  ): Promise<{ isSuccess: boolean; message: string }> {
    return this.repository.updateCategory(category);
  }
}
