import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, IconButton, Text } from 'react-native-paper';
import { Course } from '../../../course/domain/entities/course';
import { CourseDetailHeader } from '../../../course/presentation/components/CourseDetailHeader';
import { useCategory } from '../context/category.context';

const primaryColor = '#00BCD4';
const backgroundColor = '#F5F7FA';
const secondaryTextColor = '#757575';

type RouteParams = {
  CourseCategory: {
    course: Course;
  };
};

export default function CourseCategoryScreen() {
  const route = useRoute<RouteProp<RouteParams, 'CourseCategory'>>();
  const navigation = useNavigation();
  const { categories, isLoading, loadCategories } = useCategory();
  
  const [course] = useState<Course>(route.params.course);

  useEffect(() => {
    loadCategories(course._id);
  }, [course._id]);

  const handleCategoryPress = (category: any) => {
    // Navigate to category activities
    (navigation as any).navigate('CategoryActivity', { course, category });
  };

  const getIconForMethod = (method: string): string => {
    switch (method) {
      case 'self-assigned':
        return 'account-plus';
      case 'manual':
        return 'clipboard-text';
      default:
        return 'folder';
    }
  };

  const getDescriptionForMethod = (method: string): string => {
    switch (method) {
      case 'self-assigned':
        return 'Auto-asignación de grupos';
      default:
        return 'Actividades y tareas';
    }
  };

  return (
    <View style={styles.container}>
      <CourseDetailHeader course={course} screenTitle="Categorías del Curso" />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categorías</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconButton icon="information-outline" size={48} iconColor={secondaryTextColor} />
            <Text style={styles.emptyTitle}>No hay categorías para este curso.</Text>
            <Text style={styles.emptySubtitle}>
              Contacta al profesor para agregar categorías.
            </Text>
          </View>
        ) : (
          categories.map((category) => (
            <Card key={category.id} style={styles.card} onPress={() => handleCategoryPress(category)}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.cardLeft}>
                  <IconButton
                    icon={getIconForMethod(category.groupingMethod)}
                    size={24}
                    iconColor={primaryColor}
                  />
                  <View style={styles.cardTextContainer}>
                    <Text style={styles.cardTitle}>{category.name}</Text>
                    <Text style={styles.cardSubtitle}>
                      {getDescriptionForMethod(category.groupingMethod)}
                    </Text>
                  </View>
                </View>
                <IconButton icon="chevron-right" size={20} />
              </Card.Content>
            </Card>
          ))
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
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
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
    fontSize: 16,
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
  card: {
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: secondaryTextColor,
  },
});

