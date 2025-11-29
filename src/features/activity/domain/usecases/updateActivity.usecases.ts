import { Activity } from '../entities/activity';
import { ActivityRepository } from '../repositories/activity.repository';

export interface UpdateActivityResult {
    isSuccess: boolean;
    message: string;
    activity?: Activity;
}

export class UpdateActivityUseCase {
    constructor(private repository: ActivityRepository) {}

    async execute(
        activityId: string,
        name: string,
        description: string,
        dueDate: Date
    ): Promise<UpdateActivityResult> {
        try {
            // Validations
            if (name.trim().length === 0) {
                return {
                    isSuccess: false,
                    message: 'El nombre de la actividad no puede estar vacío.'
                };
            }

            if (description.trim().length === 0) {
                return {
                    isSuccess: false,
                    message: 'La descripción de la actividad no puede estar vacía.'
                };
            }

            if (dueDate < new Date()) {
                return {
                    isSuccess: false,
                    message: 'La fecha de vencimiento debe ser futura.'
                };
            }

            // Get existing activity
            const existingActivity = await this.repository.getActivityById(activityId);
            if (!existingActivity) {
                return {
                    isSuccess: false,
                    message: 'Actividad no encontrada.'
                };
            }

            const updatedActivity = await this.repository.updateActivity(
                existingActivity,
                name.trim(),
                description.trim(),
                dueDate
            );

            return {
                isSuccess: true,
                message: 'Actividad actualizada exitosamente.',
                activity: updatedActivity!
            };
        } catch (error) {
            console.error('Error al actualizar actividad:', error);
            return {
                isSuccess: false,
                message: `Error al actualizar actividad: ${error}`
            };
        }
    }
}