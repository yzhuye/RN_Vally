import { Evaluation } from "../entities/evaluation";
import { EvaluationRepository } from "../repositories/evaluation.repository";

export class CreateEvaluationUseCase {
    constructor(private evaluationRepository: EvaluationRepository) {}

    async execute(params: {
        activityId: string;
        evaluatorId: string;
        evaluatedId: string;
        punctuality: number;
        contributions: number;
        commitment: number;
        attitude: number;
    }): Promise<{ isSuccess: boolean; message: string; evaluation?: Evaluation }> {
        const {
            activityId,
            evaluatorId,
            evaluatedId,
            punctuality,
            contributions,
            commitment,
            attitude,
        } = params;

        try {
            // Validación: evitar autoevaluación
            if (evaluatorId === evaluatedId) {
                return {
                    isSuccess: false,
                    message: "No puedes evaluarte a ti mismo."
                };
            }

            // Validar rangos de puntuación (0-5)
            const ratings = [punctuality, contributions, commitment, attitude];
            if (ratings.some(rating => rating < 0 || rating > 5)) {
                return {
                    isSuccess: false,
                    message: "Las puntuaciones deben estar entre 0 y 5."
                };
            }

            // Verificar evaluación previa
            const alreadyEvaluated = await this.evaluationRepository.hasEvaluated(
                activityId,
                evaluatorId,
                evaluatedId
            );

            if (alreadyEvaluated) {
                return {
                    isSuccess: false,
                    message: "Ya has evaluado a este compañero en esta actividad."
                };
            }

            // Crear evaluación
            return await this.evaluationRepository.createEvaluation(
                activityId,
                evaluatorId,
                evaluatedId,
                punctuality,
                contributions,
                commitment,
                attitude
            );
        } catch (error) {
            console.error('Error in CreateEvaluationUseCase:', error);
            return {
                isSuccess: false,
                message: "Error al crear evaluación: " + (error as Error).message
            };
        }
    }
}
