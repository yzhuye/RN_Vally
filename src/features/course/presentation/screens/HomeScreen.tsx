import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { Button, Card, Chip, Dialog, IconButton, Portal, Searchbar, SegmentedButtons, Surface, Text, TextInput } from "react-native-paper";
import { useCourse } from "../context/course.context";

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { 
    filteredCourses,
    isLoading,
    selectedUserType,
    selectUserType,
    updateSearchText,
    createCourse,
    joinCourseWithCode 
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

  return (
    <Surface style={styles.container}>
      <Surface elevation={0} style={styles.header}>
        <Surface elevation={0} style={styles.headerTextContainer}>
          <Text variant="displayMedium" style={styles.text}>
            Hola,
          </Text>
          <Text variant="displayMedium" style={styles.text}>
            {user?.username || 'Usuario'}
          </Text>
        </Surface>
        <IconButton
          icon="logout"
          size={24}
          onPress={logout}
        />
      </Surface>

      <SegmentedButtons
        value={selectedUserType === 'Profesor' ? 'teacher' : 'student'}
        onValueChange={handleTypeChange}
        buttons={[
          { value: "student", label: "Estudiante" },
          { value: "teacher", label: "Profesor" },
        ]}
        style={styles.toggleButtonRow}
      />
      
      <Searchbar
        placeholder="Buscar"
        value={searchQuery}
        onChangeText={handleSearch}
      />

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
            <Card key={course._id} style={styles.card}>
              {course.imageUrl && <Card.Cover source={{ uri: course.imageUrl }} />}
              <Card.Title title={course.title} titleStyle={styles.cardTitle}/>
              <Card.Content>
                <Text variant="bodyMedium">{course.description}</Text>
              </Card.Content>
              <Card.Actions style={styles.cardActions}>
                <Text variant="bodyMedium">
                  {course.enrolledStudents.length} estudiantes
                </Text>
                <Chip>{course.invitationCode}</Chip>
              </Card.Actions>
            </Card>
          ))
        )}
      </ScrollView>

      <Button 
        mode="contained" 
        onPress={() => selectedUserType === 'Profesor' ? setCreateDialogVisible(true) : setJoinDialogVisible(true)} 
        style={styles.mainButton}
      >
        {buttonText}
      </Button>

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
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 20,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerTextContainer: {
    flex: 1,
  },
  text: {
    fontWeight: "bold",
  },
  toggleButtonRow: {
    width: "100%",
  },
  scrollView: {
    flex: 1,
    width: "100%",
    gap: 10,
  },
  mainButton: {
    width: "100%",
  },
  card: {
    width: "100%",
    marginVertical: 10, 
    gap: 10,
  },
  cardTitle: {
    fontWeight: "bold",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    opacity: 0.7,
  },
  input: {
    marginVertical: 8,
  },
});