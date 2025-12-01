import { Evaluation } from "../entities/evaluation";

export interface EvaluationRepository {
    createEvaluation(evaluation: Evaluation): Promise<void>;
    getEvaluationsByActivity(activityId: string): Promise<Evaluation[]>;
    getEvaluationsByEvaluator(evaluatorId: string): Promise<Evaluation[]>;
    getEvaluationsByStudent(studentId: string): Promise<Evaluation[]>;
    getEvaluationById(evaluationId: string): Promise<Evaluation | undefined>;
    updateEvaluation(evaluation: Evaluation): Promise<void>;
    deleteEvaluation(evaluationId: string): Promise<void>;
    hasEvaluated(activityId: string, evaluatorId: string, evaluatedId: string): Promise<boolean>;
    getAverageRatingForStudent(activityId: string, studentId: string): Promise<number>;
    getActivityEvaluationStats(activityId: string): Promise<{ [key: string]: any }>;
}