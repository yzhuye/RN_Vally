import { Category } from '../entities/category';

export interface CategoryRepository {
  getCategories(courseId: string): Promise<Category[]>;
  addCategory(courseId: string, name: string, groupingMethod: string, groupCount: number, studentsPerGroup: number): Promise<{ isSuccess: boolean; message: string; category?: Category }>;
  updateCategory(category: Category): Promise<{ isSuccess: boolean; message: string }>;
  deleteCategory(categoryId: string): Promise<{ isSuccess: boolean; message: string }>;
}

