import { Group } from '../../domain/entities/group';
import { GroupDataSource } from './group.datasource';

const API_URL = 'http://192.168.1.6:3000/api';

export class GroupRemoteDataSourceImpl implements GroupDataSource {
  async getGroupsByCategory(categoryId: string): Promise<{ isSuccess: boolean; message: string; groups: Group[] }> {
    try {
      const response = await fetch(`${API_URL}/groups/category/${categoryId}`);
      
      if (!response.ok) {
        return {
          isSuccess: false,
          message: 'Error al obtener grupos',
          groups: [],
        };
      }

      const data = await response.json();
      const groups = (data.groups || []).map((g: any) => Group.fromJson(g));

      return {
        isSuccess: true,
        message: 'Grupos obtenidos exitosamente',
        groups,
      };
    } catch (error) {
      console.error('Error fetching groups:', error);
      return {
        isSuccess: false,
        message: 'Error de conexión',
        groups: [],
      };
    }
  }

  async createGroupsForCategory(
    courseId: string,
    categoryId: string,
    groupCount: number,
    studentsPerGroup: number,
    categoryName: string
  ): Promise<{ isSuccess: boolean; message: string }> {
    try {
      const response = await fetch(`${API_URL}/groups/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          categoryId,
          groupCount,
          studentsPerGroup,
          categoryName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          isSuccess: false,
          message: data.message || 'Error al crear grupos',
        };
      }

      return {
        isSuccess: true,
        message: 'Grupos creados exitosamente',
      };
    } catch (error) {
      console.error('Error creating groups:', error);
      return {
        isSuccess: false,
        message: 'Error de conexión',
      };
    }
  }

  async assignStudentToGroup(
    groupId: string,
    userId: string
  ): Promise<{ isSuccess: boolean; message: string }> {
    try {
      const response = await fetch(`${API_URL}/groups/${groupId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          isSuccess: false,
          message: data.message || 'Error al asignar estudiante',
        };
      }

      return {
        isSuccess: true,
        message: 'Estudiante asignado exitosamente',
      };
    } catch (error) {
      console.error('Error assigning student:', error);
      return {
        isSuccess: false,
        message: 'Error de conexión',
      };
    }
  }

  async moveStudentToGroup(
    toGroupId: string,
    studentId: string
  ): Promise<{ isSuccess: boolean; message: string }> {
    try {
      const response = await fetch(`${API_URL}/groups/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toGroupId,
          studentId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          isSuccess: false,
          message: data.message || 'Error al mover estudiante',
        };
      }

      return {
        isSuccess: true,
        message: 'Estudiante movido exitosamente',
      };
    } catch (error) {
      console.error('Error moving student:', error);
      return {
        isSuccess: false,
        message: 'Error de conexión',
      };
    }
  }

  async findStudentGroup(
    categoryId: string,
    studentId: string
  ): Promise<{ isSuccess: boolean; group?: Group }> {
    try {
      const response = await fetch(`${API_URL}/groups/find-student/${categoryId}/${studentId}`);
      
      if (!response.ok) {
        return {
          isSuccess: false,
        };
      }

      const data = await response.json();

      if (data.group) {
        return {
          isSuccess: true,
          group: Group.fromJson(data.group),
        };
      }

      return {
        isSuccess: true,
      };
    } catch (error) {
      console.error('Error finding student group:', error);
      return {
        isSuccess: false,
      };
    }
  }
}

