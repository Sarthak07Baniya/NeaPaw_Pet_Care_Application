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
import CheckBox from "react-native-check-box";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";

import Button from "../../components/ui/Button/Button";
import { loginSuccess } from "../../redux/slice/authSlice";
import { authService } from "../../services/authService";

const RegistrationScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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
    // Simple validation
    if (!fullName || !email || !password || !confirmPassword || !contactNumber) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'All fields are required.',
      });
      return false;
    }
    if (fullName.trim().length < 2) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your full name.',
      });
      return false;
    }
    // Basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid email address.',
      });
      return false;
    }
    if (password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Password must be at least 6 characters long.',
      });
      return false;
    }
    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Passwords do not match.',
      });
      return false;
    }
    if (!agreedToTerms) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'You must agree to the terms and conditions.',
      });
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.register({
        full_name: fullName,
        email,
        password,
        contact_number: contactNumber
      });

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: response.message || 'Account created successfully!',
        });
        // Automatically log in the user and navigate to home via reactive auth
        dispatch(loginSuccess({
          user: response.user,
          token: response.token
        }));
      } else {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: response.message || 'An error occurred.',
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not connect to the server.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
        <Image
              source={require("../../assets/png/register.png")}
              style={styles.image}
              resizeMode="contain"
            />
      <Text style={styles.header}>Create an Account</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          placeholderTextColor="#999"
          autoCapitalize="words"
          value={fullName}
          onChangeText={setFullName}
        />
      </View>

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
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter your password (min 6 chars)"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
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
            placeholder="Confirm your password"
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

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Contact Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your contact number"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          value={contactNumber}
          onChangeText={setContactNumber}
        />
      </View>

      <View style={styles.termsContainer}>
        {/* Replace CheckBox with an imported component or use a custom TouchableOpacity */}
        <CheckBox
          onClick={() => setAgreedToTerms(!agreedToTerms)}
          isChecked={agreedToTerms}
          // Customize checkbox appearance
          checkBoxColor="#8D94F4" 
        />
        <Text style={styles.termsText}>
          I agree to the{" "}
          <Text style={styles.linkText}>Terms and Conditions</Text>
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          onPress={handleRegister}
          text={isLoading ? "Registering..." : "Register"}
          disabled={isLoading}
        />
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginText}>
          Already have an account? <Text style={styles.linkText}>Login</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default RegistrationScreen;

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
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  termsText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#555",
  },
  linkText: {
    color: "#8D94F4",
    fontWeight: "bold",
  },
  buttonContainer: {
    marginBottom: 20,
  },
  loginText: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
  },
});