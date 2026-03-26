import { useIsFocused } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import dog from "../../../assets/images/photoDog.png";
import { setPetImage } from "../../../redux/slice/myPetSlice";

const Photo = () => {
  const currentPetId = useSelector((state) => state.myPet.currentPetId);
  const [image, setImage] = useState(null);
  const dispatch = useDispatch();
  const myPetPhoto = useSelector(
    (state) => state.myPet.currentPetInfo.photoURL
  );
  const isFocused = useIsFocused();

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return Alert.alert(
        "Insufficient Permissions!",
        "You need to grant gallery permissions to use this app."
      );
    }

    const image = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (image.canceled || !image.assets?.length) {
      return;
    }
    const imageUri = image.assets[0].uri;
    dispatch(setPetImage(imageUri));
    setImage(imageUri);
  };

  useEffect(() => {
    if (isFocused) {
      setImage(myPetPhoto);
    }
  }, [isFocused,currentPetId]);

  return (
    <Pressable style={styles.photoContainer} onPress={pickImage}>
      <View style={styles.boxContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.imageTaken} />
        ) : (
          <Image source={dog} style={styles.image} />
        )}
        {!image && <Text style={styles.photoText}>Choose from Gallery</Text>}
      </View>
    </Pressable>
  );
};

export default Photo;

const styles = StyleSheet.create({
  photoContainer: {
    width: "100%",
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  boxContainer: {
    backgroundColor: "#F8FAFD",
    borderWidth: 2,
    borderColor: "#F7F7F7",
    width: 120,
    height: 120,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  imageTaken: {
    width: 115,
    height: 115,
    borderRadius: 12,
  },
  photoText: {
    paddingTop: 10,
    fontSize: 14,
    color: "#A7B0C0",
    textAlign: "center",
    fontWeight: "600",
  },
});
