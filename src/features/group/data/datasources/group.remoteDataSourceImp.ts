import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceImp";
import { Group } from "../../domain/entities/group";
import { GroupDataSource } from "./group.datasource";

export class GroupRemoteDataSourceImpl implements GroupDataSource {
  private readonly projectId: string;
  private readonly baseUrl: string;
  private readonly groupsTable = "groups";
  private readonly userGroupsTable = "user_groups";

  private prefs: ILocalPreferences;

  constructor(
    private authService: AuthRemoteDataSourceImpl,
    projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID
  ) {
    if (!projectId) {
      throw new Error("Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var");
    }
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
    this.projectId = projectId;
    this.baseUrl = `https://roble-api.openlab.uninorte.edu.co/database/${this.projectId}`;
  }

  private async authorizedFetch(
    url: string,
    options: RequestInit,
    retry = true
  ): Promise<Response> {
    const token = await this.prefs.retrieveData<string>("token");
    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 && retry) {
      console.warn("401 detected, trying to refresh token…");
      try {
        const refreshed = await this.authService.refreshToken();
        if (refreshed) {
          // retry with new token
          const newToken = await this.prefs.retrieveData<string>("token");
          const retryHeaders = {
            ...(options.headers || {}),
            Authorization: `Bearer ${newToken}`,
          };
          return await fetch(url, { ...options, headers: retryHeaders });
        }
      } catch (e) {
        console.error("Token refresh failed, forcing logout", e);
        // optional: trigger logout flow here
      }
    }

