import { Category } from '../../domain/entities/category';
import { CategoryDataSource } from './category.datasource';

const API_URL = 'http://192.168.1.6:3000/api';

export class CategoryRemoteDataSourceImpl implements CategoryDataSource {
  async getCategories(courseId: string): Promise<Category[]> {
    try {
      const response = await fetch(`${API_URL}/courses/${courseId}/categories`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      return (data.categories || []).map((c: any) => Category.fromJson(c));
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async addCategory(
    courseId: string,
    name: string,
    groupingMethod: string,
    groupCount: number,
    studentsPerGroup: number
  ): Promise<{ isSuccess: boolean; message: string; category?: Category }> {
    try {
      const response = await fetch(`${API_URL}/courses/${courseId}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          groupingMethod,
          groupCount,
          studentsPerGroup,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          isSuccess: false,
          message: data.message || 'Error al crear la categoría',
        };
      }

      return {
        isSuccess: true,
        message: 'Categoría creada exitosamente',
        category: data.category ? Category.fromJson(data.category) : undefined,
      };
    } catch (error) {
      console.error('Error adding category:', error);
      return {
        isSuccess: false,
        message: 'Error de conexión',
      };
    }
  }

  async updateCategory(
    courseId: string,
    category: Category
  ): Promise<{ isSuccess: boolean; message: string }> {
    try {
      const response = await fetch(`${API_URL}/courses/${courseId}/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: category.name,
          groupingMethod: category.groupingMethod,
          groupCount: category.groupCount,
          studentsPerGroup: category.studentsPerGroup,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          isSuccess: false,
          message: data.message || 'Error al actualizar la categoría',
        };
      }

      return {
        isSuccess: true,
        message: 'Categoría actualizada exitosamente',
      };
    } catch (error) {
      console.error('Error updating category:', error);
      return {
        isSuccess: false,
        message: 'Error de conexión',
      };
    }
  }

  async deleteCategory(
    courseId: string,
    categoryId: string
  ): Promise<{ isSuccess: boolean; message: string }> {
    try {
      const response = await fetch(`${API_URL}/courses/${courseId}/categories/${categoryId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          isSuccess: false,
          message: data.message || 'Error al eliminar la categoría',
        };
      }

      return {
        isSuccess: true,
        message: 'Categoría eliminada exitosamente',
      };
    } catch (error) {
      console.error('Error deleting category:', error);
      return {
        isSuccess: false,
        message: 'Error de conexión',
      };
    }
  }
}

