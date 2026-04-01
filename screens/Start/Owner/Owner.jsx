import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Keyboard,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import cat6 from "../../../assets/activityImages/cat/cat--6.png";
import image from "../../../assets/images/owner.png";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import {
    addPetAsync,
    setPetData,
    setOwnerName,
} from "../../../redux/slice/myPetSlice";

const OWNER_NAME_KEY = "neapaw_owner_name";

const Owner = ({ navigation }) => {
  const [owner, setOwner] = useState("");
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const currentPetInfo = useSelector((state) => state.myPet.currentPetInfo);
  const [isLoading, setIsLoading] = useState(false);
  const isSubmittingRef = useRef(false);
  const hasSubmittedSuccessfullyRef = useRef(false);

  const pressHandler = async () => {
    if (isLoading || isSubmittingRef.current) {
      return;
    }
    Keyboard.dismiss();
    if (owner === "") {
      return Alert.alert("oops...", "Please enter your name");
    }
    if (owner.length > 20 || owner.length < 4) {
      return Alert.alert(
        "oops...",
        "Please enter your name(max 20 chracter and min 4)"
      );
    }
    if (/\d/.test(owner)) {
      return Alert.alert("oops...", "Please enter your name without number");
    }
    let ownerTrim = owner.trim();

    await AsyncStorage.setItem(OWNER_NAME_KEY, ownerTrim);
    dispatch(setOwnerName(ownerTrim));

    const normalizedBirthday = currentPetInfo.birthDate
      ? moment(
          currentPetInfo.birthDate,
          ["YYYY/MM/DD", "YYYY-MM-DD", moment.ISO_8601],
          true
        ).format("YYYY-MM-DD")
      : null;

    const pet = {
      birthday: normalizedBirthday,
      breed: currentPetInfo.breed,
      gender:
        currentPetInfo.gender === "male"
          ? "Male"
          : currentPetInfo.gender === "female"
            ? "Female"
            : currentPetInfo.gender,
      name: currentPetInfo.name,
      ownerName: ownerTrim,
      pet_type:
        currentPetInfo.spicie === "dog"
          ? "Dog"
          : currentPetInfo.spicie === "cat"
            ? "Cat"
            : currentPetInfo.spicie,
      photo: currentPetInfo.photoURL || null,
      weight: currentPetInfo.weight ? parseFloat(currentPetInfo.weight) : null,
    };
    isSubmittingRef.current = true;
    setIsLoading(true);
    try {
      const createdPet = await dispatch(addPetAsync(pet)).unwrap();
      hasSubmittedSuccessfullyRef.current = true;
      dispatch(setPetData(createdPet));

      let rootNavigation = navigation;
      while (rootNavigation?.getParent?.()) {
        rootNavigation = rootNavigation.getParent();
      }

      rootNavigation?.reset?.({
        index: 0,
        routes: [
          {
            name: "bottomNavStack",
          },
        ],
      });

      return;
    } catch (err) {
      console.error("Add pet error:", err);
      Alert.alert("Error", "Failed to add pet. Please try again.");
    } finally {
      if (!hasSubmittedSuccessfullyRef.current) {
        isSubmittingRef.current = false;
        setIsLoading(false);
      }
    }
  };

  const ownerHandler = (owner) => {
    setOwner(owner);
  };

  useEffect(() => {
    if (isFocused) {
      setOwner(currentPetInfo.ownerName);
    }
  }, [isFocused]);

  return (
    <ScrollView
      style={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="always"
    >
      <View style={styles.container}>
        <View
          style={[
            styles.circle,
            {
              height:
                currentPetInfo.spicie === "dog"
                  ? Dimensions.get("window").height * 0.37
                  : Dimensions.get("window").height * 0.43,
            },
          ]}
        ></View>
        <Text style={styles.headerText}>Please Fill Your Info</Text>
        <View
          style={[
            styles.imageContainer,
            {
              height:
                currentPetInfo.spicie === "dog"
                  ? Dimensions.get("window").height * 0.35
                  : Dimensions.get("window").height * 0.34,
            },
          ]}
        >
          <Image
            style={styles.image}
            source={currentPetInfo.spicie === "dog" ? image : cat6}
          />
        </View>
        <View style={styles.inputContainer}>
          <Input
            placeholder="Your Name and Surname"
            type="default"
            label="Name Surname"
            onChange={ownerHandler}
            value={owner}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button text="Finish" onPress={pressHandler} disabled={isLoading} />
        </View>
      </View>
      {isLoading && (
        <View style={[styles.loading]}>
          <ActivityIndicator size="large" color="#707BFB" />
        </View>
      )}
    </ScrollView>
  );
};

export default Owner;

const styles = StyleSheet.create({
  scrollContainer: {
    backgroundColor: "#FFFFFF",
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    // paddingHorizontal: 25,
    // paddingTop: 60,
    backgroundColor: "#FFFFFF",
  },
  loading: {
    position: "absolute",
    zIndex: 1,
    top: 0,
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: "rgba(72, 109, 229, 0.23)",
  },
  headerText: {
    fontSize: 20,
    color: "#7D7D7D",
    textAlign: "center",
    fontWeight: "500",
    marginTop: 20,
  },
  circle: {
    width: "100%",
    // height: Dimensions.get("window").height * 0.35,
    // borderRadius: 75,
    // borderBottomEndRadius: 50,
    borderBottomLeftRadius: Dimensions.get("window").width * 0.5,
    borderBottomRightRadius: Dimensions.get("window").width * 0.5,
    // top: -340,
    // left: -15,
    backgroundColor: "#FEE8DC",
    position: "absolute",
    zIndex: -1,
  },
  imageContainer: {
    marginTop: 10,
    width: "100%",
    // height: Dimensions.get("window").height * 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    flex: 1,
    // width: null,
    // height: null,
    resizeMode: "contain",
    left: 5,
  },
  inputContainer: {
    width: "90%",
  },
  buttonContainer: {
    width: "90%",
    marginTop: 60,
  },
});
