import { Category } from '../../../category/domain/entities/category';

export interface CategoryDataSource {
  getCategories(courseId: string): Promise<Category[]>;
  addCategory(courseId: string, name: string, groupingMethod: string, groupCount: number, studentsPerGroup: number): Promise<{ isSuccess: boolean; message: string; category?: Category }>;
  updateCategory(courseId: string, category: Category): Promise<{ isSuccess: boolean; message: string }>;
  deleteCategory(courseId: string, categoryId: string): Promise<{ isSuccess: boolean; message: string }>;
}

