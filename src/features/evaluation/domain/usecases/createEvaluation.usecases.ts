import { Evaluation } from "../entities/evaluation";
import { EvaluationRepository } from "../repositories/evaluation.repository";
import { ActivityRepository } from "@/src/features/activity/domain/repositories/activity.repository";

export class CreateEvaluationUseCase {
    private evaluationRepository: EvaluationRepository;
    private activityRepository: ActivityRepository;

    constructor(
        evaluationRepository: EvaluationRepository,
        activityRepository: ActivityRepository
    ) {
        this.evaluationRepository = evaluationRepository;
        this.activityRepository = activityRepository;
    }

    async call(params: {
        activityId: string;
        evaluatorId: string;
        evaluatedId: string;
        punctuality: number;
        contributions: number;
        commitment: number;
        attitude: number;
    }): Promise<CreateEvaluationResult> {
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
                return CreateEvaluationResult.failure(
                    "No puedes evaluarte a ti mismo."
                );
            }

            // Validar que la actividad existe
            const activity = this.activityRepository.getActivityById(activityId);
            if (!activity) {
                return CreateEvaluationResult.failure("Actividad no encontrada.");
            }

            // Verificar evaluación previa
            const alreadyEvaluated =
                await this.evaluationRepository.hasEvaluated(
                    activityId,
                    evaluatorId,
                    evaluatedId
                );

            if (alreadyEvaluated) {
                return CreateEvaluationResult.failure(
                    "Ya has evaluado a este compañero en esta actividad."
                );
            }

            // Crear evaluación
            const evaluation = new Evaluation(
                this.generateId(),
                activityId,
                evaluatorId,
                evaluatedId,
                punctuality,
                contributions,
                commitment,
                attitude,
                new Date()
            );

            await this.evaluationRepository.createEvaluation(evaluation);

            return CreateEvaluationResult.success(
                "Evaluación creada exitosamente.",
                evaluation
            );
        } catch (e) {
            return CreateEvaluationResult.failure(
                "Error al crear evaluación: " + (e as Error).message
            );
        }
    }

    private generateId(): string {
        return `eval_${Date.now()}`;
    }
}

export class CreateEvaluationResult {
    readonly isSuccess: boolean;
    readonly message: string;
    readonly evaluation?: Evaluation;

    private constructor(params: {
        isSuccess: boolean;
        message: string;
        evaluation?: Evaluation;
    }) {
        this.isSuccess = params.isSuccess;
        this.message = params.message;
        this.evaluation = params.evaluation;
    }

    static success(message: string, evaluation: Evaluation) {
        return new CreateEvaluationResult({
            isSuccess: true,
            message,
            evaluation,
        });
    }

    static failure(message: string) {
        return new CreateEvaluationResult({
            isSuccess: false,
            message,
        });
    }
}
