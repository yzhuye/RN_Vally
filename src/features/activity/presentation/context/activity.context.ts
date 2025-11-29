import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import React, { createContext, useState } from "react";
import { Alert } from "react-native";
import { Activity } from "../../domain/entities/activity";
import { CreateActivityUseCase } from "../../domain/usecases/createActivity.usecases";
import { DeleteActivityUseCase } from "../../domain/usecases/deleteActivity.usecases";
import { GetActivitiesByCategoryUseCase } from "../../domain/usecases/getActivityByCategory.usecases";
import { GetActivityByIdUseCase } from "../../domain/usecases/getActivityById.usecases";
import { UpdateActivityUseCase } from "../../domain/usecases/updateActivity.usecases";

type ActivityContextType = {
  activities: Activity[];
  isLoading: boolean;
  loadActivities: (categoryId: string) => Promise<void>;
  createActivity: (name: string, description: string, dueDate: Date) => Promise<void>;
  updateActivity: (activityId: string, name: string, description: string, dueDate: Date) => Promise<void>;
  deleteActivity: (activityId: string) => Promise<void>;
  getActivityById: (activityId: string) => Promise<Activity | null>;
};

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const di = useDI();
  const getActivitiesByCategoryUseCase = di.resolve<GetActivitiesByCategoryUseCase>(TOKENS.GetActivitiesByCategoryUC);
  const createActivityUseCase = di.resolve<CreateActivityUseCase>(TOKENS.CreateActivityUC);
  const getActivityByIdUseCase = di.resolve<GetActivityByIdUseCase>(TOKENS.GetActivityByIdUC);
  const updateActivityUseCase = di.resolve<UpdateActivityUseCase>(TOKENS.UpdateActivityUC);
  const deleteActivityUseCase = di.resolve<DeleteActivityUseCase>(TOKENS.DeleteActivityUC);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadActivities = async (categoryId: string) => {
    try {
      setIsLoading(true);
      const response = await getActivitiesByCategoryUseCase.execute(categoryId);
      if (response.isSuccess) {
        setActivities(response.activities);
      } else {
        Alert.alert("Error", response.message);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar las actividades");
      console.error("Error loading activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createActivity = async (name: string, description: string, dueDate: Date) => {
    try {
      setIsLoading(true);
      const result = await createActivityUseCase.execute(name, description, dueDate, "");
      if (result.isSuccess) {
        Alert.alert("Éxito", result.message);
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo crear la actividad");
      console.error("Error creating activity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateActivity = async (activityId: string, name: string, description: string, dueDate: Date) => {
    try {
      setIsLoading(true);
      const result = await updateActivityUseCase.execute(activityId, name, description, dueDate);
      if (result.isSuccess) {
        Alert.alert("Éxito", result.message);
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar la actividad");
      console.error("Error updating activity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteActivity = async (activityId: string) => {
    try {
      setIsLoading(true);
      const result = await deleteActivityUseCase.execute(activityId);
      if (result.isSuccess) {
        Alert.alert("Éxito", result.message);
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo eliminar la actividad");
      console.error("Error deleting activity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityById = async (activityId: string): Promise<Activity | null> => {
    try {
      const result = await getActivityByIdUseCase.execute(activityId);
        return result.isSuccess ? result.activity || null : null;
    } catch (error) {
      console.error("Error getting activity by ID:", error);
      return null;
    }
  };
}