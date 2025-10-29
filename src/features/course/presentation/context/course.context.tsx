import { useDI } from '@/src/core/di/DIProvider';
import { TOKENS } from '@/src/core/di/tokens';
import { useAuth } from '@/src/features/auth/presentation/context/authContext';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Course } from '../../domain/entities/course';
import { CreateCourseUseCase } from '../../domain/usecases/createCourse.usecases';
import { GetAllCoursesUseCase } from '../../domain/usecases/getAllCourses.usecases';
import { JoinCourseUseCase } from '../../domain/usecases/joinCourse.usecases';

type CourseContextType = {
  professorCourses: Course[];
  studentCourses: Course[];
  isLoading: boolean;
  searchText: string;
  selectedUserType: 'Estudiante' | 'Profesor';
  createCourse: (title: string, description: string) => Promise<void>;
  joinCourseWithCode: (invitationCode: string) => Promise<void>;
  updateSearchText: (text: string) => void;
  selectUserType: (userType: 'Estudiante' | 'Profesor') => void;
  loadUserCourses: () => Promise<void>;
  filteredCourses: Course[];
};

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const di = useDI();
  const { user } = useAuth();

  const getAllCoursesUseCase = di.resolve<GetAllCoursesUseCase>(TOKENS.GetAllCoursesUC);
  const createCourseUseCase = di.resolve<CreateCourseUseCase>(TOKENS.CreateCourseUC);
  const joinCourseUseCase = di.resolve<JoinCourseUseCase>(TOKENS.JoinCourseUC);

  const [professorCourses, setProfessorCourses] = useState<Course[]>([]);
  const [studentCourses, setStudentCourses] = useState<Course[]>([]);
  const [originalProfessorCourses, setOriginalProfessorCourses] = useState<Course[]>([]);
  const [originalStudentCourses, setOriginalStudentCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedUserType, setSelectedUserType] = useState<'Estudiante' | 'Profesor'>('Estudiante');

  const loadUserCourses = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const courses = await getAllCoursesUseCase.execute();
      
      // Separar cursos por rol
      const professorCoursesData = courses.filter(course => course.createdBy === user.email);
      const studentCoursesData = courses.filter(course => course.enrolledStudents.includes(user.email));

      setOriginalProfessorCourses(professorCoursesData);
      setOriginalStudentCourses(studentCoursesData);
      setProfessorCourses(professorCoursesData);
      setStudentCourses(studentCoursesData);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los cursos');
      console.error('Error loading courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserCourses();
    }
  }, [user]);

  const applySearch = () => {
    if (!searchText) {
      setProfessorCourses(originalProfessorCourses);
      setStudentCourses(originalStudentCourses);
      return;
    }

    const query = searchText.toLowerCase();
    const filteredProfessor = originalProfessorCourses.filter(
      course => course.title.toLowerCase().includes(query)
    );
    const filteredStudent = originalStudentCourses.filter(
      course => course.title.toLowerCase().includes(query)
    );

    setProfessorCourses(filteredProfessor);
    setStudentCourses(filteredStudent);
  };

  const updateSearchText = (text: string) => {
    setSearchText(text);
    applySearch();
  };

  const selectUserType = (userType: 'Estudiante' | 'Profesor') => {
    setSelectedUserType(userType);
  };

  const createCourse = async (title: string, description: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      await createCourseUseCase.execute({
        title,
        description,
        invitationCode: `CODE${Date.now() % 10000}`,
        imageUrl: undefined,
        createdByUserEmail: user.email,
        createdByUserId: user.email // Usando email como ID por ahora
      });

      await loadUserCourses();
      Alert.alert('Éxito', 'Curso creado exitosamente');
    } catch (error) {
      Alert.alert('Error', 'Error al crear el curso');
      console.error('Error creating course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const joinCourseWithCode = async (invitationCode: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      await joinCourseUseCase.execute(invitationCode, user.email);
      await loadUserCourses();
      Alert.alert('Éxito', 'Te has unido al curso exitosamente');
    } catch (error) {
      Alert.alert('Error', 'Error al unirse al curso');
      console.error('Error joining course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = selectedUserType === 'Profesor' ? professorCourses : studentCourses;

  const value = {
    professorCourses,
    studentCourses,
    isLoading,
    searchText,
    selectedUserType,
    createCourse,
    joinCourseWithCode,
    updateSearchText,
    selectUserType,
    loadUserCourses,
    filteredCourses,
  };

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}

export function useCourse() {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used inside CourseProvider');
  }
  return context;
}