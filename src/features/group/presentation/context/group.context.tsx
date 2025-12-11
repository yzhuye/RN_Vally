import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import React, { createContext, useState } from "react";
import { Alert } from "react-native";
import { Group } from "../../domain/entities/group";
import { FindStudentGroupUseCase } from "../../domain/usecases/findStudentGroup.usecase";
import { GetGroupsByCategoryUseCase } from "../../domain/usecases/getGroupsByCategory.usecase";
import { JoinGroupUseCase } from "../../domain/usecases/joinGroup.usecase";

type GroupContextType = {
  groups: Group[];
  isLoading: boolean;
    loadGroups: (categoryId: string) => Promise<void>;
    joinGroup: (groupId: string, categoryId: string) => Promise<void>;
    currentGroup: Group | null;
    canJoinGroup: (group: Group) => boolean;
};

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const di = useDI();
  const { user } = useAuth();
    const getGroupsByCategoryUseCase = di.resolve<GetGroupsByCategoryUseCase>(TOKENS.GetGroupsByCategoryUC);
    const joinGroupUseCase = di.resolve<JoinGroupUseCase>(TOKENS.JoinGroupUC);
    const findStudentGroupUseCase = di.resolve<FindStudentGroupUseCase>(TOKENS.FindStudentGroupUC);
    const [groups, setGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const loadGroups = async (categoryId: string) => {
        try {
            setIsLoading(true);
            const response = await getGroupsByCategoryUseCase.execute(categoryId);
            if (response.isSuccess) {
                setGroups(response.groups);
            } else {
                Alert.alert("Error", response.message);
            }
        } catch (error) {
            Alert.alert("Error", "No se pudieron cargar los grupos");
            console.error("Error loading groups:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const joinGroup = async (groupId: string, categoryId: string) => {
        if (!user) return;
        try {
            setIsLoading(true);
            // Verificar si ya está en un grupo usando el caso de uso
            const currentGroupResult = await findStudentGroupUseCase.execute(categoryId, user.email
            );

            if (currentGroupResult && currentGroupResult.group) {
                Alert.alert("Ya estás en un grupo", `Ya perteneces al grupo "${currentGroupResult.group.name}"`);
                return;
            }
            const result = await joinGroupUseCase.execute(groupId, user.email);

            if (result.isSuccess) {
                await loadGroups(categoryId);
                Alert.alert("Éxito", result.message);
            } else {
                Alert.alert("Error", result.message);
            }
        } catch (error) {
            Alert.alert("Error", "No se pudo unir al grupo");
            console.error("Error joining group:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const currentGroup = groups.find((g) => user && g.members.includes(user.email)) || null;
    const canJoinGroup = (group: Group) => {
        if (currentGroup) return false;
        if (group.isFull) return false;
        return true;
    }
    return (
    <GroupContext.Provider value={{ groups, isLoading, loadGroups, joinGroup, currentGroup, canJoinGroup }}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroup() {
  const context = React.useContext(GroupContext);
  if (!context) {
    throw new Error("useGroup must be used within a GroupProvider");
  }
  return context;
}