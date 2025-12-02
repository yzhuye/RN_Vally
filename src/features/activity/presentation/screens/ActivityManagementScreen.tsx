import DateTimePicker from '@react-native-community/datetimepicker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Dialog, IconButton, Menu, Portal, Surface, Text, TextInput } from 'react-native-paper';
import { Activity } from '../../domain/entities/activity';
import { useActivity } from '../context/activity.context';

const primaryColor = '#00A4BD';
const secondaryTextColor = '#757575';
const primaryTextColor = '#212121';
const backgroundColor = '#F5F7FA';
const cardBackgroundColor = '#FFFFFF';

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
  const { 
    activities, 
    isLoading, 
    loadActivities, 
    createActivity, 
    updateActivity, 
    deleteActivity, 
    formatDueDate, 
    getDueDateColor 
  } = useActivity();

  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [menuVisible, setMenuVisible] = useState<{ [key: string]: boolean }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'create' | 'edit'>('create');

  // Form state
  const [activityName, setActivityName] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [activityDueDate, setActivityDueDate] = useState(new Date());

  useEffect(() => {
    loadActivities(category.id);
  }, [category.id]);

  const getColorHex = (colorName: string): string => {
    switch (colorName) {
      case 'red': return '#D32F2F';
      case 'orange': return '#F57C00';
      case 'yellow': return '#FBC02D';
      case 'green': return '#388E3C';
      default: return '#757575';
    }
  };

  const handleCreateActivity = async () => {
    if (!activityName || !activityDescription) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const success = await createActivity({
      name: activityName,
      description: activityDescription,
      dueDate: activityDueDate,
      categoryId: category.id,
    });

    if (success) {
      setCreateDialogVisible(false);
      setActivityName('');
      setActivityDescription('');
      setActivityDueDate(new Date());
    }
  };

  const handleEditActivity = async () => {
    if (!selectedActivity || !activityName || !activityDescription) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const success = await updateActivity({
      activityId: selectedActivity.id,
      name: activityName,
      description: activityDescription,
      dueDate: activityDueDate,
    });

    if (success) {
      // Reload activities to get updated data
      await loadActivities(category.id);
      setEditDialogVisible(false);
      setSelectedActivity(null);
      setActivityName('');
      setActivityDescription('');
      setActivityDueDate(new Date());
    }
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
          onPress: async () => {
            const success = await deleteActivity(activity.id);
            if (success) {
              // Reload activities after deletion
              await loadActivities(category.id);
            }
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

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      setShowTimePicker(false);
      return;
    }

    if (selectedDate) {
      if (showDatePicker && !showTimePicker) {
        // Date picker - guardamos la fecha
        const currentDate = activityDueDate || new Date();
        const newDate = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          currentDate.getHours(),
          currentDate.getMinutes()
        );
        setActivityDueDate(newDate);
        
        if (Platform.OS === 'android') {
          // En Android cerramos date y abrimos time picker
          setShowDatePicker(false);
          setTimeout(() => setShowTimePicker(true), 100);
        } else {
          // En iOS pasamos directamente al time picker
          setShowDatePicker(false);
          setShowTimePicker(true);
        }
      } else if (showTimePicker) {
        // Time picker - actualizamos la hora
        const currentDate = activityDueDate || new Date();
        const newDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
          selectedDate.getHours(),
          selectedDate.getMinutes()
        );
        setActivityDueDate(newDate);
        
        if (Platform.OS === 'android') {
          setShowTimePicker(false);
        }
      }
    }
  };

  const confirmIOSDateTime = () => {
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  const openDatePickerForCreate = () => {
    setDatePickerMode('create');
    setShowDatePicker(true);
  };

  const openDatePickerForEdit = () => {
    setDatePickerMode('edit');
    setShowDatePicker(true);
  };

  const formatDateTime = (date: Date) => {
    return `${date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })} ${date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
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
                    <View style={[styles.dueDateBadge, { backgroundColor: `${getColorHex(getDueDateColor(activity.dueDate))}1A`, borderColor: getColorHex(getDueDateColor(activity.dueDate)) }]}>
                      <Text style={[styles.dueDateText, { color: getColorHex(getDueDateColor(activity.dueDate)) }]}>
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
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={openDatePickerForCreate}
            >
              <View style={styles.datePickerContent}>
                <IconButton icon="calendar" size={24} iconColor={primaryColor} style={styles.dateIcon} />
                <View style={styles.dateTextContainer}>
                  <Text style={styles.dateLabel}>Fecha límite</Text>
                  <Text style={styles.dateValue}>{formatDateTime(activityDueDate)}</Text>
                </View>
              </View>
            </TouchableOpacity>
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
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={openDatePickerForEdit}
            >
              <View style={styles.datePickerContent}>
                <IconButton icon="calendar" size={24} iconColor={primaryColor} style={styles.dateIcon} />
                <View style={styles.dateTextContainer}>
                  <Text style={styles.dateLabel}>Fecha límite</Text>
                  <Text style={styles.dateValue}>{formatDateTime(activityDueDate)}</Text>
                </View>
              </View>
            </TouchableOpacity>
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

      {/* Date Time Picker */}
      {Platform.OS === 'ios' ? (
        <>
          <Portal>
            <Dialog visible={showDatePicker} onDismiss={() => setShowDatePicker(false)}>
              <Dialog.Title>Seleccionar Fecha</Dialog.Title>
              <Dialog.Content>
                <DateTimePicker
                  value={activityDueDate}
                  mode="date"
                  display="spinner"
                  onChange={onDateChange}
                  minimumDate={new Date()}
                  style={styles.iosDatePicker}
                  textColor="#000000"
                  themeVariant="light"
                />
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => setShowDatePicker(false)} textColor={secondaryTextColor}>
                  Cancelar
                </Button>
                <Button onPress={() => {
                  setShowDatePicker(false);
                  setShowTimePicker(true);
                }} textColor={primaryColor}>
                  Continuar
                </Button>
              </Dialog.Actions>
            </Dialog>

            <Dialog visible={showTimePicker} onDismiss={() => setShowTimePicker(false)}>
              <Dialog.Title>Seleccionar Hora</Dialog.Title>
              <Dialog.Content>
                <DateTimePicker
                  value={activityDueDate}
                  mode="time"
                  display="spinner"
                  onChange={onDateChange}
                  style={styles.iosDatePicker}
                  textColor="#000000"
                  themeVariant="light"
                />
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => setShowTimePicker(false)} textColor={secondaryTextColor}>
                  Cancelar
                </Button>
                <Button onPress={confirmIOSDateTime} textColor={primaryColor}>
                  Confirmar
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </>
      ) : (
        <>
          {showDatePicker && (
            <DateTimePicker
              value={activityDueDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={activityDueDate}
              mode="time"
              display="default"
              onChange={onDateChange}
            />
          )}
        </>
      )}
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
  datePickerButton: {
    marginTop: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  datePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  dateIcon: {
    margin: 0,
  },
  dateTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  dateLabel: {
    fontSize: 12,
    color: secondaryTextColor,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    color: primaryTextColor,
    fontWeight: '500',
  },
  iosDatePicker: {
    width: '100%',
    height: 200,
  },
  iosPickerText: {
    color: '#000000',
  },
});
