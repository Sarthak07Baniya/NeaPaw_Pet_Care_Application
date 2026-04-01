import moment from "moment";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector } from "react-redux";
import Button from "../../../../components/ui/Button/Button";
import DatePickerInput from "../../../../components/ui/DatePicker/DatePickerInput";
import { petService } from "../../../../services/petService";
import { schedulePushNotification } from "../../../../utils/notifications";

const VetAddScreen = ({ navigation }) => {
  const currentPetId = useSelector((state) => state.myPet.currentPetId);
  const petName = useSelector((state) => state.myPet.currentPetInfo.name);
  const [date, setDate] = useState("");

  const timeHandler = (date) => {
    setDate(date);
  };

  const vetAddHandler = () => {
    if (date === "") {
      return Alert.alert("oops...", "Please select a date");
    }
    const normalizedDate = moment(
      date,
      ["YYYY/MM/DD", "YYYY-MM-DD", moment.ISO_8601],
      true
    );
    if (!normalizedDate.isValid()) {
      return Alert.alert("oops...", "Please select a valid date");
    }
    const formattedDateString = `${normalizedDate.format("YYYY-MM-DD")}T00:00:00`;

    const vetActivityData = {
      pet: currentPetId,
      date: formattedDateString,
      note: "Veterinary Appointment",
    };

    petService.addVetVisit(vetActivityData)
      .then(() => {
        navigation.navigate("VetAppoitments", { refresh: true });
        schedulePushNotification(
          `${petName} has a Vet Appointment`,
          "Pssttt Vet Appointment is now...",
          normalizedDate.toDate(),
          "00:00:00"
        );
      })
      .catch((err) => {
        console.log("Add vet error:", err);
        Alert.alert("Error", "Could not save vet appointment");
      });
  };

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      style={styles.container}
    >
      <Text style={styles.headerText}>Fill Inputs to add Vet Appointment</Text>
      <View style={styles.editContainer}>
        <DatePickerInput
          showLabel={true}
          title="Vet Appoitment Date"
          buttonText="Pick Date and Hour"
          onChange={timeHandler}
        />
        <View style={styles.buttonContainer}>
          <Button text="Add Vet Appointment" onPress={vetAddHandler} />
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default VetAddScreen;

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
