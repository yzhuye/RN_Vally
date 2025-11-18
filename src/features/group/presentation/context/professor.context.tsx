import { useDI } from '@/src/core/di/DIProvider';
import { TOKENS } from '@/src/core/di/tokens';
import { Course, StudentInfo } from '@/src/features/course/domain/entities/course';
import React, { createContext, useContext, useState } from 'react';
import { Alert } from 'react-native';
import { Group } from '../../../group/domain/entities/group';
import { AssignStudentToGroupUseCase } from '../../../group/domain/usecases/assignStudentToGroup.usecase';
import { FindStudentGroupUseCase } from '../../../group/domain/usecases/findStudentGroup.usecase';
import { GetGroupsByCategoryUseCase } from '../../../group/domain/usecases/getGroupsByCategory.usecase';
import { MoveStudentToGroupUseCase } from '../../../group/domain/usecases/moveStudentToGroup.usecase';

type ProfessorContextType = {
  groups: Group[];
  students: string[];
  studentInfo: StudentInfo[];
  isLoading: boolean;
  isAssigningStudent: boolean;
  loadGroups: (categoryId: string) => Promise<void>;
  loadStudents: (course: Course) => void;
  assignStudentToGroup: (studentId: string, groupId: string) => Promise<boolean>;
  moveStudentToGroup: (studentEmail: string, toGroupId: string) => Promise<boolean>;
  findStudentGroup: (categoryId: string, studentId: string) => Promise<Group | null>;
  assignStudentsRandomly: (categoryId: string) => Promise<void>;
  reassignAllStudentsRandomly: (categoryId: string) => Promise<void>;
  getStudentsNotInAnyGroup: () => string[];
  getGroupStats: (group: Group) => { membersCount: number; maxCapacity: number; occupancyRate: number; isFull: boolean; hasSpace: boolean };
  getStudentName: (email: string) => string;
  totalGroupsCount: number;
  totalStudentsCount: number;
  studentsInGroupsCount: number;
  studentsNotInGroupsCount: number;
  totalCapacity: number;
  occupancyRate: number;
  groupsWithSpace: Group[];
  fullGroups: Group[];
};

const ProfessorContext = createContext<ProfessorContextType | undefined>(undefined);

