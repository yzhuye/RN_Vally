import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, IconButton, Surface, Button, Chip } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';

const primaryColor = '#00A4BD';
const secondaryTextColor = '#757575';
const primaryTextColor = '#212121';
const backgroundColor = '#F5F7FA';
const cardBackgroundColor = '#FFFFFF';

type Activity = {
  id: string;
  name: string;
  description: string;
  dueDate: Date;
};

type Group = {
  id: string;
  name: string;
  members: string[];
  maxMembers: number;
};

type Category = {
  id: string;
  name: string;
  groupingMethod: string;
};

type Course = {
  id: string;
  title: string;
  description: string;
};

type RouteParams = {
  CategoryActivity: {
    course: Course;
    category: Category;
  };
};

export default function CategoryActivityScreen() {
  const route = useRoute<RouteProp<RouteParams, 'CategoryActivity'>>();
  const navigation = useNavigation();
  const { course, category } = route.params;

  const [showActivities, setShowActivities] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const studentEmail = 'student@example.com'; // This should come from auth context

  const getDueDateColor = (dueDate: Date): string => {
    const now = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return '#D32F2F';
    if (diffDays <= 2) return '#F57C00';
    if (diffDays <= 7) return '#FBC02D';
    return '#388E3C';
  };

  const formatDueDate = (dueDate: Date): string => {
    const now = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `Vencida hace ${Math.abs(diffDays)} días`;
    if (diffDays === 0) return 'Vence hoy';
    if (diffDays === 1) return 'Vence mañana';
    if (diffDays <= 7) return `Vence en ${diffDays} días`;
    return `Vence el ${dueDate.toLocaleDateString()}`;
  };

  const isActivityExpired = (dueDate: Date): boolean => {
    return dueDate < new Date();
  };

  const getEvaluationCount = (activityId: string): number => {
    // TODO: Implement actual evaluation count logic
    return 0;
  };

  const navigateToEvaluation = (activity: Activity) => {
    if (isActivityExpired(activity.dueDate)) {
      Alert.alert('Actividad Vencida', 'Esta actividad ya ha vencido');
      return;
    }
    // Navigate to StudentEvaluation screen
    (navigation as any).navigate('StudentEvaluation', {
      course,
      category,
      activity,
      studentEmail,
    });
  };

  const canJoinGroup = (group: Group): boolean => {
    if (currentGroup) return false;
    return group.members.length < group.maxMembers;
  };

  const joinGroup = (group: Group) => {
    if (!canJoinGroup(group)) return;
    
    Alert.alert(
      'Unirse al Grupo',
      `¿Deseas unirte al grupo "${group.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Unirse',
          onPress: () => {
            setCurrentGroup(group);
            Alert.alert('Éxito', `Te has unido al grupo ${group.name}`);
          },
        },
      ]
    );
  };

  const renderActivitiesView = () => {
    if (category.groupingMethod === 'self-assigned' && groups.length > 0 && !currentGroup) {
      return (
        <View style={styles.emptyState}>
          <IconButton icon="account-group-outline" size={64} iconColor="#CCCCCC" />
          <Text style={styles.emptyStateTitle}>
            Debes unirte a un grupo para ver las actividades
          </Text>
        </View>
      );
    }

    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <Text>Cargando...</Text>
        </View>
      );
    }

    if (activities.length === 0) {
      return (
        <View style={styles.emptyState}>
          <IconButton icon="clipboard-text-outline" size={64} iconColor="#CCCCCC" />
          <Text style={styles.emptyStateTitle}>
            Todavía no hay actividades disponibles
          </Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.scrollView}>
        {activities.map((activity) => {
          const evaluationCount = getEvaluationCount(activity.id);
          const isExpired = isActivityExpired(activity.dueDate);

          return (
            <View key={activity.id} style={styles.activityCard}>
              <View style={styles.activityIcon}>
                <IconButton icon="clipboard-text" size={24} iconColor={primaryColor} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{activity.name}</Text>
                <Text style={styles.activityDescription} numberOfLines={2}>
                  {activity.description}
                </Text>
                <View style={styles.badgeContainer}>
                  <View
                    style={[
                      styles.dueDateBadge,
                      {
                        backgroundColor: `${getDueDateColor(activity.dueDate)}1A`,
                        borderColor: getDueDateColor(activity.dueDate),
                      },
                    ]}
                  >
                    <Text style={[styles.dueDateText, { color: getDueDateColor(activity.dueDate) }]}>
                      {formatDueDate(activity.dueDate)}
                    </Text>
                  </View>
                  {evaluationCount > 0 && (
                    <View style={[styles.evaluationBadge]}>
                      <Text style={styles.evaluationText}>
                        {evaluationCount} evaluaciones
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              {!isExpired ? (
                <Button
                  mode="contained"
                  onPress={() => navigateToEvaluation(activity)}
                  style={styles.evaluateButton}
                  buttonColor={primaryColor}
                  textColor="#FFFFFF"
                  compact
                >
                  Evaluar
                </Button>
              ) : (
                <View style={styles.expiredBadge}>
                  <Text style={styles.expiredText}>Vencida</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const renderGroupsView = () => {
    if (category.groupingMethod !== 'self-assigned') {
      return (
        <View style={styles.emptyState}>
          <IconButton icon="information-outline" size={64} iconColor="#CCCCCC" />
          <Text style={styles.emptyStateTitle}>
            Esta categoría usa método "{category.groupingMethod}"
          </Text>
          <Text style={styles.emptyStateText}>
            Los grupos no están disponibles para auto-asignación
          </Text>
        </View>
      );
    }

    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <Text>Cargando...</Text>
        </View>
      );
    }

    if (groups.length === 0) {
      return (
        <View style={styles.emptyState}>
          <IconButton icon="account-group-outline" size={64} iconColor="#CCCCCC" />
          <Text style={styles.emptyStateTitle}>
            No hay grupos disponibles para esta categoría
          </Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.scrollView}>
        {groups.map((group) => {
          const isMember = currentGroup?.id === group.id;
          const canJoin = canJoinGroup(group);

          return (
            <View key={group.id} style={styles.groupCard}>
              <View style={styles.groupHeader}>
                <IconButton icon="account-group" size={32} iconColor={primaryColor} />
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupMembers}>
                    {group.members.length} / {group.maxMembers} miembros
                  </Text>
                </View>
                {isMember && (
                  <Chip
                    mode="flat"
                    style={styles.memberChip}
                    textStyle={styles.memberChipText}
                  >
                    Miembro
                  </Chip>
                )}
              </View>
              <View style={styles.groupMembersList}>
                {group.members.map((member, index) => (
                  <View key={index} style={styles.memberItem}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberAvatarText}>
                        {member.substring(0, 1).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.memberEmail}>{member}</Text>
                  </View>
                ))}
              </View>
              {!isMember && canJoin && (
                <Button
                  mode="contained"
                  onPress={() => joinGroup(group)}
                  style={styles.joinButton}
                  buttonColor={primaryColor}
                  textColor="#FFFFFF"
                >
                  Unirse al Grupo
                </Button>
              )}
              {!isMember && !canJoin && (
                <View style={styles.fullBadge}>
                  <Text style={styles.fullText}>Grupo Completo</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <Surface style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor="#FFFFFF"
            onPress={() => navigation.goBack()}
          />
          <Text variant="titleLarge" style={styles.headerTopTitle}>
            Categoría
          </Text>
          <View style={{ width: 48 }} />
        </View>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          {category.name}
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          {course.title}
        </Text>
      </View>

      {/* Toggle Buttons */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            showActivities && styles.toggleButtonActive,
          ]}
          onPress={() => setShowActivities(true)}
        >
          <Text
            style={[
              styles.toggleButtonText,
              showActivities && styles.toggleButtonTextActive,
            ]}
          >
            Actividades
          </Text>
          {category.groupingMethod === 'self-assigned' && currentGroup && (
            <IconButton icon="check-circle" size={16} iconColor="#FFFFFF" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            !showActivities && styles.toggleButtonActive,
          ]}
          onPress={() => setShowActivities(false)}
        >
          <Text
            style={[
              styles.toggleButtonText,
              !showActivities && styles.toggleButtonTextActive,
            ]}
          >
            Grupos
          </Text>
          {category.groupingMethod === 'self-assigned' && currentGroup && (
            <IconButton
              icon={currentGroup ? 'account-group' : 'account-group-outline'}
              size={16}
              iconColor="#FFFFFF"
            />
          )}
        </TouchableOpacity>

        <View style={styles.refreshButton}>
          <IconButton
            icon="refresh"
            size={20}
            iconColor="#FFFFFF"
            onPress={() => {
              // Refresh activities
              Alert.alert('Refrescar', 'Actualizando actividades...');
            }}
          />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {showActivities ? renderActivitiesView() : renderGroupsView()}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColor,
  },
  header: {
    backgroundColor: primaryColor,
    padding: 24,
    paddingTop: 48,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTopTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    paddingVertical: 10,
  },
  toggleButtonActive: {
    backgroundColor: primaryColor,
  },
  toggleButtonText: {
    color: secondaryTextColor,
    fontSize: 14,
    fontWeight: '500',
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
  },
  refreshButton: {
    backgroundColor: primaryColor,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 16,
    color: secondaryTextColor,
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 14,
    color: secondaryTextColor,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  activityCard: {
    backgroundColor: cardBackgroundColor,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityIcon: {
    backgroundColor: `${primaryColor}1A`,
    borderRadius: 8,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
    marginLeft: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: primaryTextColor,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: secondaryTextColor,
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dueDateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  dueDateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  evaluationBadge: {
    backgroundColor: '#4CAF501A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  evaluationText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#388E3C',
  },
  evaluateButton: {
    marginLeft: 8,
  },
  expiredBadge: {
    backgroundColor: '#D32F2F1A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  expiredText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#D32F2F',
  },
  groupCard: {
    backgroundColor: cardBackgroundColor,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupInfo: {
    flex: 1,
    marginLeft: 8,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: primaryTextColor,
  },
  groupMembers: {
    fontSize: 14,
    color: secondaryTextColor,
    marginTop: 2,
  },
  memberChip: {
    backgroundColor: primaryColor,
  },
  memberChipText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  groupMembersList: {
    marginBottom: 16,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${primaryColor}1A`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    color: primaryColor,
    fontSize: 14,
    fontWeight: 'bold',
  },
  memberEmail: {
    fontSize: 14,
    color: primaryTextColor,
  },
  joinButton: {
    marginTop: 8,
  },
  fullBadge: {
    backgroundColor: '#F570001A',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  fullText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#F57C00',
  },
});
