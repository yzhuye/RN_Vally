import { Activity } from "../../domain/entities/activity";

export interface ActivityDataSource {
    getActivitiesByCategory(categoryId: string): Promise<Activity[]>;
    getActivityById(activityId: string): Promise<Activity | null>;
    createActivity(name: string, description: string, dueDate: Date, categoryId: string): Promise<{ isSuccess: boolean; message: string; activity?: Activity }>;
    updateActivity(activity: Activity, name: string, description: string, dueDate: Date): Promise<{ isSuccess: boolean; message: string; activity?: Activity }>;
    deleteActivity(activityId: string): Promise<{ isSuccess: boolean; message: string }>;
}