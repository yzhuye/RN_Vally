import { Group } from "../../domain/entities/group";
import { GroupRepository } from "../../domain/repositories/group.repository";
import { GroupDataSource } from "../datasources/group.datasource";

export class GroupRepositoryImpl implements GroupRepository {
  private dataSource: GroupDataSource;
    constructor(dataSource: GroupDataSource) {
        this.dataSource = dataSource;
    }

    async getGroupsByCategory(categoryId: string): Promise<Group[]> {
        return this.dataSource.getGroupsByCategory(categoryId);
    }
    
    async addGroup(name: string, maxCapacity: number, categoryId: string): Promise<Group | null> {
        return this.dataSource.addGroup(name, maxCapacity, categoryId);
    }

    async joinGroup(userId: string, groupId: string): Promise<boolean> {
        return this.dataSource.joinGroup(userId, groupId);
    }

    async leaveGroup(userId: string, groupId: string): Promise<boolean> {
        return this.dataSource.leaveGroup(userId, groupId);
    }

    async createGroupsForCategory(categoryId: string, groupCount: number, studentsPerGroup: number, categoryName?: string): Promise<void> {
        return this.dataSource.createGroupsForCategory(categoryId, groupCount, studentsPerGroup, categoryName);
    }
    
    async assignStudentToGroup(userId: string, newGroupId: string): Promise<boolean> {
        return this.dataSource.assignStudentToGroup(userId, newGroupId);
    }

    async findStudentGroup(categoryId: string, studentId: string): Promise<Group | null> {
        return this.dataSource.findStudentGroup(categoryId, studentId);
    }
}