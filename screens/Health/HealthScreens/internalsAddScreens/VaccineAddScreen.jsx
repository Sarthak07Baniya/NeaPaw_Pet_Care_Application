import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector } from "react-redux";
import moment from "moment";
import Button from "../../../../components/ui/Button/Button";
import DatePickerInput from "../../../../components/ui/DatePicker/DatePickerInput";
import Input from "../../../../components/ui/Input/Input";
import { petService } from "../../../../services/petService";
import { schedulePushNotification } from "../../../../utils/notifications";

const VaccineAddScreen = ({ navigation }) => {
  const currentPetId = useSelector((state) => state.myPet.currentPetId);
  const petName = useSelector((state) => state.myPet.currentPetInfo.name);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");

  const nameHandler = (name) => {
    setName(name);
  };
  const timeHandler = (date) => {
    setDate(date);
  };

  const addVaccineHandler = () => {
    if (name.length === 0 || date.length === 0) {
      return Alert.alert("oops...", "Please fill all the fields");
    } else if (name.length > 20) {
      return Alert.alert("oops...", "Please enter a valid name");
    }
    const onlyDate = date.split(" ");
    const time = onlyDate[1] + ":00";
    if (time === "00:00:00") {
      return Alert.alert("oops...", "Please select a timeother than 00:00:00");
    }
    const datui = new Date(onlyDate[0]);
    const dates = moment(datui).format("YYYY-MM-DD");
    const formattedDateString = dates + "T" + time;

    const vaccineData = {
      pet: currentPetId,
      name: name.trim(),
      date: formattedDateString,
      note: `Vaccine: ${name.trim()}`,
    };

    petService.addVaccine(vaccineData)
      .then(() => {
        navigation.navigate("VaccineHistory", { refresh: true });
        schedulePushNotification(
          `${petName} has a Vaccine`,
          `Pssttt ${name} Vaccine is now...`,
          datui,
          time
        );
      })
      .catch((err) => {
        console.log("Add vaccine error:", err);
        Alert.alert("Error", "Could not save vaccine");
      });
  };

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      style={styles.container}
    >
      <Text style={styles.headerText}>Fill Inputs to add Vaccine Date</Text>
      <View style={styles.editContainer}>
        <DatePickerInput
          showLabel={false}
          buttonText="Pick Date and Hour"
          title="Vaccine Date"
          onChange={timeHandler}
        />
        <Input
          placeholder="Vaccine Name"
          type="default"
          label="Vaccine Name"
          showLabel={false}
          onChange={nameHandler}
        />
        <View style={styles.buttonContainer}>
          <Button text="Add Vaccine" onPress={addVaccineHandler} />
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default VaccineAddScreen;

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: "#FFFFFF",
  },
  headerText: {
    fontSize: 20,
    color: "#7D7D7D",
    textAlign: "center",
    fontWeight: "500",
    marginTop: 20,
  },
  scrollView: {
    height: "100%",
    marginTop: 15,
    // marginBottom: 20,
  },
  editContainer: {
    marginTop: 25,
  },
  buttonContainer: {
    marginTop: 45,
  },
});
