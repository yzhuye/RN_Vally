import { Evaluation } from "../entities/evaluation";
import { EvaluationRepository } from "../repositories/evaluation.repository";

export class GetEvaluationsByActivityUseCase {
    constructor(private readonly repository: EvaluationRepository) {}

    async execute(activityId: string): Promise<Evaluation[]> {
        try {
            const evaluations = await this.repository.getEvaluationsByActivity(activityId);
            // Sort by creation date (most recent first)
            evaluations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            return evaluations;
        } catch (error) {
            console.error('Error getting evaluations by activity:', error);
            throw error;
        }
    }
}
