import { Evaluation } from "../entities/evaluation";
import { EvaluationRepository } from "../repositories/evaluation.repository";

export class UpdateEvaluationUseCase {
    constructor(private readonly repository: EvaluationRepository) {}
    async execute(params: {
        evaluationId: string;
        punctuality: number;
        contributions: number;
        commitment: number;
        attitude: number;
    }): Promise<UpdateEvaluationResult> {
        try {
            // Get existing evaluation
            const existingEvaluation = await this.repository.getEvaluationById(params.evaluationId);
            if (!existingEvaluation) {
                return UpdateEvaluationResult.failure('Evaluación no encontrada.');
            }
            // Create updated evaluation
            const updatedEvaluation = new Evaluation(
                existingEvaluation.id,
                existingEvaluation.activityId,
                existingEvaluation.evaluatorId,
                existingEvaluation.evaluatedId,
                params.punctuality,
                params.contributions,
                params.commitment,
                params.attitude,
                existingEvaluation.createdAt
            );
            await this.repository.updateEvaluation(updatedEvaluation);
            return UpdateEvaluationResult.success('Evaluación actualizada exitosamente.', updatedEvaluation);
        }
        catch (e) {
            return UpdateEvaluationResult.failure(`Error al actualizar evaluación: ${e}`);
        }
    }
}

export class UpdateEvaluationResult {
    private constructor(
        public readonly isSuccess: boolean,
        public readonly message: string,
        public readonly evaluation: Evaluation | null,
    ) {}
    static success(message: string, evaluation: Evaluation): UpdateEvaluationResult {
        return new UpdateEvaluationResult(true, message, evaluation);
    }
    static failure(message: string): UpdateEvaluationResult {
        return new UpdateEvaluationResult(false, message, null);
    }
}