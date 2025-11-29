import { Activity } from '../entities/activity';
import { ActivityRepository } from '../repositories/activity.repository';

export class GetActivityByIdUseCase {
    constructor(private readonly repository: ActivityRepository) {}

    async execute(activityId: string): Promise<GetActivityByIdResult> {
        try {
            const activity = await this.repository.getActivityById(activityId);
            
            if (!activity) {
                return GetActivityByIdResult.failure('Activity not found.');
            }
            
            return GetActivityByIdResult.success(activity);
        } catch (error) {
            return GetActivityByIdResult.failure(`Error fetching activity: ${error}`);
        }
    }
}

export class GetActivityByIdResult {
    public readonly isSuccess: boolean;
    public readonly message?: string;
    public readonly activity?: Activity;

    private constructor(isSuccess: boolean, activity?: Activity, message?: string) {
        this.isSuccess = isSuccess;
        this.activity = activity;
        this.message = message;
    }

    static success(activity: Activity): GetActivityByIdResult {
        return new GetActivityByIdResult(true, activity);
    }

    static failure(message: string): GetActivityByIdResult {
        return new GetActivityByIdResult(false, undefined, message);
    }
}