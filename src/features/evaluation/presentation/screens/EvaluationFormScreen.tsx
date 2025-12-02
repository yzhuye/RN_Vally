import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, IconButton, Surface, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../../auth/presentation/context/authContext';
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
  EvaluationForm: {
    course: Course;
    category: Category;
    activity: Activity;
    evaluatedEmail?: string;
    evaluatedId?: string;
    studentEmail: string;
  };
};

export default function EvaluationFormScreen() {
  const route = useRoute<RouteProp<RouteParams, 'EvaluationForm'>>();
  const navigation = useNavigation();
  const { course, category, activity, evaluatedEmail, evaluatedId, studentEmail } = route.params;
  const { user, getUserIdByEmail } = useAuth();
  
  // Evaluation context
  const { createEvaluation, isLoading: evaluationLoading } = useEvaluation();

  // Métricas de evaluación (0-5 estrellas)
  const [punctuality, setPunctuality] = useState(3);
  const [contributions, setContributions] = useState(3);
  const [commitment, setCommitment] = useState(3);
  const [attitude, setAttitude] = useState(3);
  
  const isLoading = evaluationLoading;

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

  const calculateAverage = (): number => {
    return (punctuality + contributions + commitment + attitude) / 4.0;
  };

  const handleSubmitEvaluation = async () => {
    try {
      // Get evaluator ID - use current user ID if available
      let evaluatorId: string | null = user?.id || null;
      if (!evaluatorId && user?.email) {
        evaluatorId = await getUserIdByEmail(user.email);
      }
      if (!evaluatorId) {
        evaluatorId = await getUserIdByEmail(studentEmail);
      }

      // Get evaluated ID - prefer provided ID, fallback to resolving from email
      let resolvedEvaluatedId: string | null = evaluatedId || null;
      if (!resolvedEvaluatedId && evaluatedEmail) {
        resolvedEvaluatedId = await getUserIdByEmail(evaluatedEmail);
      }

      if (!evaluatorId || !resolvedEvaluatedId) {
        console.error('Could not resolve user IDs for evaluation');
        return;
      }

      const success = await createEvaluation({
        activityId: activity.id,
        evaluatorId: evaluatorId,
        evaluatedId: resolvedEvaluatedId,
        punctuality,
        contributions,
        commitment,
        attitude
      });

      if (success) {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error submitting evaluation:', error);
    }
  };

  const renderStars = (
    currentValue: number,
    onPress: (value: number) => void
  ) => {
    return (
      <View style={styles.starsContainer}>
        <Text style={styles.starLabel}>0</Text>
        <View style={styles.starsRow}>
          {[0, 1, 2, 3, 4, 5].map((value) => (
            <TouchableOpacity
              key={value}
              onPress={() => onPress(value)}
              style={styles.starButton}
            >
              <Icon
                name={value <= currentValue ? 'star' : 'star-outline'}
                size={28}
                color={value <= currentValue ? '#FFB300' : '#CCCCCC'}
              />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.starLabel}>5</Text>
      </View>
    );
  };

  const renderMetricCard = (
    title: string,
    description: string,
    icon: string,
    currentValue: number,
    onChanged: (value: number) => void
  ) => {
    return (
      <View style={styles.metricCard}>
        <View style={styles.metricHeader}>
          <View style={styles.metricIconContainer}>
            <Icon name={icon} size={20} color={primaryColor} />
          </View>
          <View style={styles.metricInfo}>
            <Text style={styles.metricTitle}>{title}</Text>
            <Text style={styles.metricDescription}>{description}</Text>
          </View>
        </View>
        {renderStars(currentValue, onChanged)}
        <View style={styles.metricValueBadge}>
          <Text style={styles.metricValueText}>
            {currentValue} de 5 estrellas
          </Text>
        </View>
      </View>
    );
  };

  const average = calculateAverage();

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
              Evaluar Compañero
            </Text>
            <View style={{ width: 48 }} />
          </View>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            {course.title}
          </Text>
        </View>

        <View style={styles.content}>
          {/* Activity Info */}
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

          {/* Evaluated Person Info */}
          <View style={styles.evaluatedCard}>
            <View style={styles.evaluatedAvatar}>
              <Text style={styles.evaluatedAvatarText}>
                {(evaluatedEmail || 'U').substring(0, 1).toUpperCase()}
              </Text>
            </View>
            <View style={styles.evaluatedInfo}>
              <Text style={styles.evaluatedLabel}>Evaluando a:</Text>
              <Text style={styles.evaluatedEmail}>{evaluatedEmail || 'Usuario desconocido'}</Text>
            </View>
          </View>

          {/* Section Title */}
          <Text style={styles.sectionTitle}>Evaluación por Métricas</Text>
          <Text style={styles.sectionDescription}>
            Evalúa a tu compañero en cada una de las siguientes áreas usando una escala de 0 a 5 estrellas.
          </Text>

          {/* Metrics */}
          {renderMetricCard(
            '1. Puntualidad',
            'Cumplimiento de plazos y horarios establecidos',
            'clock-outline',
            punctuality,
            setPunctuality
          )}

          {renderMetricCard(
            '2. Contribuciones',
            'Calidad y cantidad de aportes al trabajo en equipo',
            'lightbulb-outline',
            contributions,
            setContributions
          )}

          {renderMetricCard(
            '3. Compromiso',
            'Dedicación y responsabilidad con las tareas asignadas',
            'clipboard-check-outline',
            commitment,
            setCommitment
          )}

          {renderMetricCard(
            '4. Actitud',
            'Disposición positiva y colaborativa en el equipo',
            'emoticon-happy-outline',
            attitude,
            setAttitude
          )}

          {/* Summary */}
          <View style={styles.summaryCard}>
            <Icon name="calculator" size={32} color={primaryColor} />
            <Text style={styles.summaryTitle}>Promedio de Evaluación</Text>
            <Text style={styles.summaryValue}>
              {average.toFixed(1)} / 5.0
            </Text>
            <View style={styles.summaryStars}>
              {[0, 1, 2, 3, 4].map((index) => (
                <Icon
                  key={index}
                  name={index < average ? 'star' : 'star-outline'}
                  size={20}
                  color="#FFB300"
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <Button
          mode="contained"
          onPress={handleSubmitEvaluation}
          style={styles.submitButton}
          buttonColor={primaryColor}
          textColor="#FFFFFF"
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Enviando...' : 'Enviar Evaluación'}
        </Button>
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
  headerSubtitle: {
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  content: {
    padding: 20,
  },
  activityCard: {
    backgroundColor: cardBackgroundColor,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  activityHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  activityIconContainer: {
    backgroundColor: `${primaryColor}1A`,
    borderRadius: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
    marginLeft: 16,
  },
  activityName: {
    fontSize: 20,
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
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  dueDateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  evaluatedCard: {
    backgroundColor: cardBackgroundColor,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  evaluatedAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${primaryColor}1A`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  evaluatedAvatarText: {
    color: primaryColor,
    fontWeight: 'bold',
    fontSize: 20,
  },
  evaluatedInfo: {
    marginLeft: 16,
    flex: 1,
  },
  evaluatedLabel: {
    fontSize: 12,
    color: secondaryTextColor,
    fontWeight: '500',
  },
  evaluatedEmail: {
    fontSize: 16,
    fontWeight: 'bold',
    color: primaryTextColor,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: primaryTextColor,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: secondaryTextColor,
    lineHeight: 20,
    marginBottom: 24,
  },
  metricCard: {
    backgroundColor: cardBackgroundColor,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  metricHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  metricIconContainer: {
    backgroundColor: `${primaryColor}1A`,
    borderRadius: 8,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricInfo: {
    flex: 1,
    marginLeft: 12,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: primaryTextColor,
    marginBottom: 4,
  },
  metricDescription: {
    fontSize: 13,
    color: secondaryTextColor,
    lineHeight: 18,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starLabel: {
    fontSize: 12,
    color: secondaryTextColor,
    fontWeight: '500',
  },
  starsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  starButton: {
    padding: 4,
  },
  metricValueBadge: {
    backgroundColor: '#FFB3001A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
  },
  metricValueText: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: `${primaryColor}0D`,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: `${primaryColor}33`,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: primaryColor,
    marginTop: 12,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: primaryColor,
    marginTop: 8,
  },
  summaryStars: {
    flexDirection: 'row',
    marginTop: 8,
  },
  actionContainer: {
    padding: 20,
    backgroundColor: cardBackgroundColor,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  submitButton: {
    paddingVertical: 8,
  },
});
