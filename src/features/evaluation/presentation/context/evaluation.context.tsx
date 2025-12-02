import React, { createContext, useContext, useState } from 'react';
import { Alert } from 'react-native';
import { useDI } from '../../../../core/di/DIProvider';
import { TOKENS } from '../../../../core/di/tokens';
import { Evaluation } from '../../domain/entities/evaluation';
import { CheckEvaluationEligibilityUseCase } from '../../domain/usecases/checkEvaluation.usecases';
import { CreateEvaluationUseCase } from '../../domain/usecases/createEvaluation.usecases';
import { GetEvaluationsByActivityUseCase } from '../../domain/usecases/getEvaluationByActivity.usecases';
import { UpdateEvaluationUseCase } from '../../domain/usecases/updateEvaluation.usecases';

type EvaluationContextType = {
  evaluations: Evaluation[];
  isLoading: boolean;
  loadEvaluations: (activityId: string) => Promise<void>;
  createEvaluation: (params: {
    activityId: string;
    evaluatorId: string;
    evaluatedId: string;
    punctuality: number;
    contributions: number;
    commitment: number;
    attitude: number;
  }) => Promise<boolean>;
  updateEvaluation: (evaluation: Evaluation) => Promise<boolean>;
  checkEligibility: (params: {
    activityId: string;
    courseId: string;
    evaluatorId: string;
    evaluatedId: string;
  }) => Promise<{ isEligible: boolean; message: string }>;
  getEvaluationCount: (activityId: string) => number;
  hasEvaluated: (activityId: string, evaluatorId: string, evaluatedId: string) => boolean;
};

const EvaluationContext = createContext<EvaluationContextType | undefined>(undefined);

export function EvaluationProvider({ children }: { children: React.ReactNode }) {
  const di = useDI();

  const createEvaluationUC = di.resolve<CreateEvaluationUseCase>(TOKENS.CreateEvaluationUC);
  const getEvaluationsUC = di.resolve<GetEvaluationsByActivityUseCase>(TOKENS.GetEvaluationsByActivityUC);
  const updateEvaluationUC = di.resolve<UpdateEvaluationUseCase>(TOKENS.UpdateEvaluationUC);
  const checkEligibilityUC = di.resolve<CheckEvaluationEligibilityUseCase>(TOKENS.CheckEvaluationEligibilityUC);

  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --------------------------
  // LOAD EVALUATIONS
  // --------------------------
  const loadEvaluations = async (activityId: string) => {
    try {
      setIsLoading(true);
      const result = await getEvaluationsUC.execute(activityId);
      setEvaluations(result);
    } catch (error) {
      console.error('Error loading evaluations:', error);
      Alert.alert('Error', 'No se pudieron cargar las evaluaciones');
      setEvaluations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------
  // CREATE EVALUATION
  // --------------------------
  const createEvaluation = async (params: {
    activityId: string;
    evaluatorId: string;
    evaluatedId: string;
    punctuality: number;
    contributions: number;
    commitment: number;
    attitude: number;
  }): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await createEvaluationUC.execute(params);
      
      if (result.isSuccess) {
        Alert.alert('Éxito', result.message);
        // Reload evaluations to show the new one
        await loadEvaluations(params.activityId);
        return true;
      } else {
        Alert.alert('Error', result.message);
        return false;
      }
    } catch (error) {
      console.error('Error creating evaluation:', error);
      Alert.alert('Error', 'No se pudo crear la evaluación');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------
  // UPDATE EVALUATION
  // --------------------------
  const updateEvaluation = async (evaluation: Evaluation): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await updateEvaluationUC.execute(evaluation);
      
      if (result.isSuccess) {
        Alert.alert('Éxito', result.message);
        // Reload evaluations to show the updated one
        await loadEvaluations(evaluation.activityId);
        return true;
      } else {
        Alert.alert('Error', result.message);
        return false;
      }
    } catch (error) {
      console.error('Error updating evaluation:', error);
      Alert.alert('Error', 'No se pudo actualizar la evaluación');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------
  // CHECK ELIGIBILITY
  // --------------------------
  const checkEligibility = async (params: {
    activityId: string;
    courseId: string;
    evaluatorId: string;
    evaluatedId: string;
  }): Promise<{ isEligible: boolean; message: string }> => {
    try {
      return await checkEligibilityUC.execute(params);
    } catch (error) {
      console.error('Error checking eligibility:', error);
      return { isEligible: false, message: 'Error al verificar elegibilidad' };
    }
  };

  // --------------------------
  // HELPER FUNCTIONS
  // --------------------------
  const getEvaluationCount = (activityId: string): number => {
    return evaluations.filter(e => e.activityId === activityId).length;
  };

  const hasEvaluated = (activityId: string, evaluatorId: string, evaluatedId: string): boolean => {
    return evaluations.some(e => 
      e.activityId === activityId && 
      e.evaluatorId === evaluatorId && 
      e.evaluatedId === evaluatedId
    );
  };

  const value = {
    evaluations,
    isLoading,
    loadEvaluations,
    createEvaluation,
    updateEvaluation,
    checkEligibility,
    getEvaluationCount,
    hasEvaluated,
  };

  return (
    <EvaluationContext.Provider value={value}>
      {children}
    </EvaluationContext.Provider>
  );
}

export function useEvaluation() {
  const context = useContext(EvaluationContext);
  if (!context) {
    throw new Error('useEvaluation must be used within an EvaluationProvider');
  }
  return context;
}
