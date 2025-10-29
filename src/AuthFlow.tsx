import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "./features/auth/presentation/context/authContext";
import LoginScreen from "./features/auth/presentation/screens/LoginScreen";
import SignupScreen from "./features/auth/presentation/screens/SignupScreen";
import { CourseProvider } from "./features/course/presentation/context/course.context";
import HomeScreen from "./features/course/presentation/screens/HomeScreen";

const Stack = createStackNavigator();

function ProtectedHomeScreen() {
  return (
    <CourseProvider>
      <HomeScreen />
    </CourseProvider>
  );
}

export default function AuthFlow() {
  const { isLoggedIn } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen 
          name="Home" 
          component={ProtectedHomeScreen}
        />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}