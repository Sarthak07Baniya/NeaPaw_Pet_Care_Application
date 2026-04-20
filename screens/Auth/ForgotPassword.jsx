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

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  let [fontsLoaded] = useFonts({
    "Nunito-Bold": require("../../assets/fonts/Nunito-ExtraBold.ttf"),
  });

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  const validate = () => {
    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Email is required.',
      });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid email address.',
      });
      return false;
    }
    return true;
  };

  const handleResetRequest = async () => {
    if (!validate()) return;

    setIsLoading(true);

    try {
      const response = await authService.requestPasswordReset(email);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: response.message,
        });
        // Navigate after a short delay to allow user to see the success message
        setTimeout(() => {
          navigation.navigate("ResetPassword", { email });
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
      <Text style={styles.header}>Forgot Password?</Text>
      <Text style={styles.subtitle}>
        Enter your email address and we will send you a 6-digit OTP to reset your password.
      </Text>

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

      <View style={styles.buttonContainer}>
        <Button
          onPress={handleResetRequest}
          text={isLoading ? "Sending..." : "Send OTP"}
          disabled={isLoading}
        />
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.backToLoginText}>
          Remember your password? <Text style={styles.linkText}>Login</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ForgotPassword;

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
