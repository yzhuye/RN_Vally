import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Card, Chip, Searchbar, SegmentedButtons, Surface, Text } from "react-native-paper";

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("student");
  let buttonText = "Unirse a Curso";
  if (selectedTab === "teacher") {
    buttonText = "Crear Curso";
  }
  const initialCourses = [
    {
      id: '1',
      title: 'Curso 1: UI Móvil',
      description: 'Aprende desarrollo de interfaces móviles',
      enrolledStudents: ['Estudiante Actual'],
      invitationCode: 'UIMVL1',
      imageUrl: 'https://i.imgur.com/OVViHeC.jpeg'
    },
    {
      id: '2',
      title: 'Curso 2: UI Móvil',
      description: 'Desarrollo avanzado de UI',
      enrolledStudents: ['Estudiante Actual', 'Juan Pérez'],
      invitationCode: 'UIMVL2',
      imageUrl: 'https://picsum.photos/700'
    },
    {
      id: '3',
      title: 'Curso 3: UI Móvil',
      description: 'Patrones de diseño móvil',
      enrolledStudents: ['Estudiante Actual'],
      invitationCode: 'UIMVL3',
      imageUrl: 'https://picsum.photos/700'
    },
    {
      id: '4',
      title: 'Curso 4: UI Móvil',
      description: 'Animaciones y transiciones',
      enrolledStudents: ['Estudiante Actual', 'María García', 'Carlos López'],
      invitationCode: 'UIMVL4',
      imageUrl: 'https://picsum.photos/700'
    },
    {
      id: '5',
      title: 'Curso 5: UI Móvil',
      description: 'Responsive design',
      enrolledStudents: ['Estudiante Actual'],
      invitationCode: 'UIMVL5',
      imageUrl: 'https://picsum.photos/700'
    },
    {
      id: '6',
      title: 'Curso A: Backend',
      description: 'Desarrollo de APIs y servicios backend',
      enrolledStudents: ['Ana Martín', 'Pedro Sánchez'],
      invitationCode: 'BCKND1',
      imageUrl: 'https://picsum.photos/700'
    },
    {
      id: '7',
      title: 'Curso B: Backend',
      description: 'Bases de datos y arquitectura',
      enrolledStudents: ['Luis Fernández'],
      invitationCode: 'BCKND2',
      imageUrl: 'https://picsum.photos/700'
    },
    {
      id: '8',
      title: 'Curso C: Backend',
      description: 'Microservicios y DevOps',
      enrolledStudents: ['Elena Ruiz', 'Miguel Torres', 'Sofia Mendez'],
      invitationCode: 'BCKND3',
      imageUrl: 'https://picsum.photos/700'
    },
    {
      id: '9',
      title: 'Curso D: Backend',
      description: 'Seguridad y autenticación',
      enrolledStudents: [],
      invitationCode: 'BCKND4',
      imageUrl: 'https://picsum.photos/700'
    },
    {
      id: '10',
      title: 'Curso E: Backend',
      description: 'Optimización y performance',
      enrolledStudents: ['Roberto Kim'],
      invitationCode: 'BCKND5',
      imageUrl: 'https://picsum.photos/700'
    }
  ];
  
  return (
    <Surface style={styles.container}>
      <Surface elevation={0}>
        <Text variant="displayMedium" style={styles.text}>
          Hola,
        </Text>
        <Text variant="displayMedium" style={styles.text}>
          Daniel A.
        </Text>
      </Surface>
      <SegmentedButtons
        value={selectedTab}
        onValueChange={(value) => setSelectedTab(value)}
        buttons={[
          { value: "student", label: "Estudiante" },
          { value: "teacher", label: "Profesor" },
        ]}
        style={styles.toggleButtonRow}
      />
      <Searchbar
        placeholder="Buscar"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={initialCourses.length === 0 ? styles.emptyContainer : undefined}>
         {initialCourses.length === 0 ? (
          <Surface style={styles.emptyState}>
            <Text variant="titleLarge" style={styles.emptyText}>
              {selectedTab === "student" 
                ? "No estás inscrito en ningún curso. Únete a un curso usando el código de invitación."
                : "No hay cursos creados. Crea tu primer curso."}
            </Text>
          </Surface>
         ) : (
          initialCourses.map((course) => (
             <Card key={course.id} style={styles.card}>
                <Card.Cover source={{ uri: course.imageUrl }} />
                <Card.Title title={course.title} titleStyle={styles.cardTitle}/>
                <Card.Content>
                    <Text variant="bodyMedium">{course.description}</Text>
                </Card.Content>
                <Card.Actions style={styles.cardActions}>
                    <Text variant="bodyMedium">{course.enrolledStudents.length} estudiantes</Text>
                    <Chip>{course.invitationCode}</Chip>
                </Card.Actions>
            </Card>
          ))
         )}
      </ScrollView>
      <Button mode="contained" onPress={() => {}} style={styles.mainButton}>
        {buttonText}
      </Button>
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
});
