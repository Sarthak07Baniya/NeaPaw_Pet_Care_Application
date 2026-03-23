import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../../redux/slice/authSlice";
import { authService } from "../../services/authService";

const EditProfile = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUsername(authUser?.username || "");
    setFirstName(authUser?.first_name || "");
    setLastName(authUser?.last_name || "");
    setEmail(authUser?.email || "");
    setContactNumber(authUser?.contact_number || "");
  }, [authUser]);

  const handleSave = async () => {
    if (!username.trim() || !firstName.trim() || !lastName.trim() || !email.trim()) {
      return Alert.alert("Missing fields", "Please fill username, first name, last name, and email.");
    }

    try {
      setLoading(true);
      const updatedUser = await authService.updateProfile({
        username: username.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        contact_number: contactNumber,
      });
      dispatch(updateUser(updatedUser));
      Alert.alert("Profile updated", "Your profile details have been saved.");
    } catch (error) {
      Alert.alert("Unable to update profile", error?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          placeholder="Enter username"
        />

        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Enter first name"
        />

        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter last name"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Enter email"
        />

        <Text style={styles.label}>Contact Number</Text>
        <TextInput
          style={styles.input}
          value={contactNumber}
          onChangeText={setContactNumber}
          keyboardType="phone-pad"
          placeholder="Enter contact number"
        />

        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Saving..." : "Save Changes"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },
  content: { padding: 16 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 18 },
  label: { fontSize: 14, fontWeight: "600", color: "#444444", marginBottom: 8, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#222222",
    backgroundColor: "#FAFAFA",
  },
  button: {
    marginTop: 22,
    backgroundColor: "#FF6B9D",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 14,
  },
  buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
