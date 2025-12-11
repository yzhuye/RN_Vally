import React, { createContext, useContext, useState } from 'react';
import { Alert } from 'react-native';
import { useDI } from '../../../../core/di/DIProvider';
import { TOKENS } from '../../../../core/di/tokens';
import { Activity } from '../../domain/entities/activity';
import { CreateActivityUseCase } from '../../domain/usecases/createActivity.usecases';
import { DeleteActivityUseCase } from '../../domain/usecases/deleteActivity.usecases';
import { GetActivitiesByCategoryUseCase } from '../../domain/usecases/getActivityByCategory.usecases';
import { GetActivityByIdUseCase } from '../../domain/usecases/getActivityById.usecases';
import { UpdateActivityUseCase } from '../../domain/usecases/updateActivity.usecases';

type ActivityContextType = {
  activities: Activity[];
  isLoading: boolean;
  loadActivities: (categoryId: string) => Promise<void>;
  createActivity: (params: {
    name: string;
    description: string;
    dueDate: Date;
    categoryId: string;
  }) => Promise<boolean>;
  updateActivity: (params: {
    activityId: string;
    name: string;
    description: string;
    dueDate: Date;
  }) => Promise<boolean>;
  deleteActivity: (activityId: string) => Promise<boolean>;
  getActivityById: (activityId: string) => Promise<Activity | null>;
  formatDueDate: (date: Date) => string;
  getDueDateColor: (date: Date) => string;
};

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const di = useDI();

  const createActivityUC = di.resolve<CreateActivityUseCase>(TOKENS.CreateActivityUC);
  const getActivitiesUC = di.resolve<GetActivitiesByCategoryUseCase>(TOKENS.GetActivitiesByCategoryUC);
  const getActivityByIdUC = di.resolve<GetActivityByIdUseCase>(TOKENS.GetActivityByIdUC);
  const updateActivityUC = di.resolve<UpdateActivityUseCase>(TOKENS.UpdateActivityUC);
  const deleteActivityUC = di.resolve<DeleteActivityUseCase>(TOKENS.DeleteActivityUC);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --------------------------
  // LOAD ACTIVITIES
  // --------------------------
  const loadActivities = async (categoryId: string) => {
    setIsLoading(true);
    try {
      const result = await getActivitiesUC.execute(categoryId);

      if (result.isSuccess) {
        setActivities(result.activities);
      } else {
        Alert.alert('Error', result.message ?? 'Error al cargar actividades');
      }
    } catch (e) {
      console.error('Error loading activities:', e);
      Alert.alert('Error', 'Error inesperado al cargar actividades');
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------
  // CREATE ACTIVITY
  // --------------------------
  const createActivity = async ({
    name,
    description,
    dueDate,
    categoryId,
  }: {
    name: string;
    description: string;
    dueDate: Date;
    categoryId: string;
  }): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await createActivityUC.execute(
        name,
        description,
        dueDate,
        categoryId,
      );

      if (result.isSuccess) {
        await loadActivities(categoryId);
        Alert.alert('Éxito', result.message);
        return true;
      } else {
        Alert.alert('Error', result.message);
        return false;
      }
    } catch (e) {
      console.error('Error creating activity:', e);
      Alert.alert('Error', 'Error inesperado al crear actividad');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------
  // UPDATE ACTIVITY
  // --------------------------
  const updateActivity = async ({
    activityId,
    name,
    description,
    dueDate,
  }: {
    activityId: string;
    name: string;
    description: string;
    dueDate: Date;
  }): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await updateActivityUC.execute(
        activityId,
        name,
        description,
        dueDate,
      );

      if (result.isSuccess) {
        Alert.alert('Éxito', result.message);
        return true;
      } else {
        Alert.alert('Error', result.message);
        return false;
      }
    } catch (e) {
      console.error('Error updating activity:', e);
      Alert.alert('Error', 'Error inesperado al actualizar actividad');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------
  // DELETE ACTIVITY
  // --------------------------
  const deleteActivity = async (activityId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await deleteActivityUC.execute(activityId);

      if (result.isSuccess) {
        Alert.alert('Éxito', result.message);
        return true;
      } else {
        Alert.alert('Error', result.message);
        return false;
      }
    } catch (e) {
      console.error('Error deleting activity:', e);
      Alert.alert('Error', 'Error inesperado al eliminar actividad');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------
  // GET ACTIVITY BY ID
  // --------------------------
  const getActivityById = async (activityId: string): Promise<Activity | null> => {
    try {
      const result = await getActivityByIdUC.execute(activityId);
      return result.isSuccess ? result.activity! : null;
    } catch (e) {
      console.error('Error getting activity by id:', e);
      return null;
    }
  };

  // --------------------------
  // HELPERS
  // --------------------------
  const formatDueDate = (dueDate: Date): string => {
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (diff < 0) return 'Vencida';
    if (days === 0) return 'Vence hoy';
    if (days === 1) return 'Vence mañana';
    if (days < 7) return `Vence en ${days} días`;

    return `Vence el ${dueDate.getDate()}/${dueDate.getMonth() + 1}/${dueDate.getFullYear()}`;
  };

  const getDueDateColor = (dueDate: Date): string => {
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (diff < 0) return 'red';
    if (days <= 1) return 'orange';
    if (days <= 3) return 'yellow';
    return 'green';
  };

  const value: ActivityContextType = {
    activities,
    isLoading,
    loadActivities,
    createActivity,
    updateActivity,
    deleteActivity,
    getActivityById,
    formatDueDate,
    getDueDateColor,
  };

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
}

// --------------------------
// HOOK
// --------------------------
export function useActivity() {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used inside ActivityProvider');
  }
  return context;
}
