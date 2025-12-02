import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Alert, TextInput as RNTextInput, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Card, Chip, Dialog, IconButton, Portal, Surface, Text, TextInput } from "react-native-paper";
import { useCourse } from "../context/course.context";

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const { 
    filteredCourses,
    isLoading,
    selectedUserType,
    selectUserType,
    updateSearchText,
    createCourse,
    joinCourseWithCode,
    loadUserCourses
  } = useCourse();

  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [joinDialogVisible, setJoinDialogVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [invitationCode, setInvitationCode] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    updateSearchText(query);
  };

  const handleTypeChange = (value: string) => {
    selectUserType(value === 'teacher' ? 'Profesor' : 'Estudiante');
  };

  const handleCreateCourse = async () => {
    if (!title || !description) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    await createCourse(title, description);
    setCreateDialogVisible(false);
    setTitle('');
    setDescription('');
  };

  const handleJoinCourse = async () => {
    if (!invitationCode) {
      Alert.alert('Error', 'Por favor ingresa el código de invitación');
      return;
    }
    await joinCourseWithCode(invitationCode);
    setJoinDialogVisible(false);
    setInvitationCode('');
  };

  const buttonText = selectedUserType === 'Profesor' ? "Crear Curso" : "Unirse a Curso";

  const handleCoursePress = (course: any) => {
    if (selectedUserType === 'Profesor') {
      // Navegar a gestión de curso para profesores
      (navigation as any).navigate('CourseManagement', { course });
    } else {
      // Navegar a categorías del curso para estudiantes
      (navigation as any).navigate('CourseCategory', { course });
    }
  };

  return (
    <Surface style={styles.container}>
      <Surface elevation={0} style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text variant="displayMedium" style={styles.text}>
            Hola,{'\n'}{user?.username || 'Usuario'}
          </Text>
        </View>
        <IconButton
          icon="logout"
          size={24}
          iconColor="#757575"
          onPress={logout}
        />
      </Surface>

      <View style={styles.toggleButtonRow}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            selectedUserType === 'Estudiante' ? styles.toggleButtonActive : styles.toggleButtonInactive
          ]}
          onPress={() => selectUserType('Estudiante')}
        >
          <Text style={[
            styles.toggleButtonText,
            selectedUserType === 'Estudiante' ? styles.toggleButtonTextActive : styles.toggleButtonTextInactive
          ]}>
            Estudiante
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.toggleButton,
            selectedUserType === 'Profesor' ? styles.toggleButtonActive : styles.toggleButtonInactive
          ]}
          onPress={() => selectUserType('Profesor')}
        >
          <Text style={[
            styles.toggleButtonText,
            selectedUserType === 'Profesor' ? styles.toggleButtonTextActive : styles.toggleButtonTextInactive
          ]}>
            Profesor
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <IconButton
          icon="magnify"
          size={24}
          iconColor="#757575"
          style={styles.searchIcon}
        />
        <RNTextInput
          style={styles.searchInput}
          placeholder="Buscar cursos..."
          placeholderTextColor="#9E9E9E"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <IconButton
          icon="refresh"
          size={24}
          iconColor="#FFFFFF"
          style={styles.refreshButton}
          onPress={loadUserCourses}
        />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={filteredCourses.length === 0 ? styles.emptyContainer : undefined}
      >
        {isLoading ? (
          <Surface style={styles.emptyState}>
            <Text>Cargando...</Text>
          </Surface>
        ) : filteredCourses.length === 0 ? (
          <Surface style={styles.emptyState}>
            <Text variant="titleLarge" style={styles.emptyText}>
              {selectedUserType === 'Estudiante'
                ? "No estás inscrito en ningún curso. Únete a un curso usando el código de invitación."
                : "No hay cursos creados. Crea tu primer curso."}
            </Text>
          </Surface>
        ) : (
          filteredCourses.map((course) => (
            <Card key={course._id} style={styles.card} onPress={() => handleCoursePress(course)}>
              {course.imageUrl && <Card.Cover source={{ uri: course.imageUrl }} />}
              <Card.Title title={course.title} titleStyle={styles.cardTitle}/>
              <Card.Content>
                <Text variant="bodyMedium">{course.description}</Text>
              </Card.Content>
              <Card.Actions style={styles.cardActions}>
                <Text variant="bodyMedium">
                  {course.enrolledStudents.length} estudiantes
                </Text>
                <Chip style={styles.chip} textStyle={styles.chipText}>{course.invitationCode}</Chip>
              </Card.Actions>
            </Card>
          ))
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.mainButton}
        onPress={() => selectedUserType === 'Profesor' ? setCreateDialogVisible(true) : setJoinDialogVisible(true)}
      >
        <View style={styles.mainButtonContent}>
          <IconButton
            icon={selectedUserType === 'Profesor' ? "plus" : "login"}
            size={20}
            iconColor="#00A4BD"
            style={styles.mainButtonIcon}
          />
          <Text style={styles.mainButtonText}>
            {buttonText}
          </Text>
        </View>
      </TouchableOpacity>

      <Portal>
        <Dialog visible={createDialogVisible} onDismiss={() => setCreateDialogVisible(false)}>
          <Dialog.Title>Crear nuevo curso</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Título"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />
            <TextInput
              label="Descripción"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCreateDialogVisible(false)}>Cancelar</Button>
            <Button onPress={handleCreateCourse}>Crear</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={joinDialogVisible} onDismiss={() => setJoinDialogVisible(false)}>
          <Dialog.Title>Unirse a un curso</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Código de invitación"
              value={invitationCode}
              onChangeText={setInvitationCode}
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setJoinDialogVisible(false)}>Cancelar</Button>
            <Button onPress={handleJoinCourse}>Unirse</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  text: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000",
  },
  toggleButtonRow: {
    width: "100%",
    flexDirection: "row",
    marginBottom: 10,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  toggleButtonActive: {
    backgroundColor: "#00A4BD",
  },
  toggleButtonInactive: {
    backgroundColor: "#E0E0E0",
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  toggleButtonTextActive: {
    color: "#FFFFFF",
  },
  toggleButtonTextInactive: {
    color: "#757575",
  },
  searchContainer: {
    width: "100%",
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
  },
  searchIcon: {
    margin: 0,
  },
  refreshButton: {
    backgroundColor: "#00A4BD",
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 0,
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  mainButton: {
    width: "100%",
    backgroundColor: "#E0F7FA", // Colors.cyan[50] equivalent
    borderRadius: 15,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  mainButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  mainButtonIcon: {
    margin: 0,
  },
  mainButtonText: {
    color: "#00A4BD",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: -8,
  },
  card: {
    width: "100%",
    marginVertical: 10,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 18,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    padding: 30,
    borderRadius: 10,
    backgroundColor: "transparent",
  },
  emptyText: {
    textAlign: "center",
    color: "#757575",
    fontSize: 16,
  },
  chip: {
    backgroundColor: "rgba(0, 164, 189, 0.91)", // Color.fromARGB(233, 0, 164, 189) equivalent
  },
  chipText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  input: {
    marginVertical: 8,
  },
});