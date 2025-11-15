import { Group } from '../../domain/entities/group';
import { GroupRepository } from '../../domain/repositories/group.repository';
import { GroupDataSource } from '../datasources/group.datasource';

export class GroupRepositoryImpl implements GroupRepository {
  constructor(private dataSource: GroupDataSource) {}

  async getGroupsByCategory(categoryId: string): Promise<{ isSuccess: boolean; message: string; groups: Group[] }> {
    return this.dataSource.getGroupsByCategory(categoryId);
  }

  async createGroupsForCategory(
    courseId: string,
    categoryId: string,
    groupCount: number,
    studentsPerGroup: number,
    categoryName: string
  ): Promise<{ isSuccess: boolean; message: string }> {
    return this.dataSource.createGroupsForCategory(courseId, categoryId, groupCount, studentsPerGroup, categoryName);
  }

  async assignStudentToGroup(groupId: string, userId: string): Promise<{ isSuccess: boolean; message: string }> {
    return this.dataSource.assignStudentToGroup(groupId, userId);
  }

  async moveStudentToGroup(toGroupId: string, studentId: string): Promise<{ isSuccess: boolean; message: string }> {
    return this.dataSource.moveStudentToGroup(toGroupId, studentId);
  }

  async findStudentGroup(categoryId: string, studentId: string): Promise<{ isSuccess: boolean; group?: Group }> {
    return this.dataSource.findStudentGroup(categoryId, studentId);
  }
}

