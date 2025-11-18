import { Group } from '../../domain/entities/group';

export interface GroupDataSource {
  getGroupsByCategory(categoryId: string): Promise<{ isSuccess: boolean; message: string; groups: Group[] }>;
  createGroupsForCategory(courseId: string, categoryId: string, groupCount: number, studentsPerGroup: number, categoryName: string): Promise<{ isSuccess: boolean; message: string }>;
  assignStudentToGroup(groupId: string, userId: string): Promise<{ isSuccess: boolean; message: string }>;
  moveStudentToGroup(toGroupId: string, studentId: string): Promise<{ isSuccess: boolean; message: string }>;
  findStudentGroup(categoryId: string, studentId: string): Promise<{ isSuccess: boolean; group?: Group }>;
}

