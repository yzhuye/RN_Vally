import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, IconButton, Text } from 'react-native-paper';
import { Category } from '../../../category/domain/entities/category';
import { Course } from '../../../course/domain/entities/course';
import { CourseDetailHeader } from '../../../course/presentation/components/CourseDetailHeader';
import { useProfessor } from '../context/professor.context';

const primaryColor = '#00BCD4';
const backgroundColor = '#F5F7FA';
const secondaryTextColor = '#757575';
const primaryTextColor = '#212121';

type RouteParams = {
  ProfessorGroups: {
    course: Course;
    category: Category;
  };
  StudentManagement: {
    course: Course;
    category: Category;
  };
};

export default function ProfessorGroupsScreen() {
  const route = useRoute<RouteProp<RouteParams, 'ProfessorGroups'>>();
  const navigation = useNavigation<any>();
  const { 
    groups, 
    isLoading, 
    loadGroups, 
    loadStudents,
    getGroupStats,
    totalGroupsCount,
    totalStudentsCount,
    totalCapacity,
    occupancyRate,
    groupsWithSpace,
    fullGroups
  } = useProfessor();

  
  const [course] = useState<Course>(route.params.course);
  const [category] = useState<Category>(route.params.category);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'available' | 'full'>('all');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadGroups(category.id);
    loadStudents(course);
  }, [category.id, course]);

  const toggleGroupExpansion = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const navigateToStudentManagement = () => {
    navigation.navigate('StudentManagement' as never, { course, category } as never);
  };

  const getFilteredGroups = () => {
    switch (selectedFilter) {
      case 'available':
        return groupsWithSpace;
      case 'full':
        return fullGroups;
      default:
        return groups;
    }
  };

  const filteredGroups = getFilteredGroups();

  return (
    <View style={styles.container}>
      <CourseDetailHeader course={course} screenTitle={`Grupos - ${category.name}`} />

      {/* Estadísticas generales */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <IconButton icon="folder-multiple" size={24} iconColor={primaryColor} />
          <Text style={styles.statValue}>{totalGroupsCount}</Text>
          <Text style={styles.statLabel}>Total Grupos</Text>
        </View>
        <View style={styles.statItem}>
          <IconButton icon="account-group" size={24} iconColor={primaryColor} />
          <Text style={styles.statValue}>{totalStudentsCount}</Text>
          <Text style={styles.statLabel}>Estudiantes</Text>
        </View>
        <View style={styles.statItem}>
          <IconButton icon="seat" size={24} iconColor={primaryColor} />
          <Text style={styles.statValue}>{totalCapacity}</Text>
          <Text style={styles.statLabel}>Capacidad</Text>
        </View>
        <View style={styles.statItem}>
          <IconButton icon="chart-pie" size={24} iconColor={primaryColor} />
          <Text style={styles.statValue}>{occupancyRate.toFixed(1)}%</Text>
          <Text style={styles.statLabel}>Ocupación</Text>
        </View>
      </View>

      {/* Botón de gestión de estudiantes */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={navigateToStudentManagement}
          icon="account-cog"
          buttonColor={primaryColor}
          style={styles.manageButton}
        >
          Gestión de Estudiantes
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
            selected={selectedFilter === 'available'}
            onPress={() => setSelectedFilter('available')}
            style={styles.filterChip}
            icon="account-plus"
          >
            Con Espacio
          </Chip>
          <Chip
            selected={selectedFilter === 'full'}
            onPress={() => setSelectedFilter('full')}
            style={styles.filterChip}
            icon="check-circle"
          >
            Llenos
          </Chip>
        </ScrollView>
        <IconButton
          icon="refresh"
          size={24}
          iconColor="#FFFFFF"
          style={styles.refreshButton}
          onPress={() => loadGroups(category.id)}
        />
      </View>

      {/* Lista de grupos */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        ) : filteredGroups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconButton icon="folder-off" size={64} iconColor="#CCCCCC" />
            <Text style={styles.emptyTitle}>No hay grupos en esta categoría</Text>
            <Text style={styles.emptySubtitle}>
              Los grupos se crearán automáticamente cuando se agregue la categoría
            </Text>
          </View>
        ) : (
          filteredGroups.map((group) => {
            const stats = getGroupStats(group);
            const isExpanded = expandedGroups.has(group.id);

            return (
              <Card key={group.id} style={styles.groupCard}>
                <TouchableOpacity onPress={() => toggleGroupExpansion(group.id)}>
                  <Card.Content style={styles.groupCardContent}>
                    <View style={[styles.groupAvatar, stats.isFull && styles.groupAvatarFull]}>
                      <Text style={styles.groupAvatarText}>{stats.membersCount}</Text>
                    </View>
                    <View style={styles.groupInfo}>
                      <Text style={styles.groupName}>{group.name}</Text>
                      <Text style={styles.groupCapacity}>
                        Capacidad: {stats.membersCount}/{stats.maxCapacity}
                      </Text>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { width: `${stats.occupancyRate}%` },
                            stats.isFull && styles.progressFillFull
                          ]} 
                        />
                      </View>
                    </View>
                    <IconButton
                      icon={stats.isFull ? 'check-circle' : 'account-plus'}
                      size={24}
                      iconColor={stats.isFull ? '#4CAF50' : primaryColor}
                    />
                  </Card.Content>
                </TouchableOpacity>

                {isExpanded && (
                  <Card.Content style={styles.expandedContent}>
                    {group.members.length > 0 ? (
                      <>
                        <Text style={styles.membersTitle}>Integrantes:</Text>
                        {group.members.map((member, index) => (
                          <View key={index} style={styles.memberRow}>
                            <IconButton icon="account" size={16} iconColor={secondaryTextColor} />
                            <Text style={styles.memberText}>{member}</Text>
                          </View>
                        ))}
                      </>
                    ) : (
                      <Text style={styles.noMembersText}>No hay integrantes en este grupo</Text>
                    )}
                  </Card.Content>
                )}
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
  buttonContainer: {
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  manageButton: {
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
  emptySubtitle: {
    fontSize: 14,
    color: secondaryTextColor,
    marginTop: 8,
    textAlign: 'center',
  },
  groupCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  groupCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  groupAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupAvatarFull: {
    backgroundColor: '#4CAF50',
  },
  groupAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: primaryTextColor,
    marginBottom: 4,
  },
  groupCapacity: {
    fontSize: 14,
    color: secondaryTextColor,
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: primaryColor,
  },
  progressFillFull: {
    backgroundColor: '#4CAF50',
  },
  expandedContent: {
    paddingTop: 0,
    paddingBottom: 16,
  },
  membersTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  memberText: {
    fontSize: 14,
    color: primaryTextColor,
  },
  noMembersText: {
    fontSize: 14,
    color: secondaryTextColor,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
});

