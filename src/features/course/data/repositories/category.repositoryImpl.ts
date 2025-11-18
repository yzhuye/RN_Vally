import { Category } from '../../domain/entities/category';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { CategoryDataSource } from '../datasources/category.datasource';

export class CategoryRepositoryImpl implements CategoryRepository {
  constructor(private dataSource: CategoryDataSource) {}

  async getCategories(courseId: string): Promise<Category[]> {
    return this.dataSource.getCategories(courseId);
  }

  async addCategory(
    courseId: string,
    name: string,
    groupingMethod: string,
    groupCount: number,
    studentsPerGroup: number
  ): Promise<{ isSuccess: boolean; message: string; category?: Category }> {
    return this.dataSource.addCategory(courseId, name, groupingMethod, groupCount, studentsPerGroup);
  }

  async updateCategory(
    courseId: string,
    category: Category
  ): Promise<{ isSuccess: boolean; message: string }> {
    return this.dataSource.updateCategory(courseId, category);
  }

  async deleteCategory(
    courseId: string,
    categoryId: string
  ): Promise<{ isSuccess: boolean; message: string }> {
    return this.dataSource.deleteCategory(courseId, categoryId);
  }
}

