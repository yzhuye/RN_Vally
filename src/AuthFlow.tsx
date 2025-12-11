import { createStackNavigator } from "@react-navigation/stack";
import ActivityManagementScreen from "./features/activity/presentation/screens/ActivityManagementScreen";
import CategoryActivityScreen from "./features/activity/presentation/screens/CategoryActivityScreen";
// import ProfessorEvaluationScreen from "./features/evaluation/presentation/screens/ProfessorEvaluationScreen";
import { useAuth } from "./features/auth/presentation/context/authContext";
import LoginScreen from "./features/auth/presentation/screens/LoginScreen";
import SignupScreen from "./features/auth/presentation/screens/SignupScreen";
import CourseCategoryScreen from "./features/category/presentation/screens/CourseCategoryScreen";
import ProfessorCategoryScreen from "./features/category/presentation/screens/ProfessorCategoryScreen";
import CourseManagementScreen from "./features/course/presentation/screens/CourseManagementScreen";
import HomeScreen from "./features/course/presentation/screens/HomeScreen";
import EvaluationFormScreen from "./features/evaluation/presentation/screens/EvaluationFormScreen";
import StudentEvaluationScreen from "./features/evaluation/presentation/screens/StudentEvaluationScreen";
import ProfessorGroupsScreen from "./features/group/presentation/screens/ProfessorGroupsScreen";
import StudentManagementScreen from "./features/group/presentation/screens/StudentManagementScreen";
import ReportScreen from "./features/report/presentation/screens/ReportScreen";

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
          <Stack.Screen name="ActivityManagement" component={ActivityManagementScreen} />
          <Stack.Screen name="CategoryActivity" component={CategoryActivityScreen} />
          <Stack.Screen name="StudentEvaluation" component={StudentEvaluationScreen} />
          <Stack.Screen name="EvaluationForm" component={EvaluationFormScreen} />
          <Stack.Screen name="Report" component={ReportScreen} />
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