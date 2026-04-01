import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../../redux/slice/authSlice";
import { authService } from "../../services/authService";
import { resolveMediaUrl } from "../../services/api";

const EditProfile = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUsername(authUser?.username || "");
    setFirstName(authUser?.first_name || "");
    setLastName(authUser?.last_name || "");
    setEmail(authUser?.email || "");
    setContactNumber(authUser?.contact_number || "");
    setProfileImage(authUser?.profile_picture || null);
  }, [authUser]);

  const getProfileImageUri = (value) => {
    if (!value) return null;
    if (/^(file|content):\/\//i.test(value)) return value;
    return resolveMediaUrl(value);
  };

  const pickProfileImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return Alert.alert("Permission needed", "Please allow gallery access to upload a profile picture.");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!username.trim() || !firstName.trim() || !lastName.trim() || !email.trim()) {
      return Alert.alert("Missing fields", "Please fill username, first name, last name, and email.");
    }

    try {
      setLoading(true);
      const profileData = new FormData();
      profileData.append("username", username.trim());
      profileData.append("first_name", firstName.trim());
      profileData.append("last_name", lastName.trim());
      profileData.append("email", email.trim().toLowerCase());
      profileData.append("contact_number", contactNumber || "");

      if (profileImage && !/^https?:\/\//i.test(profileImage) && !profileImage.startsWith("/media/")) {
        profileData.append("profile_picture", {
          uri: profileImage,
          type: "image/jpeg",
          name: "profile-picture.jpg",
        });
      }

      const updatedUser = await authService.updateProfile(profileData);
      dispatch(updateUser(updatedUser));
      setProfileImage(updatedUser?.profile_picture || profileImage);
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
        <View style={styles.imageSection}>
          <TouchableOpacity style={styles.imagePicker} onPress={pickProfileImage} activeOpacity={0.8}>
            {profileImage ? (
              <Image source={{ uri: getProfileImageUri(profileImage) }} style={styles.profileImage} />
            ) : (
              <Text style={styles.imagePickerText}>Upload Photo</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.imageHint}>Tap to choose from gallery</Text>
        </View>

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
  imageSection: { alignItems: "center", marginBottom: 8 },
  imagePicker: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#FFF0F6",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 8,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  imagePickerText: {
    color: "#FF6B9D",
    fontSize: 13,
    fontWeight: "700",
  },
  imageHint: {
    fontSize: 12,
    color: "#888888",
  },
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
