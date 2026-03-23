import moment from "moment";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector } from "react-redux";
import Button from "../../../../components/ui/Button/Button";
import DatePickerInput from "../../../../components/ui/DatePicker/DatePickerInput";
import Input from "../../../../components/ui/Input/Input";
import { petService } from "../../../../services/petService";

const MedicalAddScreen = ({ navigation }) => {
  const currentPetId = useSelector((state) => state.myPet.currentPetId);

  const [illness, setIllness] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, endStartTime] = useState("");

  const ilnessHandler = (note) => {
    setIllness(note);
  };
  const startTimeHandler = (date) => {
    setStartTime(date);
  };
  const endTimeHandler = (date) => {
    endStartTime(date);
  };

  const medicalDataHandler = () => {
    if (illness === "" || startTime === "" || endTime === "") {
      return Alert.alert("oops...", "Please fill all the fields");
    } else if (illness > 20) {
      return Alert.alert(
        "oops...",
        "Please enter illness name less than 20 characters"
      );
    }
    const normalizedStart = moment(
      startTime,
      ["YYYY/MM/DD", "YYYY-MM-DD", moment.ISO_8601],
      true
    );
    const normalizedEnd = moment(
      endTime,
      ["YYYY/MM/DD", "YYYY-MM-DD", moment.ISO_8601],
      true
    );

    if (!normalizedStart.isValid() || !normalizedEnd.isValid()) {
      return Alert.alert("oops...", "Please select valid dates");
    }

    if (normalizedStart.isAfter(normalizedEnd, "day")) {
      return Alert.alert("oops...", "Start date should be less than end date");
    }
    if (normalizedStart.isSame(normalizedEnd, "day")) {
      return Alert.alert(
        "oops...",
        "Start date and end date should not be same"
      );
    }

    const formattedDateStringStart = `${normalizedStart.format("YYYY-MM-DD")}T00:00:00`;
    const formattedDateStringEnd = `${normalizedEnd.format("YYYY-MM-DD")}T00:00:00`;

    const medicalData = {
      pet: currentPetId,
      condition: illness.trim(),
      date: formattedDateStringStart, // Using start date as primary date
      note: `Treatment from ${formattedDateStringStart} to ${formattedDateStringEnd}`,
      treatment: "ongoing", // Or add a treatment field to UI
    };

    petService.addMedicalRecord(medicalData)
      .then(() => {
        navigation.navigate("MedicalHistory", { refresh: true });
      })
      .catch((err) => {
        console.log("Add medical error:", err);
        Alert.alert("Error", "Could not save medical record");
      });
  };

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      style={styles.container}
    >
      <Text style={styles.headerText}>Fill Inputs to add Medical Record</Text>
      <View style={styles.editContainer}>
        <DatePickerInput
          showLabel={true}
          title="Start Date"
          buttonText="Pick Start Date"
          onChange={startTimeHandler}
        />
        <DatePickerInput
          showLabel={true}
          title="End Date"
          buttonText="Pick End Date"
          onChange={endTimeHandler}
        />
        <Input
          placeholder="Illness Name"
          type="default"
          label="Illness Name"
          showLabel={false}
          onChange={ilnessHandler}
        />
        <View style={styles.buttonContainer}>
          <Button text="Add Medical Record" onPress={medicalDataHandler} />
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default MedicalAddScreen;

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
