import { ActivityRepository } from '../repositories/activity.repository';

export interface DeleteActivityResult {
    isSuccess: boolean;
    message: string;
}

export class DeleteActivityUseCase {
    private repository: ActivityRepository;

    constructor(repository: ActivityRepository) {
        this.repository = repository;
    }

    async execute(activityId: string): Promise<DeleteActivityResult> {
        try {
            // Verificar que la actividad existe
            const activity = await this.repository.getActivityById(activityId);
            if (!activity) {
                return { isSuccess: false, message: 'Actividad no encontrada.' };
            }

            // Verificar si la actividad tiene evaluaciones
            if (activity.evaluations.length > 0) {
                return {
                    isSuccess: false,
                    message: 'No se puede eliminar una actividad que ya tiene evaluaciones.'
                };
            }

            const result = await this.repository.deleteActivity(activityId);
            return result;
        } catch (e) {
            return { isSuccess: false, message: `Error al eliminar actividad: ${e}` };
        }
    }
}