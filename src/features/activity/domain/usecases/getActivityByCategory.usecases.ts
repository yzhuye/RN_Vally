import { Activity } from '../entities/activity';
import { ActivityRepository } from '../repositories/activity.repository';

export class GetActivitiesByCategoryUseCase {
    constructor(private readonly repository: ActivityRepository) {}

    async execute(categoryId: string): Promise<GetActivitiesResult> {
        try {
            const activities = await this.repository.getActivitiesByCategory(categoryId);

            // Sort by due date (earliest first)
            activities.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

            return GetActivitiesResult.success(activities);
        } catch (error) {
            return GetActivitiesResult.failure(`Error fetching activities: ${error}`);
        }
    }
}

export class GetActivitiesResult {
    public readonly isSuccess: boolean;
    public readonly message?: string;
    public readonly activities: Activity[];

    private constructor(isSuccess: boolean, activities: Activity[], message?: string) {
        this.isSuccess = isSuccess;
        this.activities = activities;
        this.message = message;
    }

    static success(activities: Activity[]): GetActivitiesResult {
        return new GetActivitiesResult(true, activities);
    }

    static failure(message: string): GetActivitiesResult {
        return new GetActivitiesResult(false, [], message);
    }
}