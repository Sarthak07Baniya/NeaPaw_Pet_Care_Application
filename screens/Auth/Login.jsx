import { useFonts } from "expo-font";
import { CommonActions } from "@react-navigation/native";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";

import { loginSuccess } from "../../redux/slice/authSlice";
import { setPetData, setSelectedDate } from "../../redux/slice/myPetSlice";
import { authService } from "../../services/authService";
import { petService } from "../../services/petService";

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  let [fontsLoaded] = useFonts({
    "Nunito-Bold": require("../../assets/fonts/Nunito-ExtraBold.ttf"),
  });

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  const validate = () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Email and password are required.',
      });
      return false;
    }
    if (password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Password must be at least 6 characters.',
      });
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setIsLoading(true);

    try {
      const response = await authService.login(email, password);

      if (response.success) {
        dispatch(loginSuccess({
          token: response.token,
          user: response.user
        }));

        const parentNavigation = navigation.getParent?.() || navigation;

        try {
          const petsResponse = await petService.getPets();
          const pets = petsResponse?.results || petsResponse || [];

          if (pets.length > 0) {
            dispatch(setPetData(pets[0]));
            dispatch(setSelectedDate(new Date().toISOString()));
            parentNavigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "bottomNavStack" }],
              })
            );
          } else {
            parentNavigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "startStack" }],
              })
            );
          }
        } catch (petError) {
          console.error("Post-login pet fetch error:", petError);
          parentNavigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "startStack" }],
            })
          );
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: response.message || 'Invalid credentials.',
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.type === 'auth') {
        Toast.show({
          type: 'error',
          text1: 'Authentication Error',
          text2: err.message,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Connection Error',
          text2: 'Could not connect to server. Please check your internet connection.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* image */}
      <Image
        source={require("../../assets/png/login.png")}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.header}>Welcome Back</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity 
          style={styles.forgotPasswordLink}
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleLogin}
          style={styles.loginButton}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>
        
   
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.registerText}>
          Don't have an account? <Text style={styles.linkText}>Register</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
    paddingVertical: 40,
    backgroundColor: "#FFFFFF",
  },
  image: {
    width: "100%",
    height: 180,
    marginBottom: 20,
    alignSelf: "center",
  },
  header: {
    fontSize: 30,
    fontFamily: "Nunito-Bold",
    marginBottom: 30,
    color: "#333",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#555",
    textDecorationColor: "#555",
    textDecorationLine: "underline",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#2C2C2C",
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  loginButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#707BFB",
    borderRadius: 12,
    padding: 15,
    position: "relative",
    overflow: "hidden",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    zIndex: 2,
  },
  forgotPasswordLink: {
    marginTop: 8,
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    color: "#8D94F4",
    fontSize: 14,
    fontWeight: "600",
  },
  registerText: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
  },
  linkText: {
    color: "#8D94F4",
    fontWeight: "bold",
  },
});