export function ProfessorProvider({ children }: { children: React.ReactNode }) {
  const di = useDI();

  const getGroupsUseCase = di.resolve<GetGroupsByCategoryUseCase>(TOKENS.GetGroupsByCategoryUC);
  const assignStudentUseCase = di.resolve<AssignStudentToGroupUseCase>(TOKENS.AssignStudentToGroupUC);
  const moveStudentUseCase = di.resolve<MoveStudentToGroupUseCase>(TOKENS.MoveStudentToGroupUC);
  const findStudentGroupUseCase = di.resolve<FindStudentGroupUseCase>(TOKENS.FindStudentGroupUC);

  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<string[]>([]);
  const [studentInfo, setStudentInfo] = useState<StudentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigningStudent, setIsAssigningStudent] = useState(false);

  const loadGroups = async (categoryId: string) => {
    setIsLoading(true);
    try {
      const result = await getGroupsUseCase.execute(categoryId);

      if (result.isSuccess) {
        setGroups(result.groups);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
      Alert.alert('Error', 'Error inesperado al cargar grupos');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudents = (course: Course) => {
    if (course.enrolledStudentInfo && course.enrolledStudentInfo.length > 0) {
      setStudentInfo(course.enrolledStudentInfo);
      setStudents(course.enrolledStudentInfo.map(s => s.email));
    } else {
      setStudents(course.enrolledStudents);
      setStudentInfo(
        course.enrolledStudents.map(email => ({
          id: email,
          name: email.split('@')[0],
          email: email,
          enrollmentDate: new Date(),
        }))
      );
    }
  };

  const assignStudentToGroup = async (studentId: string, groupId: string): Promise<boolean> => {
    setIsAssigningStudent(true);
    try {
      const result = await assignStudentUseCase.execute(studentId, groupId);

      if (result.isSuccess) {
        Alert.alert('Éxito', result.message);
        return true;
      } else {
        Alert.alert('Error', result.message);
        return false;
      }
    } catch (error) {
      console.error('Error assigning student:', error);
      Alert.alert('Error', 'Error al asignar estudiante');
      return false;
    } finally {
      setIsAssigningStudent(false);
    }
  };

  const moveStudentToGroup = async (studentEmail: string, toGroupId: string): Promise<boolean> => {
    setIsAssigningStudent(true);
    try {
      const result = await moveStudentUseCase.execute(studentEmail, toGroupId);

      if (result.isSuccess) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error moving student:', error);
      return false;
    } finally {
      setIsAssigningStudent(false);
    }
  };

  const findStudentGroup = async (categoryId: string, studentId: string): Promise<Group | null> => {
    try {
      const result = await findStudentGroupUseCase.execute(categoryId, studentId);
      return result.group;
    } catch (error) {
      console.error('Error finding student group:', error);
      return null;
    }
  };

  const findStudentGroupSync = (studentEmail: string): Group | undefined => {
    return groups.find(group => group.members.includes(studentEmail));
  };

  const getStudentsNotInAnyGroup = (): string[] => {
    return students.filter(studentEmail => !findStudentGroupSync(studentEmail));
  };

  const assignStudentsRandomly = async (categoryId: string) => {
    setIsLoading(true);
    try {
      const unassignedStudents = getStudentsNotInAnyGroup();

      if (unassignedStudents.length === 0) {
        Alert.alert('Información', 'No hay estudiantes sin asignar a grupos');
        return;
      }

      if (groups.length === 0) {
        Alert.alert('Error', 'No hay grupos disponibles para asignar estudiantes');
        return;
      }

      const shuffledStudents = [...unassignedStudents].sort(() => Math.random() - 0.5);
      let studentIndex = 0;
      let groupIndex = 0;

      while (studentIndex < shuffledStudents.length) {
        const group = groups[groupIndex];

        if (!group.isFull) {
          const studentIdentifier = shuffledStudents[studentIndex];
          const success = await assignStudentToGroup(studentIdentifier, group.id);
          
          if (success) {
            // Actualizar el grupo localmente
            group.members.push(studentIdentifier);
          }
          studentIndex++;
        }

        groupIndex = (groupIndex + 1) % groups.length;

        if (groups.every(g => g.isFull)) {
          break;
        }
      }

      await loadGroups(categoryId);
      Alert.alert('Éxito', 'Asignación aleatoria completada');
    } catch (error) {
      console.error('Error assigning students randomly:', error);
      Alert.alert('Error', 'Error al realizar asignación aleatoria');
    } finally {
      setIsLoading(false);
    }
  };

  const reassignAllStudentsRandomly = async (categoryId: string) => {
    setIsLoading(true);
    try {
      const allAssignedStudents: string[] = [];
      groups.forEach(group => {
        allAssignedStudents.push(...group.members);
      });

      // Limpiar grupos (esto debería hacerse en el backend)
      await loadGroups(categoryId);

      if (allAssignedStudents.length > 0) {
        const shuffledStudents = [...allAssignedStudents].sort(() => Math.random() - 0.5);
        let studentIndex = 0;
        let groupIndex = 0;

        while (studentIndex < shuffledStudents.length) {
          const group = groups[groupIndex];

          if (!group.isFull) {
            const studentIdentifier = shuffledStudents[studentIndex];
            await assignStudentToGroup(studentIdentifier, group.id);
            studentIndex++;
          }

          groupIndex = (groupIndex + 1) % groups.length;

          if (groups.every(g => g.isFull)) {
            break;
          }
        }
      }

      await loadGroups(categoryId);
      Alert.alert('Éxito', 'Reasignación completada');
    } catch (error) {
      console.error('Error reassigning students:', error);
      Alert.alert('Error', 'Error al reasignar estudiantes');
    } finally {
      setIsLoading(false);
    }
  };

  const getGroupStats = (group: Group) => {
    return {
      membersCount: group.members.length,
      maxCapacity: group.maxCapacity,
      occupancyRate: (group.members.length / group.maxCapacity) * 100,
      isFull: group.isFull,
      hasSpace: !group.isFull,
    };
  };

  const getStudentName = (email: string): string => {
    const info = studentInfo.find(s => s.email === email);
    return info?.name || email.split('@')[0];
  };

  const totalGroupsCount = groups.length;
  const totalStudentsCount = students.length;
  const studentsInGroupsCount = students.filter(email => findStudentGroupSync(email)).length;
  const studentsNotInGroupsCount = students.filter(email => !findStudentGroupSync(email)).length;
  const totalCapacity = groups.reduce((sum, group) => sum + group.maxCapacity, 0);
  const occupancyRate = totalCapacity > 0 ? (groups.reduce((sum, group) => sum + group.members.length, 0) / totalCapacity) * 100 : 0;
  const groupsWithSpace = groups.filter(group => !group.isFull);
  const fullGroups = groups.filter(group => group.isFull);

  const value = {
    groups,
    students,
    studentInfo,
    isLoading,
    isAssigningStudent,
    loadGroups,
    loadStudents,
    assignStudentToGroup,
    moveStudentToGroup,
    findStudentGroup,
    assignStudentsRandomly,
    reassignAllStudentsRandomly,
    getStudentsNotInAnyGroup,
    getGroupStats,
    getStudentName,
    totalGroupsCount,
    totalStudentsCount,
    studentsInGroupsCount,
    studentsNotInGroupsCount,
    totalCapacity,
    occupancyRate,
    groupsWithSpace,
    fullGroups,
  };

  return <ProfessorContext.Provider value={value}>{children}</ProfessorContext.Provider>;
}

export function useProfessor() {
  const context = useContext(ProfessorContext);
  if (!context) {
    throw new Error('useProfessor must be used inside ProfessorProvider');
  }
  return context;
}

