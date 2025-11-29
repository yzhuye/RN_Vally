import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceImp";
import { Activity } from "../../domain/entities/activity";
import { ActivityDataSource } from "./activity.datasource";

export class ActivityRemoteDataSourceImpl implements ActivityDataSource {
    private readonly projectId: string;
    private readonly baseUrl: string;
    private readonly activityTable = "activities";
    
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

    async getActivitiesByCategory(categoryId: string): Promise<Activity[]> {
        const url = new URL(`${this.baseUrl}/read`);
        url.searchParams.append("tableName", this.activityTable);
        url.searchParams.append("categoryId", categoryId);

        const response = await this.authorizedFetch(url.toString(), {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch activities: ${response.statusText}`);
        }

        const data = await response.json();

        return data.map((row: any) => new Activity(
            row._id,
            row.name,
            row.description,
            new Date(row.dueDate),
            row.categoryId,
            row.evaluations || []
        ));
    }

    async getActivityById(activityId: string): Promise<Activity | null> {
        const url = new URL(`${this.baseUrl}/read`);
        url.searchParams.append("tableName", this.activityTable);
        url.searchParams.append("_id", activityId);

        const response = await this.authorizedFetch(url.toString(), {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch activity: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.length === 0) {
            return null;
        }

        const row = data[0];
        return new Activity(
            row._id,
            row.name,
            row.description,
            new Date(row.dueDate),
            row.categoryId,
            row.evaluations || []
        );
    }

    async createActivity(name: string, description: string, dueDate: Date, categoryId: string): Promise<Activity | null> {
        const url = `${this.baseUrl}/insert`;
        const body = {
            tableName: this.activityTable,
            records: [
                {
                    name,
                    description,
                    dueDate: dueDate.toISOString(),
                    categoryId,
                },
            ],
        };

        const response = await this.authorizedFetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`Failed to create activity: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.length === 0) {
            return null;
        }

        const row = data[0];
        return new Activity(
            row._id,
            name,
            description,
            dueDate,
            categoryId,
            row.evaluations || []
        );
    } 

    async updateActivity(activity: Activity, name: string, description: string, dueDate: Date): Promise<Activity | null> {
        const url = `${this.baseUrl}/update`;
        const body = {
            tableName: this.activityTable,
            idColumn: "_id",
            idValue: activity.id,
            updates: {
                name,
                description,
                dueDate: dueDate.toISOString(),
            },
        };

        const response = await this.authorizedFetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`Failed to update activity: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.length === 0) {
            return null;
        }

        const row = data[0];
        return new Activity(
            row._id,
            name,
            description,
            dueDate,
            activity.categoryId,
            row.evaluations || []
        );
    }

    async deleteActivity(activityId: string): Promise<boolean> {
        const url = `${this.baseUrl}/delete`;
        const body = {
            tableName: this.activityTable,
            idColumn: "_id",
            idValue: activityId,
        };

        const response = await this.authorizedFetch(url, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`Failed to delete activity: ${response.statusText}`);
        }

        const data = await response.json();
        return data._id === activityId;
    }
}