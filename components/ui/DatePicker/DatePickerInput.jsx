import moment from "moment";
import "moment/locale/en-gb"; // Import English locale
import { useEffect, useState } from "react";
import {
  LogBox,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import DatePicker from "react-native-modern-datepicker";
import { Ionicons as Icons } from "@expo/vector-icons";

// Set moment to use English locale
moment.locale("en");

const DatePickerInput = ({
  showLabel = true,
  buttonText,
  customLabel,
  onChange,
  isStartingScreenBirthDate,
  title,
  selectedDateForUpdate,
}) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  LogBox.ignoreLogs(["Deprecation warning:"]);

  // Pre-fill when updating profile
  useEffect(() => {
    if (selectedDateForUpdate) {
      // Use moment with proper format to avoid deprecation warnings
      const formatted = moment(selectedDateForUpdate, [
        "YYYY/MM/DD",
        "YYYY-MM-DD",
        moment.ISO_8601,
      ]).format("YYYY/MM/DD");
      setSelectedDate(formatted);
    }
  }, [selectedDateForUpdate]);

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {isStartingScreenBirthDate && (
          <Text style={styles.labelText}>{customLabel || "Birth Date"}</Text>
        )}

        <Pressable style={styles.input} onPress={() => setModalVisible(true)}>
          <Text style={styles.inputText}>
            {selectedDate !== "" ? selectedDate : title}
          </Text>
          <Icons name="calendar-outline" size={24} color="#7D7D7D" />
        </Pressable>
      </View>

      {/* MODAL */}
      <Modal animationType="slide" transparent visible={modalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <DatePicker
              mode="calendar"
              isGregorian={true}
              selected={selectedDate}
              current={
                selectedDate
                  ? selectedDate
                  : moment().format("YYYY/MM/DD")
              }
              onSelectedChange={(date) => setSelectedDate(date)}
              // Provide onDateChange as well — some internal components call this
              // (e.g. Days -> useCalendar().onDateChange). Ensure it's defined so
              // it doesn't throw when invoked by the library.
              onDateChange={(date) => setSelectedDate(date)}
              locale="en"
              options={{
                backgroundColor: "#FFFFFF",
                textHeaderColor: "#000000",
                textDefaultColor: "#000000",
                selectedTextColor: "#FFFFFF",
                mainColor: "#707BFB",
                textSecondaryColor: "#8D94F4",
              }}
            />

            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => {
                setModalVisible(false);
                // Check if onChange callback exists before calling it
                if (onChange && typeof onChange === "function") {
                  onChange(selectedDate);
                }
              }}
            >
              <Text style={styles.textStyle}>
                {buttonText || "Pick Birth Date"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DatePickerInput;

const styles = StyleSheet.create({
  container: {},
  inputContainer: {
    marginTop: 15,
    marginHorizontal: 20,
    flexDirection: "column",
  },
  input: {
    height: 50,
    borderColor: "#E7ECF3",
    borderWidth: 1,
    marginTop: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#F8FAFD",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputText: {
    color: "#7D7D7D",
    fontSize: 15,
  },
  labelText: {
    fontSize: 20,
    color: "#555555",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    width: "75%",
    backgroundColor: "white",
    borderRadius: 12,
    paddingBottom: 10,
    alignItems: "center",
    elevation: 10,
  },
  button: {
    borderRadius: 8,
    padding: 10,
    elevation: 2,
    marginTop: 10,
  },
  buttonClose: {
    backgroundColor: "#707BFB",
  },
  textStyle: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
  },
});
