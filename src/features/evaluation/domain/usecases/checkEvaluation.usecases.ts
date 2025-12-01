import { ActivityRepository } from "@/src/features/activity/domain/repositories/activity.repository";
import { GroupRepository } from "@/src/features/group/domain/repositories/group.repository";
import { EvaluationRepository } from "../repositories/evaluation.repository";

export class CheckEvaluationEligibilityUseCase {
    constructor(
        private evaluationRepository: EvaluationRepository,
        private activityRepository: ActivityRepository,
        private groupRepository: GroupRepository
    ) {}

    async execute(params: {
        activityId: string;
        courseId: string;
        evaluatorId: string;
        evaluatedId: string;
    }): Promise<CheckEvaluationEligibilityResult> {
        const { activityId, evaluatorId, evaluatedId } = params;
        try {
            // Verificar que no sea auto-evaluación
            if (evaluatorId === evaluatedId) {
                return CheckEvaluationEligibilityResult.notEligible('No puedes evaluarte a ti mismo.');
            }
            // Verificar que la actividad existe
            const activity = await this.activityRepository.getActivityById(activityId);
            if (!activity) {
                return CheckEvaluationEligibilityResult.notEligible('Actividad no encontrada.');
            }
            // Verificar que la actividad no ha vencido
            if (activity.dueDate < new Date()) {
                return CheckEvaluationEligibilityResult.notEligible('La fecha límite para evaluar ha pasado.');
            }
            // Verificar que no haya evaluado antes
            const hasEvaluated = await this.evaluationRepository.hasEvaluated(
                activityId,
                evaluatorId,
                evaluatedId
            );
            if (hasEvaluated) {
                return CheckEvaluationEligibilityResult.notEligible('Ya has evaluado a este compañero en esta actividad.');
            }
            // Verificar que ambos estudiantes estén en el mismo grupo de la categoría
            const groups = await this.groupRepository.getGroupsByCategory(activity.categoryId);
            let evaluatorGroupId: string | null = null;
            let evaluatedGroupId: string | null = null;
            for (const group of groups) {
                if (group.members.includes(evaluatorId)) {
                    evaluatorGroupId = group.id;
                }
                if (group.members.includes(evaluatedId)) {
                    evaluatedGroupId = group.id;
                }
            }
            if (!evaluatorGroupId) {
                return CheckEvaluationEligibilityResult.notEligible('No perteneces a ningún grupo en esta categoría.');
            }
            if (!evaluatedGroupId) {
                return CheckEvaluationEligibilityResult.notEligible('El estudiante a evaluar no pertenece a ningún grupo.');
            }
            if (evaluatorGroupId !== evaluatedGroupId) {
                return CheckEvaluationEligibilityResult.notEligible('Solo puedes evaluar a compañeros de tu mismo grupo.');
            }
            return CheckEvaluationEligibilityResult.eligible('Puedes evaluar a este compañero.');
        } catch (e) {
            return CheckEvaluationEligibilityResult.notEligible(`Error al verificar elegibilidad: ${e}`);
        }
    }
}

export class CheckEvaluationEligibilityResult {
    constructor(
        public isEligible: boolean,
        public message: string
    ) {}
    static eligible(message: string): CheckEvaluationEligibilityResult {
        return new CheckEvaluationEligibilityResult(true, message);
    }
    static notEligible(message: string): CheckEvaluationEligibilityResult {
        return new CheckEvaluationEligibilityResult(false, message);
    }
}