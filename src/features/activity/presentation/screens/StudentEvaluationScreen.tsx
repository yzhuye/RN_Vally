import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, IconButton, Surface, Button, Chip } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';

const primaryColor = '#00A4BD';
const secondaryTextColor = '#757575';
const primaryTextColor = '#212121';
const backgroundColor = '#F5F7FA';
const cardBackgroundColor = '#FFFFFF';

type Evaluation = {
  id: string;
  activityId: string;
  evaluatedId: string;
  evaluatorId: string;
  punctuality: number;
  contributions: number;
  commitment: number;
  attitude: number;
  createdAt: Date;
};

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

type GroupMember = {
  email: string;
  hasEvaluated: boolean;
  canEvaluate: boolean;
  isChecking: boolean;
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

  const [isLoading, setIsLoading] = useState(false);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [myEvaluations, setMyEvaluations] = useState<Evaluation[]>([]);

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
    return myEvaluations.some(
      (evaluation) => evaluation.activityId === activity.id && evaluation.evaluatedId === memberEmail
    );
  };

  const navigateToEvaluationForm = (evaluatedEmail: string) => {
    (navigation as any).navigate('EvaluationForm', {
      course,
      category,
      activity,
      evaluatedEmail,
      studentEmail,
    });
  };

  const showEvaluationDetails = (memberEmail: string) => {
    const evaluation = myEvaluations.find(
      (evaluation) => evaluation.activityId === activity.id && evaluation.evaluatedId === memberEmail
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
            groupMembers.map((member) => {
              const memberHasEvaluated = hasEvaluated(member.email);

              return (
                <View key={member.email} style={styles.memberCard}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>
                      {member.email.substring(0, 1).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberEmail}>{member.email}</Text>
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
                      ) : member.isChecking ? (
                        <Chip
                          mode="flat"
                          style={styles.checkingChip}
                          textStyle={styles.checkingChipText}
                        >
                          Comprobando...
                        </Chip>
                      ) : !member.canEvaluate ? (
                        <Chip
                          mode="flat"
                          style={styles.unavailableChip}
                          textStyle={styles.unavailableChipText}
                        >
                          No disponible
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
                  {!memberHasEvaluated &&
                  !isExpired &&
                  !member.isChecking &&
                  member.canEvaluate ? (
                    <Button
                      mode="contained"
                      onPress={() => navigateToEvaluationForm(member.email)}
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
                      onPress={() => showEvaluationDetails(member.email)}
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
