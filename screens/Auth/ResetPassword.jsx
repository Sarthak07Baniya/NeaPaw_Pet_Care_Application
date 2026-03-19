import { Feather } from "@expo/vector-icons";
import { useFonts } from "expo-font";
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
import Button from "../../components/ui/Button/Button";
import { authService } from "../../services/authService";

const ResetPassword = ({ navigation, route }) => {
  const { email } = route.params || {};
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  let [fontsLoaded] = useFonts({
    "Nunito-Bold": require("../../assets/fonts/Nunito-ExtraBold.ttf"),
  });

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  const validate = () => {
    if (!newPassword || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'All fields are required.',
      });
      return false;
    }
    if (newPassword.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Password must be at least 6 characters long.',
      });
      return false;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Passwords do not match.',
      });
      return false;
    }
    return true;
  };

  const handleResetPassword = async () => {
    if (!validate()) return;

    setIsLoading(true);

    try {
      const response = await authService.confirmPasswordReset(
        email,
        newPassword,
        confirmPassword
      );

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: response.message,
        });
        // Navigate to login after a short delay
        setTimeout(() => {
          navigation.navigate("Login");
        }, 1000);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.message,
        });
      }
    } catch (err) {
      console.error("Password reset error:", err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not connect to server.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Feather name="arrow-left" size={24} color="#333" />
      </TouchableOpacity>

      <Image
        source={require("../../assets/png/login.png")}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.header}>Reset Password</Text>
      <Text style={styles.subtitle}>
        Enter your new password below.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>New Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter new password (min 6 chars)"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Feather
              name={showPassword ? "eye" : "eye-off"}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirm new password"
            placeholderTextColor="#999"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
          >
            <Feather
              name={showConfirmPassword ? "eye" : "eye-off"}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          onPress={handleResetPassword}
          text={isLoading ? "Resetting..." : "Reset Password"}
          disabled={isLoading}
        />
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.backToLoginText}>
          Back to <Text style={styles.linkText}>Login</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
    paddingVertical: 40,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    marginBottom: 20,
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
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#555",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    height: 50,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#2C2C2C",
  },
  eyeIcon: {
    paddingHorizontal: 15,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  backToLoginText: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
  },
  linkText: {
    color: "#8D94F4",
    fontWeight: "bold",
  },
});
