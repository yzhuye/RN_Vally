import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import { useAuth } from "../context/authContext";

const COLORS = {
  primary: "#00A4BD",
  secondary: "#00E5D4",
  darkText: "#1E2A38",
  lightText: "#000000",
  background: "#F5F9FF",
  white: "#FFFFFF",
  border: "#E0E0E0",
  placeholder: "rgba(0, 0, 0, 0.45)",
  checkboxText: "rgba(0, 0, 0, 0.54)",
};

export default function LoginScreen({ navigation }: { navigation: any }) {
  const { login } = useAuth();
  const { height } = useWindowDimensions();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isRememberMeChecked, setIsRememberMeChecked] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await login(email, password);
    } catch (err) {
      console.error("Login failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.innerContainer}>
          <Image
            source={require("@/assets/images/vally_logo.png")}
            style={[styles.logo, { height: height * 0.15 }]}
            resizeMode="contain"
          />

          <Text style={styles.title}>Bienvenido de vuelta</Text>
          
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="person-outline" size={20} color={COLORS.primary} />
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Email"
              placeholderTextColor={COLORS.placeholder}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="lock-outline" size={20} color={COLORS.primary} />
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Contraseña"
              placeholderTextColor={COLORS.placeholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
            />
            <TouchableOpacity 
              style={styles.visibilityButton}
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <MaterialIcons 
                name={isPasswordVisible ? "visibility" : "visibility-off"} 
                size={20} 
                color="#999" 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setIsRememberMeChecked(!isRememberMeChecked)}
            activeOpacity={0.7}
          >
            <MaterialIcons 
              name={isRememberMeChecked ? "check-box" : "check-box-outline-blank"} 
              size={24} 
              color={COLORS.primary} 
            />
            <Text style={styles.checkboxLabel}>Mantener sesión iniciada</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size={22} color={COLORS.white} />
            ) : (
              <Text style={styles.loginButtonText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  innerContainer: {
    paddingHorizontal: 24,
    paddingVertical: 48,
    width: "100%",
    alignItems: "center",
  },
  logo: {
    width: "100%",
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.darkText,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.checkboxText,
    marginBottom: 40,
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    paddingHorizontal: 12,
    height: 56,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.darkText,
    paddingVertical: 12,
  },
  visibilityButton: {
    padding: 8,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 32,
    marginLeft: 0,
  },
  checkboxLabel: {
    fontSize: 16,
    color: COLORS.checkboxText,
    marginLeft: 8,
  },
  loginButton: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
});
