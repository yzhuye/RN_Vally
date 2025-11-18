import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, FAB, Card, IconButton, ActivityIndicator } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Course } from '../../domain/entities/course';
import { Category } from '../../domain/entities/category';
import { CourseDetailHeader } from '../components/CourseDetailHeader';
import { AddCategoryDialog, EditCategoryDialog } from '../components/CategoryDialogs';
import { useCategory } from '../context/category.context';

const primaryColor = '#00BCD4';
const backgroundColor = '#F5F7FA';

type RouteParams = {
  ProfessorCategory: {
    course: Course;
  };
};

export default function ProfessorCategoryScreen() {
  const route = useRoute<RouteProp<RouteParams, 'ProfessorCategory'>>();
  const navigation = useNavigation();
  const { categories, isLoading, loadCategories, addCategory, updateCategory, deleteCategory, getMethodDisplayName, getMethodIcon } = useCategory();
  
  const [course] = useState<Course>(route.params.course);
  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [optionsVisible, setOptionsVisible] = useState<string | null>(null);

  useEffect(() => {
    loadCategories(course._id);
  }, [course._id]);

  const handleAddCategory = async (name: string, groupingMethod: string, groupCount: number, studentsPerGroup: number) => {
    await addCategory(course._id, name, groupingMethod, groupCount, studentsPerGroup);
  };

  const handleEditCategory = async (category: Category) => {
    await updateCategory(course._id, category);
  };

  const handleDeleteCategory = (category: Category) => {
    Alert.alert(
      'Confirmar',
      `¿Estás seguro de que deseas eliminar la categoría "${category.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteCategory(course._id, category.id);
          },
        },
      ]
    );
  };

  const showCategoryOptions = (category: Category) => {
    Alert.alert(
      category.name,
      'Selecciona una opción',
      [
        {
          text: 'Ver Actividades',
          onPress: () => {
            // TODO: Navegar a actividades
            Alert.alert('Información', 'Funcionalidad en desarrollo');
          },
        },
        {
          text: 'Ver Grupos',
          onPress: () => {
            navigation.navigate('ProfessorGroups' as never, { course, category } as never);
          },
        },
        {
          text: 'Ver Reportes',
          onPress: () => {
            // TODO: Navegar a reportes
            Alert.alert('Información', 'Funcionalidad en desarrollo');
          },
        },
        {
          text: 'Editar Categoría',
          onPress: () => {
            setSelectedCategory(category);
            setEditDialogVisible(true);
          },
        },
        {
          text: 'Eliminar Categoría',
          style: 'destructive',
          onPress: () => handleDeleteCategory(category),
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
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
            <Text style={styles.emptyText}>Aún no hay categorías. ¡Agrega una!</Text>
          </View>
        ) : (
          categories.map((category) => (
            <Card key={category.id} style={styles.card} onPress={() => showCategoryOptions(category)}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.cardLeft}>
                  <IconButton
                    icon={getMethodIcon(category.groupingMethod)}
                    size={24}
                    iconColor={primaryColor}
                  />
                  <View style={styles.cardTextContainer}>
                    <Text style={styles.cardTitle}>{category.name}</Text>
                    <Text style={styles.cardSubtitle}>
                      Método: {getMethodDisplayName(category.groupingMethod)}
                    </Text>
                  </View>
                </View>
                <IconButton icon="chevron-right" size={20} />
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setAddDialogVisible(true)}
        label="Nueva Categoría"
        color="#FFFFFF"
      />

      <AddCategoryDialog
        visible={addDialogVisible}
        onDismiss={() => setAddDialogVisible(false)}
        onAdd={handleAddCategory}
      />

      <EditCategoryDialog
        visible={editDialogVisible}
        category={selectedCategory}
        onDismiss={() => {
          setEditDialogVisible(false);
          setSelectedCategory(null);
        }}
        onEdit={handleEditCategory}
      />
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
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00000088',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
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
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
  },
  card: {
    marginVertical: 6,
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
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#757575',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: primaryColor,
  },
});

