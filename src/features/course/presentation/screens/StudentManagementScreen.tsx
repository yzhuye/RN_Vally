import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, IconButton, Card, Chip, ActivityIndicator, Button, Menu } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Course } from '../../domain/entities/course';
import { Category } from '../../domain/entities/category';
import { CourseDetailHeader } from '../components/CourseDetailHeader';
import { useProfessor } from '../context/professor.context';

const primaryColor = '#00BCD4';
const backgroundColor = '#F5F7FA';
const secondaryTextColor = '#757575';
const primaryTextColor = '#212121';

type RouteParams = {
  StudentManagement: {
    course: Course;
    category: Category;
  };
};

export default function StudentManagementScreen() {
  const route = useRoute<RouteProp<RouteParams, 'StudentManagement'>>();
  const navigation = useNavigation();
  const { 
    groups,
    students,
    isLoading,
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
    totalStudentsCount,
    studentsInGroupsCount,
    studentsNotInGroupsCount,
    totalGroupsCount,
    groupsWithSpace
  } = useProfessor();
  
  const [course] = useState<Course>(route.params.course);
  const [category] = useState<Category>(route.params.category);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [studentGroups, setStudentGroups] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    loadGroups(category.id);
    loadStudents(course);
  }, [category.id, course]);

  useEffect(() => {
    // Cargar grupos de estudiantes
    const loadStudentGroups = async () => {
      const groupMap = new Map();
      for (const student of students) {
        const group = await findStudentGroup(category.id, student);
        if (group) {
          groupMap.set(student, group);
        }
      }
      setStudentGroups(groupMap);
    };
    
    if (students.length > 0) {
      loadStudentGroups();
    }
  }, [students, groups]);

  const handleAssignStudent = (studentEmail: string) => {
    const availableGroups = groupsWithSpace;

    if (availableGroups.length === 0) {
      Alert.alert('Sin grupos disponibles', 'No hay grupos con espacio disponible');
      return;
    }

    Alert.alert(
      `Asignar ${getStudentName(studentEmail)}`,
      'Selecciona un grupo',
      [
        ...availableGroups.map(group => {
          const stats = getGroupStats(group);
          return {
            text: `${group.name} (${stats.membersCount}/${stats.maxCapacity})`,
            onPress: async () => {
              const success = await assignStudentToGroup(studentEmail, group.id);
              if (success) {
                await loadGroups(category.id);
                // Actualizar el mapa de grupos
                const updatedGroup = await findStudentGroup(category.id, studentEmail);
                if (updatedGroup) {
                  setStudentGroups(prev => new Map(prev).set(studentEmail, updatedGroup));
                }
              }
            },
          };
        }),
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const handleMoveStudent = (studentEmail: string, currentGroup: any) => {
    const availableGroups = groupsWithSpace.filter(g => g.id !== currentGroup.id);

    if (availableGroups.length === 0) {
      Alert.alert('Sin grupos disponibles', 'No hay otros grupos con espacio disponible');
      return;
    }

    Alert.alert(
      `Mover ${getStudentName(studentEmail)}`,
      'Selecciona el nuevo grupo',
      [
        ...availableGroups.map(group => {
          const stats = getGroupStats(group);
          return {
            text: `${group.name} (${stats.membersCount}/${stats.maxCapacity})`,
            onPress: async () => {
              const success = await moveStudentToGroup(studentEmail, group.id);
              if (success) {
                await loadGroups(category.id);
                const updatedGroup = await findStudentGroup(category.id, studentEmail);
                if (updatedGroup) {
                  setStudentGroups(prev => new Map(prev).set(studentEmail, updatedGroup));
                }
                Alert.alert('Éxito', 'Estudiante movido exitosamente');
              }
            },
          };
        }),
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const handleRemoveStudent = (studentEmail: string, group: any) => {
    Alert.alert(
      'Confirmar',
      `¿Está seguro de que desea quitar a ${getStudentName(studentEmail)} del ${group.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar',
          style: 'destructive',
          onPress: async () => {
            // TODO: Implementar remoción de estudiante
            Alert.alert('Información', 'Funcionalidad en desarrollo');
          },
        },
      ]
    );
  };

  const handleRandomAssignment = async () => {
    if (studentsNotInGroupsCount === 0) {
      Alert.alert('Información', 'No hay estudiantes sin asignar');
      return;
    }

    Alert.alert(
      'Asignar Aleatoriamente',
      `¿Deseas asignar aleatoriamente a ${studentsNotInGroupsCount} estudiante(s)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Asignar',
          onPress: async () => {
            await assignStudentsRandomly(category.id);
            await loadGroups(category.id);
          },
        },
      ]
    );
  };

  const handleReassignAll = async () => {
    if (studentsInGroupsCount === 0) {
      Alert.alert('Información', 'No hay estudiantes asignados');
      return;
    }

    Alert.alert(
      'Reasignar Todos',
      `¿Deseas reasignar aleatoriamente a todos los estudiantes?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reasignar',
          onPress: async () => {
            await reassignAllStudentsRandomly(category.id);
            await loadGroups(category.id);
          },
        },
      ]
    );
  };

  const getFilteredStudents = () => {
    switch (selectedFilter) {
      case 'assigned':
        return students.filter(student => studentGroups.has(student));
      case 'unassigned':
        return getStudentsNotInAnyGroup();
      default:
        return students;
    }
  };

  const filteredStudents = getFilteredStudents();

  return (
    <View style={styles.container}>
      <CourseDetailHeader course={course} screenTitle={`Gestión de Estudiantes - ${category.name}`} />

      {/* Estadísticas */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <IconButton icon="account-group" size={24} iconColor={primaryColor} />
          <Text style={styles.statValue}>{totalStudentsCount}</Text>
          <Text style={styles.statLabel}>Total Estudiantes</Text>
        </View>
        <View style={styles.statItem}>
          <IconButton icon="account-check" size={24} iconColor={primaryColor} />
          <Text style={styles.statValue}>{studentsInGroupsCount}</Text>
          <Text style={styles.statLabel}>En Grupos</Text>
        </View>
        <View style={styles.statItem}>
          <IconButton icon="account-off" size={24} iconColor={primaryColor} />
          <Text style={styles.statValue}>{studentsNotInGroupsCount}</Text>
          <Text style={styles.statLabel}>Sin Grupo</Text>
        </View>
        <View style={styles.statItem}>
          <IconButton icon="folder" size={24} iconColor={primaryColor} />
          <Text style={styles.statValue}>{totalGroupsCount}</Text>
          <Text style={styles.statLabel}>Total Grupos</Text>
        </View>
      </View>

      {/* Botones de asignación aleatoria */}
      <View style={styles.buttonRow}>
        <Button
          mode="contained"
          onPress={handleRandomAssignment}
          icon="shuffle"
          buttonColor="#4CAF50"
          style={styles.actionButton}
          disabled={studentsNotInGroupsCount === 0 || groups.length === 0}
        >
          Asignar Aleatoriamente
        </Button>
        <Button
          mode="contained"
          onPress={handleReassignAll}
          icon="refresh"
          buttonColor="#FF9800"
          style={styles.actionButton}
          disabled={studentsInGroupsCount === 0 || groups.length === 0}
        >
          Reasignar Todos
        </Button>
      </View>

      {/* Filtros */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <Chip
            selected={selectedFilter === 'all'}
            onPress={() => setSelectedFilter('all')}
            style={styles.filterChip}
            icon="format-list-bulleted"
          >
            Todos
          </Chip>
          <Chip
            selected={selectedFilter === 'assigned'}
            onPress={() => setSelectedFilter('assigned')}
            style={styles.filterChip}
            icon="account-check"
          >
            En Grupos
          </Chip>
          <Chip
            selected={selectedFilter === 'unassigned'}
            onPress={() => setSelectedFilter('unassigned')}
            style={styles.filterChip}
            icon="account-off"
          >
            Sin Grupo
          </Chip>
        </ScrollView>
        <IconButton
          icon="refresh"
          size={24}
          iconColor="#FFFFFF"
          style={styles.refreshButton}
          onPress={() => {
            loadGroups(category.id);
            loadStudents(course);
          }}
        />
      </View>

      {/* Lista de estudiantes */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        ) : filteredStudents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconButton icon="account-outline" size={64} iconColor="#CCCCCC" />
            <Text style={styles.emptyTitle}>
              {selectedFilter === 'unassigned'
                ? 'Todos los estudiantes están asignados a grupos'
                : 'No hay estudiantes en este curso'}
            </Text>
          </View>
        ) : (
          filteredStudents.map((studentEmail) => {
            const currentGroup = studentGroups.get(studentEmail);
            const isAssigned = !!currentGroup;

            return (
              <Card key={studentEmail} style={styles.studentCard}>
                <Card.Content style={styles.studentCardContent}>
                  <View style={[styles.studentAvatar, isAssigned ? styles.studentAvatarAssigned : styles.studentAvatarUnassigned]}>
                    <IconButton
                      icon={isAssigned ? 'account-check' : 'account'}
                      size={24}
                      iconColor="#FFFFFF"
                    />
                  </View>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{getStudentName(studentEmail)}</Text>
                    <Text style={styles.studentEmail}>{studentEmail}</Text>
                    {isAssigned && currentGroup && (
                      <>
                        <Text style={styles.studentGroup}>Grupo: {currentGroup.name}</Text>
                        <Text style={styles.studentCapacity}>
                          Capacidad: {currentGroup.members.length}/{currentGroup.maxCapacity}
                        </Text>
                      </>
                    )}
                    {!isAssigned && (
                      <Text style={styles.studentUnassigned}>Sin grupo asignado</Text>
                    )}
                  </View>
                  <Menu
                    visible={menuVisible === studentEmail}
                    onDismiss={() => setMenuVisible(null)}
                    anchor={
                      <IconButton
                        icon="dots-vertical"
                        size={24}
                        onPress={() => setMenuVisible(studentEmail)}
                      />
                    }
                  >
                    {isAssigned ? (
                      <>
                        <Menu.Item
                          onPress={() => {
                            setMenuVisible(null);
                            handleMoveStudent(studentEmail, currentGroup);
                          }}
                          title="Cambiar de grupo"
                          leadingIcon="swap-horizontal"
                        />
                        <Menu.Item
                          onPress={() => {
                            setMenuVisible(null);
                            handleRemoveStudent(studentEmail, currentGroup);
                          }}
                          title="Quitar del grupo"
                          leadingIcon="account-remove"
                        />
                      </>
                    ) : (
                      <Menu.Item
                        onPress={() => {
                          setMenuVisible(null);
                          handleAssignStudent(studentEmail);
                        }}
                        title="Asignar a grupo"
                        leadingIcon="account-plus"
                      />
                    )}
                  </Menu>
                </Card.Content>
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColor,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: `${primaryColor}19`,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${primaryColor}4D`,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: primaryColor,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: secondaryTextColor,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 8,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterScroll: {
    flex: 1,
  },
  filterChip: {
    marginRight: 8,
  },
  refreshButton: {
    backgroundColor: primaryColor,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    color: secondaryTextColor,
    marginTop: 16,
    textAlign: 'center',
  },
  studentCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  studentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentAvatarAssigned: {
    backgroundColor: '#4CAF50',
  },
  studentAvatarUnassigned: {
    backgroundColor: '#FF9800',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: primaryTextColor,
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 12,
    color: secondaryTextColor,
    marginBottom: 4,
  },
  studentGroup: {
    fontSize: 14,
    color: primaryTextColor,
  },
  studentCapacity: {
    fontSize: 14,
    color: secondaryTextColor,
  },
  studentUnassigned: {
    fontSize: 14,
    color: '#FF9800',
  },
});

