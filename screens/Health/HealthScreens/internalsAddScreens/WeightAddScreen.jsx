import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector } from "react-redux";
import Button from "../../../../components/ui/Button/Button";
import DatePickerInput from "../../../../components/ui/DatePicker/DatePickerInput";
import Input from "../../../../components/ui/Input/Input";
import { petService } from "../../../../services/petService";

import moment from "moment";
const WeightAddScreen = ({ navigation }) => {
  const [weitgh, setWeight] = useState(0);
  const [date, setDate] = useState("");
  const currentPetId = useSelector((state) => state.myPet.currentPetId);

  const weightHandler = (weight) => {
    setWeight(+weight);
  };
  const dateHandler = (date) => {
    setDate(date);
  };

  const addWeightHandler = () => {
    if (weitgh === "" || date === "") {
      return Alert.alert("oops...", "Please enter weight and date");
    } else if (isNaN(weitgh)) {
      return Alert.alert("oops...", "Please enter a valid weight");
    } else if (weitgh > 100 || weitgh < 0) {
      return Alert.alert("oops...", "Please enter a valid weight");
    }
    const normalizedDate = moment(date, ["YYYY/MM/DD", "YYYY-MM-DD", moment.ISO_8601], true);
    if (!normalizedDate.isValid()) {
      return Alert.alert("oops...", "Please select a valid date");
    }
    const formattedDateString = `${normalizedDate.format("YYYY-MM-DD")}T00:00:00`;

    const weightData = {
      pet: currentPetId,
      weight: weitgh,
      date: formattedDateString,
    };

    petService.addWeightLog(weightData)
      .then(() => {
        navigation.navigate("WeightHistory", { refresh: true });
      })
      .catch((err) => {
        console.log("Add weight error:", err);
        Alert.alert("Error", "Could not save weight log");
      });
  };

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      style={styles.container}
    >
      <Text style={styles.headerText}>Fill Inputs to add Weight</Text>
      <View style={styles.editContainer}>
        <DatePickerInput
          showLabel={false}
          buttonText="Pick Date and Hour"
          title="Weight Date"
          onChange={dateHandler}
        />
        <Input
          placeholder="Weight (kg)"
          type="numeric"
          label="Weight (kg)"
          showLabel={false}
          onChange={weightHandler}
        />
        <View style={styles.buttonContainer}>
          <Button text="Add Weight" onPress={addWeightHandler} />
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default WeightAddScreen;

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
