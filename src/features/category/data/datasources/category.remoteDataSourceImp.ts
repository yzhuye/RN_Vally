import { ILocalPreferences } from '../../../../core/iLocalPreferences';
import { LocalPreferencesAsyncStorage } from '../../../../core/LocalPreferencesAsyncStorage';
import { Category } from '../../domain/entities/category';
import { CategoryDataSource } from './category.datasource';

const projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID;
const API_URL = `https://roble-api.openlab.uninorte.edu.co/database/${projectId}`;

export class CategoryRemoteDataSourceImpl implements CategoryDataSource {

  private prefs: ILocalPreferences;

  constructor() {
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
  }

  async getCategories(courseId: string): Promise<Category[]> {
    try {
      const token = await this.prefs.retrieveData<string>("token");
      const response = await fetch(`${API_URL}/read?tableName=categories&course_id=${courseId}`,{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      const result = (data || []).map((c: any) => Category.fromJson(c));
      return result;
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
      const token = await this.prefs.retrieveData<string>("token");
      const response = await fetch(`${API_URL}/insert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tableName : 'categories',
          records: [
            {
              name,
              groupingMethod,
              groupCount,
              studentsPerGroup,
              course_id: courseId
            }
          ]
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
        category: data.inserted[0] ? Category.fromJson(data.inserted[0]) : undefined,
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
    category: Category
  ): Promise<{ isSuccess: boolean; message: string }> {
    try {
      const token = await this.prefs.retrieveData<string>("token");
      const response = await fetch(`${API_URL}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tableName: 'categories',
          idColumn: '_id',
          idValue: category.id,
          updates: {
            name: category.name,
            groupingMethod: category.groupingMethod,
            groupCount: category.groupCount,
            studentsPerGroup: category.studentsPerGroup,
          },
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
    categoryId: string
  ): Promise<{ isSuccess: boolean; message: string }> {
    try {
      const token = await this.prefs.retrieveData<string>("token");
      const response = await fetch(`${API_URL}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tableName: 'categories',
          idColumn: '_id',
          idValue: categoryId,
        }),
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
