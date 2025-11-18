import { Category } from '../entities/category';
import { CategoryRepository } from '../repositories/category.repository';

export class GetCategoriesUseCase {
  constructor(private repository: CategoryRepository) {}

  async execute(courseId: string): Promise<Category[]> {
    return this.repository.getCategories(courseId);
  }
}

