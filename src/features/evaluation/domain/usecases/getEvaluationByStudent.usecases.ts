import { Evaluation } from "../entities/evaluation";
import { EvaluationRepository } from "../repositories/evaluation.repository";

export class GetEvaluationsByStudentUseCase {
    constructor(private readonly repository: EvaluationRepository) {}

    async execute(evaluatedId: string): Promise<GetEvaluationsByStudentResult> {
        try {
            const evaluations = await this.repository.getEvaluationsByStudent(evaluatedId);
            // Sort by creation date (most recent first)
            evaluations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            // Calculate statistics
            const stats = this._calculateStats(evaluations);
            return GetEvaluationsByStudentResult.success(evaluations, stats);
        }
        catch (e) {
            return GetEvaluationsByStudentResult.failure(`Error al obtener evaluaciones: ${e}`);
        }
    }

    private _calculateStats(evaluations: Evaluation[]): Record<string, any> {
        if (evaluations.length === 0) {
            return {
                totalEvaluations: 0,
                averageRating: 0.0,
                averageByMetric: {
                    punctuality: 0.0,
                    contributions: 0.0,
                    commitment: 0.0,
                    attitude: 0.0,
                },
            };
        }
        const totalEvaluations = evaluations.length;
        const totalRating = evaluations.reduce((sum, evalItem) => sum + evalItem.averageRating, 0.0);
        const averageRating = totalRating / totalEvaluations;
        // Averages by metric
        const punctualityAvg = evaluations.reduce((sum, evalItem) => sum + evalItem.punctuality, 0.0) / totalEvaluations;
        const contributionsAvg = evaluations.reduce((sum, evalItem) => sum + evalItem.contributions, 0.0) / totalEvaluations;
        const commitmentAvg = evaluations.reduce((sum, evalItem) => sum + evalItem.commitment, 0.0) / totalEvaluations;
        const attitudeAvg = evaluations.reduce((sum, evalItem) => sum + evalItem.attitude, 0.0) / totalEvaluations;
        return {
            totalEvaluations: totalEvaluations,
            averageRating: averageRating,
            averageByMetric: {
                punctuality: punctualityAvg,
                contributions: contributionsAvg,
                commitment: commitmentAvg,
                attitude: attitudeAvg,
            },
        };
    }
}

export class GetEvaluationsByStudentResult {
    private constructor(
        public readonly isSuccess: boolean,
        public readonly message: string | null,
        public readonly evaluations: Evaluation[],
        public readonly stats: Record<string, any>,
    ) {}
    static success(evaluations: Evaluation[], stats: Record<string, any>): GetEvaluationsByStudentResult {
        return new GetEvaluationsByStudentResult(true, null, evaluations, stats);
    }
    static failure(message: string): GetEvaluationsByStudentResult {
        return new GetEvaluationsByStudentResult(false, message, [], {});
    }
}