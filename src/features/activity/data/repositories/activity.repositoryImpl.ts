import { Activity } from "../../domain/entities/activity";
import { ActivityRepository } from "../../domain/repositories/activity.repository";
import { ActivityDataSource } from "../datasources/activity.datasource";

export class ActivityRepositoryImpl implements ActivityRepository {
    private dataSource: ActivityDataSource;

    constructor(dataSource: ActivityDataSource) {
        this.dataSource = dataSource;
    }

    async getActivitiesByCategory(categoryId: string): Promise<Activity[]> {
        return this.dataSource.getActivitiesByCategory(categoryId);
    }

    async getActivityById(activityId: string): Promise<Activity | null> {
        return this.dataSource.getActivityById(activityId);
    }

    async createActivity(name: string, description: string, dueDate: Date, categoryId: string): Promise<Activity | null> {
        return this.dataSource.createActivity(name, description, dueDate, categoryId);
    }

    async updateActivity(activity: Activity, name: string, description: string, dueDate: Date): Promise<Activity | null> {
        return this.dataSource.updateActivity(activity, name, description, dueDate);
    }

    async deleteActivity(activityId: string): Promise<boolean> {
        return this.dataSource.deleteActivity(activityId);
    }
}