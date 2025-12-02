import { ILocalPreferences } from '../../../../core/iLocalPreferences';
import { LocalPreferencesAsyncStorage } from '../../../../core/LocalPreferencesAsyncStorage';
import { AuthRemoteDataSourceImpl } from '../../../auth/data/datasources/AuthRemoteDataSourceImp';
import { Evaluation } from '../../domain/entities/evaluation';
import { EvaluationDataSource } from './evaluation.datasource';

const projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID;
const API_URL = `https://roble-api.openlab.uninorte.edu.co/database/${projectId}`;

export class EvaluationRemoteDataSourceImpl implements EvaluationDataSource {
  private prefs: ILocalPreferences;

  constructor(private authService: AuthRemoteDataSourceImpl) {
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
  }

  private mapToEvaluation(data: any): Evaluation {
    return new Evaluation(
      data._id,
      data.activityId,
      data.evaluatorId,
      data.evaluatedId,
      data.punctuality,
      data.contributions,
      data.commitment,
      data.attitude,
      new Date(data.createdAt)
    );
  }

  async getEvaluationsByActivity(activityId: string): Promise<Evaluation[]> {
    try {
      const token = await this.prefs.retrieveData<string>("token");
      const response = await fetch(`${API_URL}/read?tableName=evaluations&activityId=${activityId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(`Failed to fetch evaluations:, ${data.message || 'Unknown error'}`);
      }

      return (data || []).map((e: any) => this.mapToEvaluation(e));
    } catch (error) {
      console.error('Error fetching evaluations by activity:', error);
      throw error;
    }
  }

  async getEvaluationsByEvaluator(evaluatorId: string): Promise<Evaluation[]> {
    try {
      const token = await this.prefs.retrieveData<string>("token");
      const response = await fetch(`${API_URL}/read?tableName=evaluations&evaluatorId=${evaluatorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch evaluations');
      }

      const data = await response.json();
      return (data || []).map((e: any) => this.mapToEvaluation(e));
    } catch (error) {
      console.error('Error fetching evaluations by evaluator:', error);
      throw error;
    }
  }

  async getEvaluationsByEvaluated(evaluatedId: string): Promise<Evaluation[]> {
    try {
      const token = await this.prefs.retrieveData<string>("token");
      const response = await fetch(`${API_URL}/read?tableName=evaluations&evaluatedId=${evaluatedId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch evaluations');
      }

      const data = await response.json();
      return (data || []).map((e: any) => this.mapToEvaluation(e));
    } catch (error) {
      console.error('Error fetching evaluations by evaluated:', error);
      throw error;
    }
  }

  async getEvaluationByActivityAndEvaluator(
    activityId: string,
    evaluatorId: string,
    evaluatedId: string
  ): Promise<Evaluation | undefined> {
    try {
      const token = await this.prefs.retrieveData<string>("token");
      const response = await fetch(
        `${API_URL}/read?tableName=evaluations&activityId=${activityId}&evaluatorId=${evaluatorId}&evaluatedId=${evaluatedId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch evaluation');
      }

      const data = await response.json();
      if (data && data.length > 0) {
        return this.mapToEvaluation(data[0]);
      }
      return undefined;
    } catch (error) {
      console.error('Error fetching evaluation by activity and evaluator:', error);
      throw error;
    }
  }

  async createEvaluation(
    activityId: string,
    evaluatorId: string,
    evaluatedId: string,
    punctuality: number,
    contributions: number,
    commitment: number,
    attitude: number
  ): Promise<{ isSuccess: boolean; message: string; evaluation?: Evaluation }> {
    try {
      const token = await this.prefs.retrieveData<string>("token");
      const response = await fetch(`${API_URL}/insert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tableName: 'evaluations',
          records: [
            {
              activityId: activityId,
              evaluatorId: evaluatorId,
              evaluatedId: evaluatedId,
              punctuality,
              contributions,
              commitment,
              attitude,
              createdAt: new Date().toISOString()
            }
          ]
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          isSuccess: false,
          message: data.message || 'Error al crear la evaluación',
        };
      }

      return {
        isSuccess: true,
        message: 'Evaluación creada exitosamente',
        evaluation: data.inserted[0] ? this.mapToEvaluation(data.inserted[0]) : undefined,
      };
    } catch (error) {
      console.error('Error creating evaluation:', error);
      return {
        isSuccess: false,
        message: 'Error de conexión',
      };
    }
  }

  async updateEvaluation(evaluation: Evaluation): Promise<{ isSuccess: boolean; message: string }> {
    try {
      const token = await this.prefs.retrieveData<string>("token");
      const response = await fetch(`${API_URL}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tableName: 'evaluations',
          idColumn: '_id',
          idValue: evaluation.id,
          updates: {
            punctuality: evaluation.punctuality,
            contributions: evaluation.contributions,
            commitment: evaluation.commitment,
            attitude: evaluation.attitude,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          isSuccess: false,
          message: data.message || 'Error al actualizar la evaluación',
        };
      }

      return {
        isSuccess: true,
        message: 'Evaluación actualizada exitosamente',
      };
    } catch (error) {
      console.error('Error updating evaluation:', error);
      return {
        isSuccess: false,
        message: 'Error de conexión',
      };
    }
  }

  async checkEvaluationExists(
    activityId: string,
    evaluatorId: string,
    evaluatedId: string
  ): Promise<boolean> {
    try {
      const evaluation = await this.getEvaluationByActivityAndEvaluator(
        activityId,
        evaluatorId,
        evaluatedId
      );
      return evaluation !== undefined;
    } catch (error) {
      console.error('Error checking evaluation existence:', error);
      return false;
    }
  }
}