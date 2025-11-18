import { CategoryRepository } from '../repositories/category.repository';

export class DeleteCategoryUseCase {
  constructor(private repository: CategoryRepository) {}

  async execute(
    categoryId: string
  ): Promise<{ isSuccess: boolean; message: string }> {
    return this.repository.deleteCategory(categoryId);
  }
}

