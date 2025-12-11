import { Evaluation } from "../entities/evaluation";
import { EvaluationRepository } from "../repositories/evaluation.repository";

export class UpdateEvaluationUseCase {
    constructor(private readonly repository: EvaluationRepository) {}
    
    async execute(evaluation: Evaluation): Promise<{ isSuccess: boolean; message: string }> {
        try {
            // Validate ratings are in valid range
            const ratings = [evaluation.punctuality, evaluation.contributions, evaluation.commitment, evaluation.attitude];
            if (ratings.some(rating => rating < 0 || rating > 5)) {
                return {
                    isSuccess: false,
                    message: "Las puntuaciones deben estar entre 0 y 5."
                };
            }

            return await this.repository.updateEvaluation(evaluation);
        } catch (error) {
            console.error('Error in UpdateEvaluationUseCase:', error);
            return {
                isSuccess: false,
                message: `Error al actualizar evaluación: ${(error as Error).message}`
            };
        }
    }
}
