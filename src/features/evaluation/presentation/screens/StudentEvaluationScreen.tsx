import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, IconButton, Surface, Text } from 'react-native-paper';
import { useAuth } from '../../../auth/presentation/context/authContext';
import { useGroup } from '../../../group/presentation/context/group.context';
import { useEvaluation } from '../context/evaluation.context';

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

type Category = {
  id: string;
  name: string;
};

type Course = {
  id: string;
  title: string;
  description: string;
};

type RouteParams = {
  StudentEvaluation: {
    course: Course;
    category: Category;
    activity: Activity;
    studentEmail: string;
  };
};

export default function StudentEvaluationScreen() {
  const route = useRoute<RouteProp<RouteParams, 'StudentEvaluation'>>();
  const navigation = useNavigation();
  const { course, category, activity, studentEmail } = route.params;
  const { user, getUserIdByEmail } = useAuth();

  // Group context
  const {
    groups,
    isLoading: groupsLoading,
    loadGroups,
    currentGroup
  } = useGroup();

  // Evaluation context
  const { 
    evaluations,
    isLoading: evaluationsLoading,
    loadEvaluations,
    checkEligibility,
    hasEvaluated: hasEvaluatedFromContext
  } = useEvaluation();

  const [isCheckingEligibility, setIsCheckingEligibility] = useState<{ [key: string]: boolean }>({});
  const [memberEvaluationStatus, setMemberEvaluationStatus] = useState<{ [key: string]: boolean }>({});
  
  const isLoading = groupsLoading || evaluationsLoading;

  // Get group members (excluding current user)
  const groupMembers = currentGroup?.members.filter(member => member !== (user?.email || studentEmail)) || [];

  // Load data on component mount
  useEffect(() => {
    if (category.id && activity.id) {
      loadGroups(category.id);
      loadEvaluations(activity.id);
    }
  }, [category.id, activity.id]);

  // Check evaluation status for all group members when evaluations or members change
  useEffect(() => {
    const checkEvaluationStatus = async () => {
      if (!groupMembers.length || !user?.id) return;

      const statusMap: { [key: string]: boolean } = {};
      
      for (const memberEmail of groupMembers) {
        try {
          // Get the member's user ID
          const memberUserId = await getUserIdByEmail(memberEmail);
          if (memberUserId) {
            // Check if current user has evaluated this member
            const hasEvaluated = evaluations.some(evaluation => 
              evaluation.activityId === activity.id && 
              evaluation.evaluatorId === user.id && 
              evaluation.evaluatedId === memberUserId
            );
            statusMap[memberEmail] = hasEvaluated;
          } else {
            statusMap[memberEmail] = false;
          }
        } catch (error) {
          console.error('Error checking evaluation status for', memberEmail, error);
          statusMap[memberEmail] = false;
        }
      }
      
      setMemberEvaluationStatus(statusMap);
    };

    checkEvaluationStatus();
  }, [groupMembers, evaluations, user?.id, activity.id, getUserIdByEmail]);

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

  const hasEvaluated = (memberEmail: string): boolean => {
    // Use the cached evaluation status from state
    return memberEvaluationStatus[memberEmail] || false;
  };

  const checkMemberEligibility = async (memberEmail: string): Promise<boolean> => {
    try {
      setIsCheckingEligibility(prev => ({ ...prev, [memberEmail]: true }));
      
      // Get user IDs - we need actual IDs for the evaluation system
      const evaluatorEmail = user?.email || studentEmail;
      let evaluatorId: string | null = user?.id || null;
      if (!evaluatorId) {
        evaluatorId = await getUserIdByEmail(evaluatorEmail);
      }
      let evaluatedId: string | null = await getUserIdByEmail(memberEmail);
      
      // If we can't get user IDs, we can't perform the evaluation
      if (!evaluatorId) {
        console.warn('Could not get evaluator ID for:', evaluatorEmail);
        return false;
      }
      if (!evaluatedId) {
        console.warn('Could not get evaluated ID for:', memberEmail);
        return false;
      }
      
      const result = await checkEligibility({
        activityId: activity.id,
        courseId: course.id,
        evaluatorId: evaluatorId,
        evaluatedId: evaluatedId
      });
      
      return result.isEligible;
    } catch (error) {
      console.error('Error checking member eligibility:', error);
      return false;
    } finally {
      setIsCheckingEligibility(prev => ({ ...prev, [memberEmail]: false }));
    }
  };

  const navigateToEvaluationForm = (evaluatedEmail: string) => {
    (navigation as any).navigate('EvaluationForm', {
      course,
      category,
      activity,
      evaluatedEmail,
      studentEmail: user?.email || studentEmail,
    });
  };

  const showEvaluationDetails = async (memberEmail: string) => {
    try {
      if (!user?.id) return;

      // Get the member's user ID
      const memberUserId = await getUserIdByEmail(memberEmail);
      if (!memberUserId) return;

      // Find the evaluation using user IDs
      const evaluation = evaluations.find(
        (evaluation) => evaluation.activityId === activity.id && 
                       evaluation.evaluatorId === user.id && 
                       evaluation.evaluatedId === memberUserId
      );

      if (!evaluation) return;

      const average = (
        evaluation.punctuality +
        evaluation.contributions +
        evaluation.commitment +
        evaluation.attitude
      ) / 4.0;

      Alert.alert(
        `Evaluación de ${memberEmail}`,
        `Puntualidad: ${evaluation.punctuality}/5\n` +
        `Contribuciones: ${evaluation.contributions}/5\n` +
        `Compromiso: ${evaluation.commitment}/5\n` +
        `Actitud: ${evaluation.attitude}/5\n\n` +
        `Promedio: ${average.toFixed(1)}/5.0`,
        [{ text: 'Cerrar' }]
      );
    } catch (error) {
      console.error('Error showing evaluation details:', error);
    }
  };

  const isExpired = isActivityExpired(activity.dueDate);

  return (
    <Surface style={styles.container}>
      <ScrollView>
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
              Evaluar Compañeros
            </Text>
            <View style={{ width: 48 }} />
          </View>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            {course.title}
          </Text>
        </View>

        <View style={styles.content}>
          {/* Activity Info Card */}
          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <View style={styles.activityIconContainer}>
                <IconButton icon="clipboard-text" size={24} iconColor={primaryColor} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityName}>{activity.name}</Text>
                <Text style={styles.activityDescription}>{activity.description}</Text>
              </View>
            </View>
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
          </View>

          {/* Instructions */}
          <View style={styles.instructionsCard}>
            <IconButton icon="information-outline" size={20} iconColor="#1976D2" />
            <Text style={styles.instructionsText}>
              Evalúa a tus compañeros de grupo usando las 5 métricas. Cada métrica se califica de 0 a 5 estrellas.
            </Text>
          </View>

          {/* Section Title */}
          <Text style={styles.sectionTitle}>Compañeros de Grupo</Text>

          {/* Group Members List */}
          {isLoading ? (
            <View style={styles.emptyState}>
              <Text>Cargando...</Text>
            </View>
          ) : groupMembers.length === 0 ? (
            <View style={styles.emptyState}>
              <IconButton icon="account-group-outline" size={64} iconColor="#CCCCCC" />
              <Text style={styles.emptyStateText}>
                No hay otros compañeros en tu grupo para evaluar
              </Text>
            </View>
          ) : (
            groupMembers.map((memberEmail) => {
              const memberHasEvaluated = hasEvaluated(memberEmail);
              const isCheckingMember = isCheckingEligibility[memberEmail] || false;

              return (
                <View key={memberEmail} style={styles.memberCard}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>
                      {memberEmail.substring(0, 1).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberEmail}>{memberEmail}</Text>
                    <View style={styles.memberStatus}>
                      {memberHasEvaluated ? (
                        <Chip
                          mode="flat"
                          style={styles.evaluatedChip}
                          textStyle={styles.evaluatedChipText}
                        >
                          Ya evaluado
                        </Chip>
                      ) : isExpired ? (
                        <Chip
                          mode="flat"
                          style={styles.expiredChip}
                          textStyle={styles.expiredChipText}
                        >
                          Tiempo vencido
                        </Chip>
                      ) : isCheckingMember ? (
                        <Chip
                          mode="flat"
                          style={styles.checkingChip}
                          textStyle={styles.checkingChipText}
                        >
                          Comprobando...
                        </Chip>
                      ) : (
                        <Chip
                          mode="flat"
                          style={styles.pendingChip}
                          textStyle={styles.pendingChipText}
                        >
                          Pendiente de evaluar
                        </Chip>
                      )}
                    </View>
                  </View>
                  {!memberHasEvaluated && !isExpired && !isCheckingMember ? (
                    <Button
                      mode="contained"
                      onPress={() => navigateToEvaluationForm(memberEmail)}
                      style={styles.evaluateButton}
                      buttonColor={primaryColor}
                      textColor="#FFFFFF"
                      compact
                    >
                      Evaluar
                    </Button>
                  ) : memberHasEvaluated ? (
                    <IconButton
                      icon="eye"
                      size={24}
                      iconColor={primaryColor}
                      onPress={() => showEvaluationDetails(memberEmail)}
                    />
                  ) : null}
                </View>
              );
            })
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
  headerSubtitle: {
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  activityCard: {
    backgroundColor: cardBackgroundColor,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  activityIconContainer: {
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
  activityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: primaryTextColor,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: secondaryTextColor,
  },
  dueDateBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  dueDateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  instructionsCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  instructionsText: {
    flex: 1,
    fontSize: 13,
    color: '#0D47A1',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: secondaryTextColor,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: secondaryTextColor,
    textAlign: 'center',
    marginTop: 16,
  },
  memberCard: {
    backgroundColor: cardBackgroundColor,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${primaryColor}1A`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    color: primaryColor,
    fontWeight: 'bold',
    fontSize: 18,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberEmail: {
    fontSize: 16,
    fontWeight: '500',
    color: primaryTextColor,
    marginBottom: 4,
  },
  memberStatus: {
    flexDirection: 'row',
  },
  evaluatedChip: {
    backgroundColor: '#4CAF501A',
    height: 24,
  },
  evaluatedChipText: {
    color: '#388E3C',
    fontSize: 12,
    fontWeight: '500',
  },
  expiredChip: {
    backgroundColor: '#D32F2F1A',
    height: 24,
  },
  expiredChipText: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: '500',
  },
  checkingChip: {
    backgroundColor: '#E0E0E0',
    height: 24,
  },
  checkingChipText: {
    color: secondaryTextColor,
    fontSize: 12,
    fontWeight: '500',
  },
  unavailableChip: {
    backgroundColor: '#FF98001A',
    height: 24,
  },
  unavailableChipText: {
    color: '#F57C00',
    fontSize: 12,
    fontWeight: '500',
  },
  pendingChip: {
    backgroundColor: '#2196F31A',
    height: 24,
  },
  pendingChipText: {
    color: '#1976D2',
    fontSize: 12,
    fontWeight: '500',
  },
  evaluateButton: {
    marginLeft: 8,
  },
});
