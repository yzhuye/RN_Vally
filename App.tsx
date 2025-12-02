import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { PaperProvider } from "react-native-paper";

import { DIProvider } from "./src/core/di/DIProvider";
import { ActivityProvider } from "./src/features/activity/presentation/context/activity.context";
import { AuthProvider } from "./src/features/auth/presentation/context/authContext";
import { CategoryProvider } from "./src/features/category/presentation/context/category.context";
import { CourseProvider } from "./src/features/course/presentation/context/course.context";
import { EvaluationProvider } from "./src/features/evaluation/presentation/context/evaluation.context";
import { GroupProvider } from "./src/features/group/presentation/context/group.context";
import { ProfessorProvider } from "./src/features/group/presentation/context/professor.context";
import { lightTheme } from "./src/theme/theme";

import AuthFlow from "./src/AuthFlow";

export default function App() {
  const scheme = useColorScheme();
  //const theme = scheme === "dark" ? darkTheme : lightTheme;
  const theme = lightTheme;
  console.log("Current theme:", scheme);
  //console.log("Using theme:", theme);

  const navigationTheme = {
    ...(scheme === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(scheme === "dark" ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.onSurface,
      border: theme.colors.outline,
      primary: theme.colors.primary,
      notification: theme.colors.error,
    },
  };

  return (

    <PaperProvider theme={theme}>
      <DIProvider>
        <AuthProvider>
            <CourseProvider>
              <CategoryProvider>
                <ActivityProvider>
                  <EvaluationProvider>
                    <GroupProvider>
                      <ProfessorProvider>
                        <NavigationContainer theme={navigationTheme}>
                          {/* <AuthFlow /> */}
                          <AuthFlow />
                        </NavigationContainer>
                      </ProfessorProvider>
                    </GroupProvider>
                  </EvaluationProvider>
                </ActivityProvider>
              </CategoryProvider>
            </CourseProvider>
        </AuthProvider>
      </DIProvider>
    </PaperProvider>

  );
}