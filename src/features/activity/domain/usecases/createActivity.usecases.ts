import { Activity } from '../entities/activity';
import { ActivityRepository } from '../repositories/activity.repository';

export interface CreateActivityResult {
    isSuccess: boolean;
    message: string;
    activity?: Activity;
}

export class CreateActivityUseCase {
    private repository: ActivityRepository;

    constructor(repository: ActivityRepository) {
        this.repository = repository;
    }

    async execute(name: string, description: string, dueDate: Date, categoryId: string): Promise<CreateActivityResult> {
        try {
            // Validations
            if (name.trim().length === 0) {
                return { isSuccess: false, message: 'El nombre de la actividad no puede estar vacío.' };
            }

            if (description.trim().length === 0) {
                return { isSuccess: false, message: 'La descripción de la actividad no puede estar vacía.' };
            }

            if (dueDate < new Date()) {
                return { isSuccess: false, message: 'La fecha de vencimiento debe ser futura.' };
            }

            const activity = await this.repository.createActivity(name, description, dueDate, categoryId);

            if (activity) {
                return { isSuccess: true, message: 'Actividad creada exitosamente.', activity };
            } else {
                return { isSuccess: false, message: 'Error al crear la actividad.' };
            }
        } catch (e) {
            return { isSuccess: false, message: `Error al crear actividad: ${e}` };
        }
    }
}