import { EvaluationRepository } from "../repositories/evaluation.repository";

export class GetActivityEvaluationStatsUseCase {
    constructor(private readonly repository: EvaluationRepository) {}

    async execute(activityId: string): Promise<GetActivityEvaluationStatsResult> {
        try {
            const stats = await this.repository.getActivityEvaluationStats(activityId);
            return GetActivityEvaluationStatsResult.success(stats);
        } catch (e) {
            return GetActivityEvaluationStatsResult.failure(`Error al obtener estadísticas: ${e}`);
        }
    }
}

export class GetActivityEvaluationStatsResult {
    private constructor(
        public readonly isSuccess: boolean,
        public readonly message: string | null,
        public readonly stats: Record<string, any>,
    ) {}
    static success(stats: Record<string, any>): GetActivityEvaluationStatsResult {
        return new GetActivityEvaluationStatsResult(true, null, stats);
    }
    static failure(message: string): GetActivityEvaluationStatsResult {
        return new GetActivityEvaluationStatsResult(false, message, {});
    }
}