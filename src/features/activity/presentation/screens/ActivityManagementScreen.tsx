import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Dialog, IconButton, Menu, Portal, Surface, Text, TextInput } from 'react-native-paper';

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
  ActivityManagement: {
    course: Course;
    category: Category;
  };
};

export default function ActivityManagementScreen() {
  const route = useRoute<RouteProp<RouteParams, 'ActivityManagement'>>();
  const navigation = useNavigation();
  const { course, category } = route.params;

  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [menuVisible, setMenuVisible] = useState<{ [key: string]: boolean }>({});

  // Form state
  const [activityName, setActivityName] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [activityDueDate, setActivityDueDate] = useState(new Date());

  const getDueDateColor = (dueDate: Date): string => {
    const now = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return '#D32F2F'; // Red - expired
    if (diffDays <= 2) return '#F57C00'; // Orange - urgent
    if (diffDays <= 7) return '#FBC02D'; // Yellow - soon
    return '#388E3C'; // Green - plenty of time
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

  const handleCreateActivity = () => {
    if (!activityName || !activityDescription) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const newActivity: Activity = {
      id: Date.now().toString(),
      name: activityName,
      description: activityDescription,
      dueDate: activityDueDate,
    };

    setActivities([...activities, newActivity]);
    setCreateDialogVisible(false);
    setActivityName('');
    setActivityDescription('');
    setActivityDueDate(new Date());
    Alert.alert('Éxito', 'Actividad creada exitosamente');
  };

  const handleEditActivity = () => {
    if (!selectedActivity || !activityName || !activityDescription) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const updatedActivities = activities.map(act =>
      act.id === selectedActivity.id
        ? { ...act, name: activityName, description: activityDescription, dueDate: activityDueDate }
        : act
    );

    setActivities(updatedActivities);
    setEditDialogVisible(false);
    setSelectedActivity(null);
    setActivityName('');
    setActivityDescription('');
    setActivityDueDate(new Date());
    Alert.alert('Éxito', 'Actividad actualizada exitosamente');
  };

  const handleDeleteActivity = (activity: Activity) => {
    Alert.alert(
      'Eliminar Actividad',
      `¿Estás seguro de que deseas eliminar "${activity.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setActivities(activities.filter(act => act.id !== activity.id));
            Alert.alert('Éxito', 'Actividad eliminada');
          },
        },
      ]
    );
  };

  const openEditDialog = (activity: Activity) => {
    setSelectedActivity(activity);
    setActivityName(activity.name);
    setActivityDescription(activity.description);
    setActivityDueDate(activity.dueDate);
    setEditDialogVisible(true);
  };

  const showActivityDetails = (activity: Activity) => {
    Alert.alert(
      activity.name,
      `Descripción: ${activity.description}\n\nFecha límite: ${activity.dueDate.toLocaleDateString()} - ${formatDueDate(activity.dueDate)}`,
      [{ text: 'Cerrar' }]
    );
  };

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
              Actividades
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

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <IconButton icon="clipboard-text" size={24} iconColor={primaryColor} />
          <Text style={styles.sectionTitle}>Actividades de Evaluación</Text>
        </View>

        {/* Activities List */}
        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.emptyState}>
              <Text>Cargando...</Text>
            </View>
          ) : activities.length === 0 ? (
            <View style={styles.emptyState}>
              <IconButton icon="clipboard-text-outline" size={64} iconColor="#CCCCCC" />
              <Text style={styles.emptyStateTitle}>Aún no hay actividades</Text>
              <Text style={styles.emptyStateText}>
                Crea la primera actividad de evaluación
              </Text>
            </View>
          ) : (
            activities.map((activity) => (
              <View key={activity.id} style={styles.activityCard}>
                <TouchableOpacity
                  style={styles.activityContent}
                  onPress={() => showActivityDetails(activity)}
                >
                  <View style={styles.activityIcon}>
                    <IconButton
                      icon="clipboard-text"
                      size={24}
                      iconColor={primaryColor}
                    />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>{activity.name}</Text>
                    <Text style={styles.activityDescription} numberOfLines={2}>
                      {activity.description}
                    </Text>
                    <View style={[styles.dueDateBadge, { backgroundColor: `${getDueDateColor(activity.dueDate)}1A`, borderColor: getDueDateColor(activity.dueDate) }]}>
                      <Text style={[styles.dueDateText, { color: getDueDateColor(activity.dueDate) }]}>
                        {formatDueDate(activity.dueDate)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <Menu
                  visible={menuVisible[activity.id] || false}
                  onDismiss={() => setMenuVisible({ ...menuVisible, [activity.id]: false })}
                  anchor={
                    <IconButton
                      icon="dots-vertical"
                      size={24}
                      onPress={() => setMenuVisible({ ...menuVisible, [activity.id]: true })}
                    />
                  }
                >
                  <Menu.Item
                    onPress={() => {
                      setMenuVisible({ ...menuVisible, [activity.id]: false });
                      openEditDialog(activity);
                    }}
                    title="Editar"
                    leadingIcon="pencil"
                  />
                  <Menu.Item
                    onPress={() => {
                      setMenuVisible({ ...menuVisible, [activity.id]: false });
                      handleDeleteActivity(activity);
                    }}
                    title="Eliminar"
                    leadingIcon="delete"
                  />
                </Menu>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <Button
        mode="contained"
        onPress={() => setCreateDialogVisible(true)}
        icon="plus"
        style={styles.fab}
        buttonColor={primaryColor}
        textColor="#FFFFFF"
      >
        Nueva Actividad
      </Button>

      {/* Create Dialog */}
      <Portal>
        <Dialog visible={createDialogVisible} onDismiss={() => setCreateDialogVisible(false)}>
          <Dialog.Title>Crear Nueva Actividad</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nombre de la actividad"
              value={activityName}
              onChangeText={setActivityName}
              style={styles.input}
              mode="outlined"
              outlineColor={primaryColor}
              activeOutlineColor={primaryColor}
            />
            <TextInput
              label="Descripción"
              value={activityDescription}
              onChangeText={setActivityDescription}
              multiline
              numberOfLines={3}
              style={styles.input}
              mode="outlined"
              outlineColor={primaryColor}
              activeOutlineColor={primaryColor}
            />
            <Text style={styles.inputLabel}>Fecha límite: {activityDueDate.toLocaleDateString()}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCreateDialogVisible(false)} textColor={secondaryTextColor}>
              Cancelar
            </Button>
            <Button onPress={handleCreateActivity} textColor={primaryColor}>
              Crear
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog visible={editDialogVisible} onDismiss={() => setEditDialogVisible(false)}>
          <Dialog.Title>Editar Actividad</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nombre de la actividad"
              value={activityName}
              onChangeText={setActivityName}
              style={styles.input}
              mode="outlined"
              outlineColor={primaryColor}
              activeOutlineColor={primaryColor}
            />
            <TextInput
              label="Descripción"
              value={activityDescription}
              onChangeText={setActivityDescription}
              multiline
              numberOfLines={3}
              style={styles.input}
              mode="outlined"
              outlineColor={primaryColor}
              activeOutlineColor={primaryColor}
            />
            <Text style={styles.inputLabel}>Fecha límite: {activityDueDate.toLocaleDateString()}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)} textColor={secondaryTextColor}>
              Cancelar
            </Button>
            <Button onPress={handleEditActivity} textColor={primaryColor}>
              Guardar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: secondaryTextColor,
  },
  content: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: secondaryTextColor,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: secondaryTextColor,
    marginTop: 8,
  },
  activityCard: {
    backgroundColor: cardBackgroundColor,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
  },
  activityIcon: {
    backgroundColor: `${primaryColor}1A`,
    borderRadius: 8,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
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
  dueDateBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  dueDateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  fab: {
    margin: 16,
    paddingVertical: 8,
  },
  input: {
    marginVertical: 8,
  },
  inputLabel: {
    marginTop: 12,
    fontSize: 14,
    color: secondaryTextColor,
  },
});
