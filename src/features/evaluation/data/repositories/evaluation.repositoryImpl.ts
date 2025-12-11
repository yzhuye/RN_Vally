import { Evaluation } from "../../domain/entities/evaluation";
import { EvaluationRepository } from "../../domain/repositories/evaluation.repository";
import { EvaluationDataSource } from "../datasources/evaluation.datasource";

export class EvaluationRepositoryImpl implements EvaluationRepository {
  constructor(private dataSource: EvaluationDataSource) {}

  async createEvaluation(
    activityId: string,
    evaluatorId: string,
    evaluatedId: string,
    punctuality: number,
    contributions: number,
    commitment: number,
    attitude: number
  ): Promise<{ isSuccess: boolean; message: string; evaluation?: Evaluation }> {
    return this.dataSource.createEvaluation(
      activityId,
      evaluatorId,
      evaluatedId,
      punctuality,
      contributions,
      commitment,
      attitude
    );
  }

  async getEvaluationsByActivity(activityId: string): Promise<Evaluation[]> {
    return this.dataSource.getEvaluationsByActivity(activityId);
  }

  async getEvaluationsByEvaluator(evaluatorId: string): Promise<Evaluation[]> {
    return this.dataSource.getEvaluationsByEvaluator(evaluatorId);
  }

  async getEvaluationsByStudent(studentId: string): Promise<Evaluation[]> {
    return this.dataSource.getEvaluationsByEvaluated(studentId);
  }

  async getEvaluationById(evaluationId: string): Promise<Evaluation | undefined> {
    // Note: This would require a specific endpoint or filtering by ID
    // For now, we'll throw an error since it's not implemented in the data source
    throw new Error("getEvaluationById not implemented in data source");
  }

  async updateEvaluation(evaluation: Evaluation): Promise<{ isSuccess: boolean; message: string }> {
    return this.dataSource.updateEvaluation(evaluation);
  }

  async deleteEvaluation(evaluationId: string): Promise<{ isSuccess: boolean; message: string }> {
    // Note: Delete functionality would need to be added to the data source
    throw new Error("deleteEvaluation not implemented");
  }

  async hasEvaluated(
    activityId: string,
    evaluatorId: string,
    evaluatedId: string
  ): Promise<boolean> {
    return this.dataSource.checkEvaluationExists(activityId, evaluatorId, evaluatedId);
  }

  async getAverageRatingForStudent(activityId: string, studentId: string): Promise<number> {
    try {
      const evaluations = await this.dataSource.getEvaluationsByActivity(activityId);
      const studentEvaluations = evaluations.filter(evaluation => evaluation.evaluatedId === studentId);
      
      if (studentEvaluations.length === 0) {
        return 0;
      }

      const totalRating = studentEvaluations.reduce((sum, evaluation) => sum + evaluation.averageRating, 0);
      return totalRating / studentEvaluations.length;
    } catch (error) {
      console.error('Error calculating average rating:', error);
      return 0;
    }
  }

  async getActivityEvaluationStats(activityId: string): Promise<{ [key: string]: any }> {
    try {
      const evaluations = await this.dataSource.getEvaluationsByActivity(activityId);
      
      const stats = {
        totalEvaluations: evaluations.length,
        averageRatings: {
          punctuality: 0,
          contributions: 0,
          commitment: 0,
          attitude: 0,
          overall: 0
        },
        participantsCount: new Set([...evaluations.map(evaluation => evaluation.evaluatorId), ...evaluations.map(evaluation => evaluation.evaluatedId)]).size
      };

      if (evaluations.length > 0) {
        stats.averageRatings.punctuality = evaluations.reduce((sum, evaluation) => sum + evaluation.punctuality, 0) / evaluations.length;
        stats.averageRatings.contributions = evaluations.reduce((sum, evaluation) => sum + evaluation.contributions, 0) / evaluations.length;
        stats.averageRatings.commitment = evaluations.reduce((sum, evaluation) => sum + evaluation.commitment, 0) / evaluations.length;
        stats.averageRatings.attitude = evaluations.reduce((sum, evaluation) => sum + evaluation.attitude, 0) / evaluations.length;
        stats.averageRatings.overall = evaluations.reduce((sum, evaluation) => sum + evaluation.averageRating, 0) / evaluations.length;
      }

      return stats;
    } catch (error) {
      console.error('Error getting activity evaluation stats:', error);
      return {
        totalEvaluations: 0,
        averageRatings: { punctuality: 0, contributions: 0, commitment: 0, attitude: 0, overall: 0 },
        participantsCount: 0
      };
    }
  }
}