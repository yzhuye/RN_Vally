import { Evaluation } from "../entities/evaluation";
import { EvaluationRepository } from "../repositories/evaluation.repository";

export class GetEvaluationsByEvaluatorUseCase {
    constructor(private readonly repository: EvaluationRepository) {}

    async execute(evaluatorId: string): Promise<GetEvaluationsByEvaluatorResult> {
        try {
            const evaluations = await this.repository.getEvaluationsByEvaluator(evaluatorId);
            // Sort by creation date (most recent first)
            evaluations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            return GetEvaluationsByEvaluatorResult.success(evaluations);
        }
        catch (e) {
            return GetEvaluationsByEvaluatorResult.failure(`Error al obtener evaluaciones: ${e}`);
        }
    }
}

export class GetEvaluationsByEvaluatorResult {
    private constructor(
        public readonly isSuccess: boolean,
        public readonly message: string | null,
        public readonly evaluations: Evaluation[],
    ) {}
    static success(evaluations: Evaluation[]): GetEvaluationsByEvaluatorResult {
        return new GetEvaluationsByEvaluatorResult(true, null, evaluations);
    }
    static failure(message: string): GetEvaluationsByEvaluatorResult {
        return new GetEvaluationsByEvaluatorResult(false, message, []);
    }
}