    return response;
  }

  private mapToGroup(data: any): Group {
    // Ajusta el constructor si tu entidad Group tiene otra firma
    return new Group(
      data._id,
      data.name,
      parseInt(data.maxCapacity ?? data.max_capacity ?? 0, 10),
      parseInt(data.currentCapacity ?? data.current_capacity ?? 0, 10),
      data.members ?? data.memberEmails ?? [],
      data.categoryId ?? data.category_id ?? ""
    );
  }

  private async resolveUserId(candidate: string): Promise<string> {
    // Si ya parece un id (no contiene @), trata de buscar por _id,
    // si contiene '@' busca por email y devuelve el _id.
    try {
      if (candidate.includes("@")) {
        const byEmailResp = await this.authorizedFetch(
          `${this.baseUrl}/read?tableName=users&email=${encodeURIComponent(candidate)}`,
          { method: "GET" }
        );
        if (byEmailResp.status === 200) {
          const users = await byEmailResp.json();
          if (Array.isArray(users) && users.length > 0) {
            return users[0]._id;
          }
        }
        throw new Error("User not found by email");
      } else {
        // try by _id
        const byIdResp = await this.authorizedFetch(
          `${this.baseUrl}/read?tableName=users&_id=${encodeURIComponent(candidate)}`,
          { method: "GET" }
        );
        if (byIdResp.status === 200) {
          const users = await byIdResp.json();
          if (Array.isArray(users) && users.length > 0) {
            return users[0]._id;
          }
        }

        // fallback: maybe candidate is a username (no @). Try username -> email lookup
        const byUsernameResp = await this.authorizedFetch(
          `${this.baseUrl}/read?tableName=users&username=${encodeURIComponent(candidate)}`,
          { method: "GET" }
        );
        if (byUsernameResp.status === 200) {
          const users = await byUsernameResp.json();
          if (Array.isArray(users) && users.length > 0) {
            return users[0]._id;
          }
        }

        throw new Error("User not found by id/username");
      }
    } catch (e) {
      throw new Error(`Unable to resolve user id: ${(e as Error).message}`);
    }
  }

  private async getGroupMembers(groupId: string): Promise<string[]> {
    try {
      const url = `${this.baseUrl}/read?tableName=${this.userGroupsTable}&group_id=${encodeURIComponent(groupId)}`;
      const resp = await this.authorizedFetch(url, { method: "GET" });
      if (resp.status !== 200) return [];

      const relations = await resp.json();
      const members: string[] = [];

      for (const rel of relations) {
        const userId = rel.user_id;
        if (!userId) continue;

        // obtain user info
        const userResp = await this.authorizedFetch(
          `${this.baseUrl}/read?tableName=users&_id=${encodeURIComponent(userId)}`,
          { method: "GET" }
        );
        if (userResp.status === 200) {
          const users = await userResp.json();
          if (Array.isArray(users) && users.length > 0) {
            const u = users[0];
            // push email if available, else username or original id
            members.push(u.email ?? u.username ?? userId);
          } else {
            members.push(userId);
          }
        } else {
          members.push(userId);
        }
      }

      return members;
    } catch (e) {
      console.warn("getGroupMembers failed:", e);
      return [];
    }
  }

  async getGroupsByCategory(categoryId: string): Promise<Group[]> {
    const url = `${this.baseUrl}/read?tableName=${this.groupsTable}&categoryId=${encodeURIComponent(categoryId)}`;
    const response = await this.authorizedFetch(url, { method: "GET" });

    if (!response.ok) {
      if (response.status === 401) throw new Error("Unauthorized (token issue)");
      throw new Error(`Error fetching groups: ${response.status}`);
    }


    const data = await response.json();

    const groupsWithMembers = await Promise.all(
      data.map(async (g: any) => {
        try {
          const members = await this.getGroupMembers(g._id);
          g.members = members;
        } catch (e) {
          g.members = g.members ?? [];
        }
        return this.mapToGroup(g);
      })
    );

    return groupsWithMembers;
  }

  async addGroup(name: string, maxCapacity: number, categoryId: string): Promise<Group | null> {
    const url = `${this.baseUrl}/insert`;
    const body = JSON.stringify({
      tableName: this.groupsTable,
      records: [
        {
          name,
          maxCapacity,
          currentCapacity: 0,
          categoryId,
        },
      ],
    });

    const response = await this.authorizedFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (response.status === 200 || response.status === 201) {
      const data = await response.json();

      // Roble API puede retornar objeto o lista; tratar ambos casos
      const record = Array.isArray(data) ? data[0] : data.inserted?.[0] ?? data;
      if (!record) return null;

      // Obtener miembros (probablemente vacío) y mapear
      record.members = await this.getGroupMembers(record._id);
      return this.mapToGroup(record);
    } else if (response.status === 401) {
      throw new Error("Unauthorized (token issue)");
    } else {
      const errText = await response.text().catch(() => "");
      throw new Error(`Error creating group: ${response.status} ${errText}`);
    }
  }

  async joinGroup(userId: string, groupId: string): Promise<boolean> {
    try {
      const resolvedUserId = await this.resolveUserId(userId);

      // First: get group to check capacities
      const getGroupResp = await this.authorizedFetch(
        `${this.baseUrl}/read?tableName=${this.groupsTable}&_id=${encodeURIComponent(groupId)}`,
        { method: "GET" }
      );
      if (getGroupResp.status !== 200) throw new Error(`Error obtaining group: ${getGroupResp.status}`);
      const groupData = await getGroupResp.json();
      if (!Array.isArray(groupData) || groupData.length === 0) throw new Error("Group not found");

      const group = groupData[0];
      const maxCapacity = parseInt(group.maxCapacity ?? group.max_capacity ?? 0, 10);
      const currentCapacity = parseInt(group.currentCapacity ?? group.current_capacity ?? 0, 10);

      if (currentCapacity >= maxCapacity) {
        return false; // full
      }

      // Insert relation into user_groups
      const insertUrl = `${this.baseUrl}/insert`;
      const insertBody = JSON.stringify({
        tableName: this.userGroupsTable,
        records: [
          {
            user_id: resolvedUserId,
            group_id: groupId,
          },
        ],
      });

      const insertResp = await this.authorizedFetch(insertUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: insertBody,
      });

      if (insertResp.status !== 200 && insertResp.status !== 201) {
        throw new Error(`Error inserting user_groups: ${insertResp.status}`);
      }

      // Update group's currentCapacity
      const updateUrl = `${this.baseUrl}/update`;
      const newCapacity = currentCapacity + 1;
      const updateBody = JSON.stringify({
        tableName: this.groupsTable,
        idColumn: "_id",
        idValue: groupId,
        updates: {
          currentCapacity: newCapacity,
        },
      });

      const updateResp = await this.authorizedFetch(updateUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: updateBody,
      });

      return updateResp.status === 200;
    } catch (e) {
      console.error("joinGroup error:", e);
      throw e;
    }
  }

  async leaveGroup(userId: string, groupId: string): Promise<boolean> {
    try {
      const resolvedUserId = await this.resolveUserId(userId);

      // Get group to read currentCapacity
      const getGroupResp = await this.authorizedFetch(
        `${this.baseUrl}/read?tableName=${this.groupsTable}&_id=${encodeURIComponent(groupId)}`,
        { method: "GET" }
      );
      if (getGroupResp.status !== 200) throw new Error(`Error obtaining group: ${getGroupResp.status}`);
      const groupData = await getGroupResp.json();
      if (!Array.isArray(groupData) || groupData.length === 0) throw new Error("Group not found");

      const group = groupData[0];
      const currentCapacity = parseInt(group.currentCapacity ?? group.current_capacity ?? 0, 10);
      const newCapacity = currentCapacity > 0 ? currentCapacity - 1 : 0;

      // Find the user_groups relation
      const readRelResp = await this.authorizedFetch(
        `${this.baseUrl}/read?tableName=${this.userGroupsTable}&user_id=${encodeURIComponent(resolvedUserId)}&group_id=${encodeURIComponent(groupId)}`,
        { method: "GET" }
      );

      if (readRelResp.status !== 200) throw new Error(`Error searching user_groups: ${readRelResp.status}`);
      const relData = await readRelResp.json();
      if (!Array.isArray(relData) || relData.length === 0) {
        return false; // user not in group
      }

      const relationId = relData[0]._id;

      // Delete the relation
      const deleteUrl = `${this.baseUrl}/delete`;
      const deleteBody = JSON.stringify({
        tableName: this.userGroupsTable,
        idColumn: "_id",
        idValue: relationId,
      });

      const deleteResp = await this.authorizedFetch(deleteUrl, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: deleteBody,
      });

      if (deleteResp.status !== 200 && deleteResp.status !== 201) {
        throw new Error(`Error deleting user_group relation: ${deleteResp.status}`);
      }

      // Update group's capacity
      const updateUrl = `${this.baseUrl}/update`;
      const updateBody = JSON.stringify({
        tableName: this.groupsTable,
        idColumn: "_id",
        idValue: groupId,
        updates: {
          currentCapacity: newCapacity,
        },
      });

      const updateResp = await this.authorizedFetch(updateUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: updateBody,
      });

      return updateResp.status === 200;
    } catch (e) {
      console.error("leaveGroup error:", e);
      throw e;
    }
  }

  async createGroupsForCategory(categoryId: string, groupCount: number, studentsPerGroup: number, categoryName?: string): Promise<void> {
    for (let i = 1; i <= groupCount; i++) {
      const name = categoryName ? `${categoryName} - Grupo ${i}` : `Grupo ${i}`;
      // ignore returned value
      await this.addGroup(name, studentsPerGroup, categoryId);
    }
  }

  async assignStudentToGroup(userId: string, newGroupId: string): Promise<boolean> {
    try {
      const resolvedUserId = await this.resolveUserId(userId);

      // Get new group and its category
      const newGroupResp = await this.authorizedFetch(
        `${this.baseUrl}/read?tableName=${this.groupsTable}&_id=${encodeURIComponent(newGroupId)}`,
        { method: "GET" }
      );
      if (newGroupResp.status !== 200) throw new Error(`Error obtaining new group: ${newGroupResp.status}`);
      const newGroupData = await newGroupResp.json();
      if (!Array.isArray(newGroupData) || newGroupData.length === 0) throw new Error("New group not found");
      const newGroup = newGroupData[0];
      const categoryId = newGroup.categoryId ?? newGroup.category_id;

      // Get all user_groups relations for this user
      const userGroupsResp = await this.authorizedFetch(
        `${this.baseUrl}/read?tableName=${this.userGroupsTable}&user_id=${encodeURIComponent(resolvedUserId)}`,
        { method: "GET" }
      );
      if (userGroupsResp.status !== 200) throw new Error(`Error fetching user groups: ${userGroupsResp.status}`);
      const userGroups = await userGroupsResp.json();

      // Find old group in same category
      let oldGroupId: string | null = null;
      for (const ug of userGroups) {
        const gId = ug.group_id;
        const relatedGroupResp = await this.authorizedFetch(
          `${this.baseUrl}/read?tableName=${this.groupsTable}&_id=${encodeURIComponent(gId)}`,
          { method: "GET" }
        );
        if (relatedGroupResp.status === 200) {
          const relatedGroupData = await relatedGroupResp.json();
          if (Array.isArray(relatedGroupData) && relatedGroupData.length > 0) {
            const relatedGroup = relatedGroupData[0];
            const relCategoryId = relatedGroup.categoryId ?? relatedGroup.category_id;
            if (relCategoryId === categoryId) {
              oldGroupId = gId;
              break;
            }
          }
        }
      }

      if (oldGroupId) {
        const left = await this.leaveGroup(resolvedUserId, oldGroupId);
        if (!left) return false;
      }

      const joined = await this.joinGroup(resolvedUserId, newGroupId);
      return joined;
    } catch (e) {
      console.error("assignStudentToGroup error:", e);
      return false;
    }
  }

  async findStudentGroup(categoryId: string, studentId: string): Promise<Group | null> {
    try {
      const resolvedUserId = await this.resolveUserId(studentId);

      // Fetch groups for category
      const groups = await this.getGroupsByCategory(categoryId);
      if (!groups || groups.length === 0) return null;

      // Fetch user_groups relations for this user
      const readUserGroupsUrl = `${this.baseUrl}/read?tableName=${this.userGroupsTable}&user_id=${encodeURIComponent(resolvedUserId)}`;
      const userGroupsResp = await this.authorizedFetch(readUserGroupsUrl, { method: "GET" });
      if (userGroupsResp.status !== 200) throw new Error(`Error fetching user groups: ${userGroupsResp.status}`);
      const userGroups = await userGroupsResp.json();
      if (!Array.isArray(userGroups) || userGroups.length === 0) return null;

      const userGroupIds = new Set(userGroups.map((ug: any) => ug.group_id?.toString()).filter(Boolean));

      for (const g of groups) {
        if (userGroupIds.has(g.id ?? (g as any)._id)) {
          return g;
        }
      }

      return null;
    } catch (e) {
      console.error("findStudentGroup error:", e);
      return null;
    }
  }
}