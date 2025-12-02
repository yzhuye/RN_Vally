import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, IconButton, Surface, Text } from 'react-native-paper';
import { Course } from '../../domain/entities/course';
import { CourseDetailHeader } from '../components/CourseDetailHeader';
import { useCourse } from '../context/course.context';

const primaryColor = '#00BCD4';
const secondaryTextColor = '#757575';
const primaryTextColor = '#212121';
const backgroundColor = '#F5F7FA';
const cardBackgroundColor = '#FFFFFF';

type RouteParams = {
  CourseManagement: {
    course: Course;
  };
};

export default function CourseManagementScreen() {
  const route = useRoute<RouteProp<RouteParams, 'CourseManagement'>>();
  const navigation = useNavigation();
  const { loadUserCourses } = useCourse();
  const [course, setCourse] = useState<Course>(route.params.course);
  const [isStudentListVisible, setIsStudentListVisible] = useState(false);

  useEffect(() => {
    setCourse(route.params.course);
  }, [route.params.course]);

  const toggleStudentListVisibility = () => {
    setIsStudentListVisible(!isStudentListVisible);
  };

  const handleCopyInvitationCode = async () => {
    await Clipboard.setStringAsync(course.invitationCode);
    Alert.alert('Copiado', 'Código copiado al portapapeles');
  };

  const handleGenerateNewCode = () => {
    Alert.alert(
      'Generar Nuevo Código',
      '¿Estás seguro de que deseas generar un nuevo código de invitación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Generar',
          onPress: async () => {
            // TODO: Implementar generación de nuevo código
            Alert.alert('Información', 'Funcionalidad en desarrollo');
          },
        },
      ]
    );
  };

  const navigateToProfessorCategories = () => {
    (navigation as any).navigate('ProfessorCategory', { course });
  };

  return (
    <Surface style={styles.container}>
      <ScrollView>
        <CourseDetailHeader course={course} screenTitle="Gestión del Curso" />

        <View style={styles.content}>
          {/* Sección de Estadísticas */}
          <TouchableOpacity
            style={[
              styles.statsCard,
              isStudentListVisible && styles.statsCardActive,
            ]}
            onPress={toggleStudentListVisibility}
          >
            <IconButton
              icon={isStudentListVisible ? 'account-group' : 'account-group-outline'}
              size={32}
              iconColor={primaryColor}
            />
            <Text style={styles.statsNumber}>{course.enrolledStudents.length}</Text>
            <Text style={styles.statsLabel}>Estudiantes</Text>
          </TouchableOpacity>

          {/* Código de invitación */}
          <View style={styles.invitationSection}>
            <View style={styles.invitationHeader}>
              <IconButton icon="qr-code" size={24} iconColor={primaryColor} />
              <Text style={styles.invitationTitle}>Código de Invitación</Text>
            </View>

            <View style={styles.invitationCodeContainer}>
              <Text style={styles.invitationCode}>{course.invitationCode}</Text>
              <IconButton
                icon="content-copy"
                size={20}
                iconColor={primaryColor}
                onPress={handleCopyInvitationCode}
              />
            </View>

            <Button
              mode="outlined"
              onPress={handleGenerateNewCode}
              icon="refresh"
              style={styles.generateButton}
              textColor={primaryColor}
            >
              Generar Nuevo Código
            </Button>
          </View>

          {/* Botón de Administrar Categorías */}
          <Button
            mode="contained"
            onPress={navigateToProfessorCategories}
            icon="folder-multiple"
            style={styles.manageCategoriesButton}
            buttonColor={primaryColor}
          >
            Administrar Categorías
          </Button>

          {/* Lista de estudiantes */}
          {isStudentListVisible && (
            <View style={styles.studentsSection}>
              <View style={styles.studentsSectionHeader}>
                <IconButton icon="account-group" size={24} iconColor={primaryTextColor} />
                <Text style={styles.studentsSectionTitle}>Estudiantes Inscritos</Text>
              </View>

              {course.enrolledStudents.length === 0 ? (
                <View style={styles.emptyState}>
                  <IconButton icon="account-off" size={64} iconColor="#CCCCCC" />
                  <Text style={styles.emptyStateText}>
                    No hay estudiantes inscritos aún
                  </Text>
                </View>
              ) : (
                course.enrolledStudents.map((student, index) => (
                  <View key={index} style={styles.studentCard}>
                    <View style={styles.studentAvatar}>
                      <Text style={styles.studentAvatarText}>
                        {student[0].toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.studentName}>{student}</Text>
                    <IconButton icon="check-circle" size={20} iconColor="#4CAF50" />
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColor,
  },
  content: {
    padding: 16,
  },
  statsCard: {
    backgroundColor: cardBackgroundColor,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  statsCardActive: {
    backgroundColor: `${primaryColor}1A`,
    borderColor: primaryColor,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: primaryTextColor,
    marginTop: 8,
  },
  statsLabel: {
    fontSize: 14,
    color: secondaryTextColor,
  },
  invitationSection: {
    backgroundColor: `${primaryColor}14`,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  invitationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  invitationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: primaryColor,
  },
  invitationCodeContainer: {
    backgroundColor: cardBackgroundColor,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: primaryColor,
    marginBottom: 16,
  },
  invitationCode: {
    fontSize: 26,
    fontWeight: 'bold',
    color: primaryTextColor,
    letterSpacing: 3,
  },
  generateButton: {
    borderColor: primaryColor,
  },
  manageCategoriesButton: {
    marginBottom: 24,
    paddingVertical: 8,
  },
  studentsSection: {
    marginTop: 24,
  },
  studentsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  studentsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: primaryTextColor,
  },
  emptyState: {
    backgroundColor: cardBackgroundColor,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: secondaryTextColor,
    marginTop: 16,
  },
  studentCard: {
    backgroundColor: cardBackgroundColor,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  studentName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: primaryTextColor,
  },
});

