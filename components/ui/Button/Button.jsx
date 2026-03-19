import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
const Button = ({ onPress, text, ...props }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.buttonContainer, {}]}
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
  text: {
    color: "#fff",
    fontSize: 18,
    paddingVertical: 5,
    textAlign: "center",
    paddingHorizontal: 10,
    fontWeight: "bold",
  },
});
