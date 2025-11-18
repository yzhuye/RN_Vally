import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "./features/auth/presentation/context/authContext";
import LoginScreen from "./features/auth/presentation/screens/LoginScreen";
import SignupScreen from "./features/auth/presentation/screens/SignupScreen";
import ProfessorCategoryScreen from "./features/category/presentation/screens/ProfessorCategoryScreen";
import CourseCategoryScreen from "./features/course/presentation/screens/CourseCategoryScreen";
import CourseManagementScreen from "./features/course/presentation/screens/CourseManagementScreen";
import HomeScreen from "./features/course/presentation/screens/HomeScreen";
import ProfessorGroupsScreen from "./features/groups/presentation/screens/ProfessorGroupsScreen";
import StudentManagementScreen from "./features/groups/presentation/screens/StudentManagementScreen";

const Stack = createStackNavigator();

export default function AuthFlow() {
  const { isLoggedIn } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="CourseManagement" component={CourseManagementScreen} />
          <Stack.Screen name="ProfessorCategory" component={ProfessorCategoryScreen} />
          <Stack.Screen name="CourseCategory" component={CourseCategoryScreen} />
          <Stack.Screen name="ProfessorGroups" component={ProfessorGroupsScreen} />
          <Stack.Screen name="StudentManagement" component={StudentManagementScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}