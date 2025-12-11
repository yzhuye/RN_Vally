import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, IconButton, Surface, Text } from 'react-native-paper';
import { ActivityReport, GroupReport, StudentReport } from '../../domain/entities/reportTypes';
import { useReport } from '../context/report.context';

const primaryColor = '#00A4BD';
const secondaryTextColor = '#757575';
const primaryTextColor = '#212121';
const backgroundColor = '#F5F7FA';
const cardBackgroundColor = '#FFFFFF';

type Course = {
  id: string;
  title: string;
  description: string;
};

type RouteParams = {
  Report: {
    course: Course;
    categoryId: string;
    categoryName: string;
  };
};

export default function ReportScreen() {
  const route = useRoute<RouteProp<RouteParams, 'Report'>>();
  const navigation = useNavigation();
  const { course, categoryId, categoryName } = route.params;

  const { getActivityReports, getGroupReports, getStudentReports } = useReport();

  const [selectedTab, setSelectedTab] = useState<'general' | 'groups' | 'students'>('general');
  const [isLoading, setIsLoading] = useState(false);

  // Real data from context
  const [activityReports, setActivityReports] = useState<ActivityReport[]>([]);
  const [groupReports, setGroupReports] = useState<GroupReport[]>([]);
  const [studentReports, setStudentReports] = useState<StudentReport[]>([]);

  useEffect(() => {
    loadReports();
  }, [categoryId]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      // Load all report types
      const [activityResult, groupResult, studentResult] = await Promise.all([
        getActivityReports(categoryId),
        getGroupReports(categoryId),
        getStudentReports(categoryId),
      ]);

      if (activityResult.isSuccess && activityResult.data) {
        setActivityReports(activityResult.data);
      } else {
        console.warn('Failed to load activity reports:', activityResult.message);
      }

      if (groupResult.isSuccess && groupResult.data) {
        setGroupReports(groupResult.data);
      } else {
        console.warn('Failed to load group reports:', groupResult.message);
      }

      if (studentResult.isSuccess && studentResult.data) {
        setStudentReports(studentResult.data);
      } else {
        console.warn('Failed to load student reports:', studentResult.message);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 4.5) return '#4CAF50';
    if (score >= 3.5) return '#8BC34A';
    if (score >= 2.5) return '#FFC107';
    if (score >= 1.5) return '#FF9800';
    return '#F44336';
  };

  const renderActivityReports = () => {
    if (activityReports.length === 0) {
      return (
        <View style={styles.emptyState}>
          <IconButton icon="chart-bar" size={64} iconColor="#CCCCCC" />
          <Text style={styles.emptyStateText}>
            No hay datos de evaluaciones aún
          </Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.tabContent}>
        <Text style={styles.tabDescription}>
          Promedio de evaluaciones por actividad
        </Text>
        {activityReports.map((report) => (
          <View key={report.activityId} style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <View style={styles.reportIconContainer}>
                <IconButton icon="clipboard-text" size={24} iconColor={primaryColor} />
              </View>
              <View style={styles.reportInfo}>
                <Text style={styles.reportTitle}>{report.activityName}</Text>
                <Text style={styles.reportSubtitle}>
                  {report.evaluationCount} evaluaciones
                </Text>
              </View>
              <View style={styles.scoreContainer}>
                <Text
                  style={[
                    styles.scoreValue,
                    { color: getScoreColor(report.averageScore) },
                  ]}
                >
                  {report.averageScore.toFixed(1)}
                </Text>
                <Text style={styles.scoreLabel}>/ 5.0</Text>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${(report.averageScore / 5.0) * 100}%`,
                    backgroundColor: getScoreColor(report.averageScore),
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderGroupReports = () => {
    if (groupReports.length === 0) {
      return (
        <View style={styles.emptyState}>
          <IconButton icon="account-group" size={64} iconColor="#CCCCCC" />
          <Text style={styles.emptyStateText}>
            No hay datos de grupos aún
          </Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.tabContent}>
        <Text style={styles.tabDescription}>
          Promedio de evaluaciones por grupo
        </Text>
        {groupReports.map((report) => (
          <View key={report.groupId} style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <View style={styles.reportIconContainer}>
                <IconButton icon="account-group" size={24} iconColor={primaryColor} />
              </View>
              <View style={styles.reportInfo}>
                <Text style={styles.reportTitle}>{report.groupName}</Text>
                <Text style={styles.reportSubtitle}>
                  {report.memberCount} miembros
                </Text>
              </View>
              <View style={styles.scoreContainer}>
                <Text
                  style={[
                    styles.scoreValue,
                    { color: getScoreColor(report.averageScore) },
                  ]}
                >
                  {report.averageScore.toFixed(1)}
                </Text>
                <Text style={styles.scoreLabel}>/ 5.0</Text>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${(report.averageScore / 5.0) * 100}%`,
                    backgroundColor: getScoreColor(report.averageScore),
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderStudentReports = () => {
    if (studentReports.length === 0) {
      return (
        <View style={styles.emptyState}>
          <IconButton icon="account" size={64} iconColor="#CCCCCC" />
          <Text style={styles.emptyStateText}>
            No hay datos de estudiantes aún
          </Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.tabContent}>
        <Text style={styles.tabDescription}>
          Promedio de evaluaciones por estudiante
        </Text>
        {studentReports.map((report, index) => (
          <View key={index} style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <View style={styles.studentAvatar}>
                <Text style={styles.studentAvatarText}>
                  {report.studentEmail.substring(0, 1).toUpperCase()}
                </Text>
              </View>
              <View style={styles.reportInfo}>
                <Text style={styles.reportTitle}>{report.studentEmail}</Text>
                <Text style={styles.reportSubtitle}>
                  {report.evaluationCount} evaluaciones recibidas
                </Text>
              </View>
              <View style={styles.scoreContainer}>
                <Text
                  style={[
                    styles.scoreValue,
                    { color: getScoreColor(report.averageScore) },
                  ]}
                >
                  {report.averageScore.toFixed(1)}
                </Text>
                <Text style={styles.scoreLabel}>/ 5.0</Text>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${(report.averageScore / 5.0) * 100}%`,
                    backgroundColor: getScoreColor(report.averageScore),
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  const handleRefresh = () => {
    loadReports();
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
            Reportes
          </Text>
          <View style={{ width: 48 }} />
        </View>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          {categoryName}
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          {course.title}
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabs}>
          <Button
            mode={selectedTab === 'general' ? 'contained' : 'outlined'}
            onPress={() => setSelectedTab('general')}
            style={[styles.tab, selectedTab === 'general' && styles.tabActive]}
            buttonColor={selectedTab === 'general' ? primaryColor : 'transparent'}
            textColor={selectedTab === 'general' ? '#FFFFFF' : secondaryTextColor}
            icon="chart-line"
            compact
          >
            General
          </Button>
          <Button
            mode={selectedTab === 'groups' ? 'contained' : 'outlined'}
            onPress={() => setSelectedTab('groups')}
            style={[styles.tab, selectedTab === 'groups' && styles.tabActive]}
            buttonColor={selectedTab === 'groups' ? primaryColor : 'transparent'}
            textColor={selectedTab === 'groups' ? '#FFFFFF' : secondaryTextColor}
            icon="account-group"
            compact
          >
            Grupos
          </Button>
          <Button
            mode={selectedTab === 'students' ? 'contained' : 'outlined'}
            onPress={() => setSelectedTab('students')}
            style={[styles.tab, selectedTab === 'students' && styles.tabActive]}
            buttonColor={selectedTab === 'students' ? primaryColor : 'transparent'}
            textColor={selectedTab === 'students' ? '#FFFFFF' : secondaryTextColor}
            icon="account"
            compact
          >
            Estudiantes
          </Button>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.emptyState}>
            <Text>Cargando...</Text>
          </View>
        ) : (
          <>
            {selectedTab === 'general' && renderActivityReports()}
            {selectedTab === 'groups' && renderGroupReports()}
            {selectedTab === 'students' && renderStudentReports()}
          </>
        )}
      </View>

      {/* FAB */}
      <Button
        mode="contained"
        onPress={handleRefresh}
        icon="refresh"
        style={styles.fab}
        buttonColor={primaryColor}
        textColor="#FFFFFF"
      >
        Actualizar
      </Button>
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
  tabsContainer: {
    backgroundColor: cardBackgroundColor,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    borderColor: '#E0E0E0',
  },
  tabActive: {
    borderColor: primaryColor,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  tabDescription: {
    fontSize: 14,
    color: secondaryTextColor,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: secondaryTextColor,
    marginTop: 16,
    textAlign: 'center',
  },
  reportCard: {
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
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportIconContainer: {
    backgroundColor: `${primaryColor}1A`,
    borderRadius: 8,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: primaryTextColor,
    marginBottom: 2,
  },
  reportSubtitle: {
    fontSize: 14,
    color: secondaryTextColor,
  },
  scoreContainer: {
    alignItems: 'center',
    marginLeft: 8,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 12,
    color: secondaryTextColor,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${primaryColor}1A`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentAvatarText: {
    color: primaryColor,
    fontWeight: 'bold',
    fontSize: 18,
  },
  fab: {
    margin: 16,
    paddingVertical: 8,
  },
});
