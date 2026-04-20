import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { authService } from "../../services/authService";

const ChangePassword = ({ navigation }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "All fields are required.",
      });
      return false;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "New password must be at least 6 characters long.",
      });
      return false;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "New password and confirm password must match.",
      });
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validate() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const response = await authService.changePassword(
      oldPassword,
      newPassword,
      confirmPassword
    );

    if (response.success) {
      Toast.show({
        type: "success",
        text1: "Success",
        text2: response.message,
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => navigation.goBack(), 900);
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: response.message,
      });
    }

    setIsSubmitting(false);
  };

  const renderPasswordField = ({
    label,
    value,
    onChangeText,
    visible,
    onToggleVisible,
    placeholder,
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder={placeholder}
          placeholderTextColor="#999999"
          secureTextEntry={!visible}
          autoCapitalize="none"
          value={value}
          onChangeText={onChangeText}
        />
        <TouchableOpacity
          onPress={onToggleVisible}
          style={styles.eyeButton}
          activeOpacity={0.8}
        >
          <Feather
            name={visible ? "eye" : "eye-off"}
            size={18}
            color="#8A8A8A"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.iconWrap}>
          <Feather name="lock" size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Change Password</Text>
        <Text style={styles.subtitle}>
          Enter your old password and choose a new one to keep your account secure.
        </Text>
      </View>

      <View style={styles.formCard}>
        {renderPasswordField({
          label: "Old Password",
          value: oldPassword,
          onChangeText: setOldPassword,
          visible: showOldPassword,
          onToggleVisible: () => setShowOldPassword((prev) => !prev),
          placeholder: "Enter current password",
        })}

        {renderPasswordField({
          label: "New Password",
          value: newPassword,
          onChangeText: setNewPassword,
          visible: showNewPassword,
          onToggleVisible: () => setShowNewPassword((prev) => !prev),
          placeholder: "Enter new password",
        })}

        {renderPasswordField({
          label: "Confirm Password",
          value: confirmPassword,
          onChangeText: setConfirmPassword,
          visible: showConfirmPassword,
          onToggleVisible: () => setShowConfirmPassword((prev) => !prev),
          placeholder: "Confirm new password",
        })}

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleChangePassword}
          activeOpacity={0.85}
          disabled={isSubmitting}
        >
          <Feather name="shield" size={18} color="#FFFFFF" />
          <Text style={styles.submitText}>
            {isSubmitting ? "Updating..." : "Update Password"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  content: {
    padding: 20,
    gap: 16,
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FF6B9D",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C2C2C",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#707070",
    textAlign: "center",
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    color: "#444444",
    fontWeight: "600",
    marginBottom: 8,
  },
  passwordContainer: {
    borderWidth: 1,
    borderColor: "#E3E3E3",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFDFD",
  },
  passwordInput: {
    flex: 1,
    height: 54,
    paddingHorizontal: 16,
    color: "#2C2C2C",
    fontSize: 15,
  },
  eyeButton: {
    paddingHorizontal: 16,
    height: 54,
    justifyContent: "center",
  },
  submitButton: {
    marginTop: 8,
    backgroundColor: "#FF6B9D",
    borderRadius: 16,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
