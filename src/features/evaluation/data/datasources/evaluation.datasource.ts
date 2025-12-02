import { Evaluation } from '../../domain/entities/evaluation';

export interface EvaluationDataSource {
  getEvaluationsByActivity(activityId: string): Promise<Evaluation[]>;
  getEvaluationsByEvaluator(evaluatorId: string): Promise<Evaluation[]>;
  getEvaluationsByEvaluated(evaluatedId: string): Promise<Evaluation[]>;
  getEvaluationByActivityAndEvaluator(activityId: string, evaluatorId: string, evaluatedId: string): Promise<Evaluation | undefined>;
  createEvaluation(
    activityId: string,
    evaluatorId: string,
    evaluatedId: string,
    punctuality: number,
    contributions: number,
    commitment: number,
    attitude: number
  ): Promise<{ isSuccess: boolean; message: string; evaluation?: Evaluation }>;
  updateEvaluation(evaluation: Evaluation): Promise<{ isSuccess: boolean; message: string }>;
  checkEvaluationExists(activityId: string, evaluatorId: string, evaluatedId: string): Promise<boolean>;
}