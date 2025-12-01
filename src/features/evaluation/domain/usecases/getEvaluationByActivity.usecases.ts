import { Evaluation } from "../entities/evaluation";
import { EvaluationRepository } from "../repositories/evaluation.repository";

export class GetEvaluationsByActivityUseCase {
    constructor(private readonly repository: EvaluationRepository) {}

    async execute(activityId: string): Promise<GetEvaluationsByActivityResult> {
        try {
            const evaluations = await this.repository.getEvaluationsByActivity(activityId);
            // Sort by creation date (most recent first)
            evaluations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            return GetEvaluationsByActivityResult.success(evaluations);
        }
        catch (e) {
            return GetEvaluationsByActivityResult.failure(`Error al obtener evaluaciones: ${e}`);
        }
    }
}

export class GetEvaluationsByActivityResult {
    private constructor(
        public readonly isSuccess: boolean,
        public readonly message: string | null,
        public readonly evaluations: Evaluation[],
    ) {}
    static success(evaluations: Evaluation[]): GetEvaluationsByActivityResult {
        return new GetEvaluationsByActivityResult(true, null, evaluations);
    }
    static failure(message: string): GetEvaluationsByActivityResult {
        return new GetEvaluationsByActivityResult(false, message, []);
    }
}