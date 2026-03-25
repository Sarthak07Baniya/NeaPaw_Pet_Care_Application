import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector } from "react-redux";
import moment from "moment";
import Button from "../../../../components/ui/Button/Button";
import ClockPicker from "../../../../components/ui/ClockPicker/ClockPicker";
import DatePickerInput from "../../../../components/ui/DatePicker/DatePickerInput";
import Input from "../../../../components/ui/Input/Input";
import { petService } from "../../../../services/petService";
import { schedulePushNotification } from "../../../../utils/notifications";

const VaccineAddScreen = ({ navigation }) => {
  const currentPetId = useSelector((state) => state.myPet.currentPetId);
  const petName = useSelector((state) => state.myPet.currentPetInfo.name);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const nameHandler = (name) => {
    setName(name);
  };
  const dateHandler = (date) => {
    setDate(date);
  };
  const timeHandler = (selectedTime) => {
    setTime(selectedTime);
  };

  const addVaccineHandler = () => {
    if (name.length === 0 || date.length === 0 || time.length === 0) {
      return Alert.alert("oops...", "Please fill all the fields");
    } else if (name.length > 20) {
      return Alert.alert("oops...", "Please enter a valid name");
    }
    const normalizedDate = moment(date, ["YYYY/MM/DD", "YYYY-MM-DD", moment.ISO_8601], true);
    if (!normalizedDate.isValid()) {
      return Alert.alert("oops...", "Please select a valid date");
    }
    const normalizedDateTime = moment(
      `${normalizedDate.format("YYYY-MM-DD")} ${time}`,
      [
        "YYYY-MM-DD hh:mm:ss A",
        "YYYY-MM-DD h:mm:ss A",
        "YYYY-MM-DD HH:mm:ss",
        "YYYY-MM-DD HH:mm",
        "YYYY-MM-DD hh:mm A",
        "YYYY-MM-DD h:mm A",
      ],
      true
    );

    if (!normalizedDateTime.isValid()) {
      return Alert.alert("oops...", "Please select a valid time");
    }

    const now = moment();
    const selectedDay = normalizedDateTime.clone().startOf("day");
    const today = now.clone().startOf("day");

    if (selectedDay.isBefore(today)) {
      return Alert.alert("oops...", "Please select today or a future vaccine date");
    }

    const selectedMinute = normalizedDateTime.clone().startOf("minute");
    const currentMinute = now.clone().startOf("minute");

    if (selectedDay.isSame(today) && selectedMinute.isBefore(currentMinute)) {
      return Alert.alert("oops...", "For today, please select a time that is still ahead");
    }

    const formattedDateString = normalizedDateTime.format("YYYY-MM-DDTHH:mm:ss");

    const vaccineData = {
      pet: currentPetId,
      name: name.trim(),
      date: formattedDateString,
      note: `Vaccine: ${name.trim()} at ${time}`,
    };

    petService.addVaccine(vaccineData)
      .then(async (savedVaccine) => {
        try {
          await schedulePushNotification(
            `${petName} vaccine reminder`,
            `${name.trim()} vaccine time is now.`,
            normalizedDateTime.toDate(),
            normalizedDateTime.format("HH:mm:ss"),
            {
              includeReminderBefore: false,
              data: {
                type: "vaccine_reminder",
                vaccineId: savedVaccine?.id,
              },
            }
          );
        } catch (notificationError) {
          Alert.alert(
            "Saved without reminder",
            notificationError?.message || "The vaccine was saved, but the reminder could not be scheduled."
          );
        }
        navigation.navigate("VaccineHistory", { refresh: true });
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
      <Text style={styles.headerText}>Fill Inputs to add Vaccine Date and Time</Text>
      <View style={styles.editContainer}>
        <DatePickerInput
          showLabel={false}
          buttonText="Pick Vaccine Date"
          title="Vaccine Date"
          onChange={dateHandler}
        />
        <ClockPicker
          placeHolder="Vaccine Time"
          buttonPlaceHolder="Save Vaccine Time"
          showSeconds
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
