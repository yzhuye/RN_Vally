import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import React, { createContext, useState } from "react";
import { Alert } from "react-native";
import { Group } from "../../domain/entities/group";
import { AssignStudentToGroupUseCase } from "../../domain/usecases/assignStudentToGroup.usecases";
import { FindStudentGroupUseCase } from "../../domain/usecases/findStudentGroup.usecases";
import { GetGroupsByCategoryUseCase } from "../../domain/usecases/getGroupsByCategory.usecases";
import { MoveStudentToGroupUseCase } from "../../domain/usecases/moveStutendToGroup.usecases";

type ProfessorContextType = {
    groups: Group[];
    isLoading: boolean;
    loadGroups: (categoryId: string) => Promise<void>;
    moveStudentToGroup: (studentEmail: string, toGroupId: string) => Promise<boolean>;
    assignStudentToGroup: (studentId: string, groupId: string) => Promise<boolean>;
    currentGroup: Group | null;
    getStudentsNotInAnyGroup: () => string[];
    findStudentGroup: (studentId: string) => Group | null;
    assignStudentsRandomly: () => Promise<void>;
    reassignAllStudentsRandomly: () => Promise<void>;
};

const ProfessorContext = createContext<ProfessorContextType | undefined>(undefined);

export function ProfessorProvider({ children }: { children: React.ReactNode }) {
    const di = useDI();
    const { user } = useAuth();
    const getGroupsByCategoryUseCase = di.resolve<GetGroupsByCategoryUseCase>(TOKENS.GetGroupsByCategoryUC);
    const moveStudentToGroupUseCase = di.resolve<MoveStudentToGroupUseCase>(TOKENS.MoveStudentToGroupUC);
    const assignStudentToGroupUseCase = di.resolve<AssignStudentToGroupUseCase>(TOKENS.AssignStudentToGroupUC);
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

    const assignStudentToGroup = async (studentId: string, groupId: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            const result = await assignStudentToGroupUseCase.execute(groupId, studentId);
            if (result.isSuccess) {
                Alert.alert("Éxito", result.message);
                await loadGroups(groups[0].categoryId); // Recargar grupos
                return true;
            } else {
                Alert.alert("Error", result.message);
                return false;
            }
        } catch (error) {
            Alert.alert("Error", "No se pudo asignar el estudiante al grupo");
            console.error("Error assigning student to group:", error);
            return false;
        }
    };

    const moveStudentToGroup = async (studentEmail: string, toGroupId: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            const result = await moveStudentToGroupUseCase.execute(toGroupId, studentEmail);
            if (result.isSuccess) {
                await loadGroups(groups[0].categoryId);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error("Error moving student to group:", error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const currentGroup = groups.find((g) => user && g.members.includes(user.email)) || null;

    const getStudentsNotInAnyGroup = (): string[] => {
        if (!user) return [];
        const allStudents: string[] = [];
        const assignedStudents = groups.flatMap((group) => group.members);
        return allStudents.filter((student) => !assignedStudents.includes(student));
    };

    const findStudentGroup = (studentId: string): Group | null => {
        for (const group of groups) {
            if (group.members.includes(studentId)) {
                return group;
            }
        }
        return null;
    };

    const assignStudentsRandomly = async (): Promise<void> => {
        // Implementación de asignación aleatoria de estudiantes a grupos
    };

    const reassignAllStudentsRandomly = async (): Promise<void> => {
        // Implementación de reasignación aleatoria de todos los estudiantes
    };

    return (
        <ProfessorContext.Provider value={{ 
            groups, 
            isLoading, 
            loadGroups, 
            moveStudentToGroup, 
            assignStudentToGroup, 
            currentGroup,
            getStudentsNotInAnyGroup, 
            findStudentGroup,
            assignStudentsRandomly,
            reassignAllStudentsRandomly
        }}>
            {children}
        </ProfessorContext.Provider>
    );
}

export function useProfessor() {
    const context = React.useContext(ProfessorContext);
    if (context === undefined) {
        throw new Error("useProfessor must be used within a ProfessorProvider");
    }
    return context;
}