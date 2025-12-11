import { Evaluation } from "../entities/evaluation";

export interface EvaluationRepository {
    createEvaluation(
        activityId: string,
        evaluatorId: string,
        evaluatedId: string,
        punctuality: number,
        contributions: number,
        commitment: number,
        attitude: number
    ): Promise<{ isSuccess: boolean; message: string; evaluation?: Evaluation }>;
    getEvaluationsByActivity(activityId: string): Promise<Evaluation[]>;
    getEvaluationsByEvaluator(evaluatorId: string): Promise<Evaluation[]>;
    getEvaluationsByStudent(studentId: string): Promise<Evaluation[]>;
    getEvaluationById(evaluationId: string): Promise<Evaluation | undefined>;
    updateEvaluation(evaluation: Evaluation): Promise<{ isSuccess: boolean; message: string }>;
    deleteEvaluation(evaluationId: string): Promise<{ isSuccess: boolean; message: string }>;
    hasEvaluated(activityId: string, evaluatorId: string, evaluatedId: string): Promise<boolean>;
    getAverageRatingForStudent(activityId: string, studentId: string): Promise<number>;
    getActivityEvaluationStats(activityId: string): Promise<{ [key: string]: any }>;
}