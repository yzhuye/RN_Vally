import { Activity } from '../entities/activity';

export interface ActivityRepository {
    getActivitiesByCategory(categoryId: string): Promise<Activity[]>;
    getActivityById(activityId: string): Promise<Activity | null>;
    createActivity(name: string, description: string, dueDate: Date, categoryId: string): Promise<Activity | null>;
    updateActivity(activity: Activity, name: string, description: string, dueDate: Date): Promise<Activity | null>;
    deleteActivity(activityId: string): Promise<boolean>;
}