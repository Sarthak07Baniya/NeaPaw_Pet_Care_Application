import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
const Button = ({ onPress, text, disabled = false, ...props }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={[styles.buttonContainer, disabled && styles.buttonDisabled]}
      {...props}
    >
      <Text style={styles.text}>{text}</Text>
      {text === "Next" && (
        <Ionicons name="chevron-forward-outline" size={26} color="#FFFFFF" />
      )}
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#707BFB",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  text: {
    color: "#fff",
    fontSize: 18,
    paddingVertical: 5,
    textAlign: "center",
    paddingHorizontal: 10,
    fontWeight: "bold",
  },
});
