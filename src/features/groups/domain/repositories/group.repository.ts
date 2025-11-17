import { Group } from "../entities/group";

export interface GroupRepository {
    getGroupsByCategory(categoryId: string): Promise<Group[]>;
    addGroup(name: string, maxCapacity: number, categoryId: string): Promise<Group | null>;
    joinGroup(userId: string, groupId: string): Promise<boolean>;
    leaveGroup(userId: string, groupId: string): Promise<boolean>;
    createGroupsForCategory(categoryId: string, groupCount: number, studentsPerGroup: number, categoryName?: string): Promise<void>;
    assignStudentToGroup(userId: string, newGroupId: string): Promise<boolean>;
    findStudentGroup(categoryId: string, studentId: string): Promise<Group | null>;
}
