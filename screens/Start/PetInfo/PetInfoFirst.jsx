import { useIsFocused } from "@react-navigation/native";
import moment from "moment";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";
import Level from "../../../components/level/Level";
import Button from "../../../components/ui/Button/Button";
import DatePickerInput from "../../../components/ui/DatePicker/DatePickerInput";
import Photo from "../../../components/ui/ImagePhoto/Photo";
import Input from "../../../components/ui/Input/Input";
import { setpetNameAndBirthDate } from "../../../redux/slice/myPetSlice";

const PetInfoFirst = ({ navigation }) => {
  const isFocused = useIsFocused();
  const currentPetInfo = useSelector((state) => state.myPet.currentPetInfo);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    if (isFocused) {
      setName(currentPetInfo.name);
      setBirthDate(currentPetInfo.birthDate);
    }
  }, [isFocused]);

  const petInfoSecondHandler = () => {
    if (name === "") {
      return Alert.alert("oops...", "Please enter your pet's name");
    } else if (name.length > 10 || name.length < 2) {
      return Alert.alert(
        "oops...",
        "Please enter your pet's name(max 10 chracter and min 2)"
      );
    }
    let trimName = name.trim();
    const normalizedBirthDate = birthDate
      ? moment(
          birthDate,
          ["YYYY/MM/DD", "YYYY-MM-DD", moment.ISO_8601],
          true
        ).format("YYYY-MM-DD")
      : "";

    if (birthDate && (!normalizedBirthDate || normalizedBirthDate === "Invalid date")) {
      return Alert.alert("oops...", "Please enter a valid pet birth date");
    }

    dispatch(
      setpetNameAndBirthDate({
        name: trimName,
        birthDate: normalizedBirthDate,
      })
    );
    navigation.navigate("PetInfoSecond");
  };

  const birthDateHandler = (date) => {
    setBirthDate(date);
  };

  const nameChangeHandler = (text) => {
    setName(text);
  };

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      style={styles.petInfoFirstContainer}
    >
      <Level level="2" />
      <Text style={styles.headerText}>Fill Your Pet Info</Text>
      <Photo />
      <Input
        placeholder="Pet Name *"
        type="default"
        label="Pet Name *"
        onChange={nameChangeHandler}
        value={name}
      />
      {/* <Input placeholder="Birth Date" type="numeric" label="Birth Date" /> */}
      <DatePickerInput
        selectedDateForUpdate={birthDate}
        onChange={birthDateHandler}
        title="Birth Date (if known)"
        isStartingScreenBirthDate={true}
        locale="en-US"
        customLabel="Birth Date (if known)"
      />
      <View style={styles.buttonContainer}>
        <Button text="Next" onPress={petInfoSecondHandler} />
      </View>
    </KeyboardAwareScrollView>
  );
};

export default PetInfoFirst;

const styles = StyleSheet.create({
  petInfoFirstContainer: {
    backgroundColor: "#FFFFFF",
    flex: 1,
  },
  headerText: {
    fontSize: 20,
    color: "#7D7D7D",
    textAlign: "center",
    fontWeight: "500",
    marginTop: 20,
  },
  buttonDateContainer: {
    widht: "80%",
    paddingHorizontal: 20,
  },
  buttonContainer: {
    widht: "100%",
    marginTop: Dimensions.get("window").height * 0.1,
    marginBottom: 25,
    paddingRight: 25,
    paddingHorizontal: 180,
    flexDirection: "column",
  },
});
