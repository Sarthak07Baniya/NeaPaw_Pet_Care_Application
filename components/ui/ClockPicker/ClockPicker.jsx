import {
  StyleSheet,
  Text,
  View,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons as Icons } from "@expo/vector-icons";
import React, { useState } from "react";
import DatePicker from "react-native-modern-datepicker";

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, index) => {
  const hour = index + 1;
  return {
    label: `${hour} o'clock`,
    value: `${hour === 12 ? 12 : hour}:00 ${hour === 12 ? "PM" : "AM"}`,
  };
});

const formatHourOnlyValue = (value) => {
  if (!value) return "";
  const parsed = Number(String(value).split(":")[0]);
  if (!parsed) return value;
  const displayHour = parsed > 12 ? parsed - 12 : parsed;
  return `${displayHour} o'clock`;
};

const sanitizeTimePart = (value, max) => {
  const numeric = value.replace(/[^0-9]/g, "").slice(0, 2);
  if (numeric === "") return "";
  return Number(numeric) > max ? String(max) : numeric;
};

const ClockPicker = ({
  placeHolder,
  buttonPlaceHolder,
  onChange,
  hourOnly = false,
  showSeconds = false,
}) => {
  const [time, setTime] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState("");
  const [selectedMinute, setSelectedMinute] = useState("");
  const [selectedSecond, setSelectedSecond] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("AM");

  const handleHourSelect = (selectedHour) => {
    setTime(formatHourOnlyValue(selectedHour));
    setModalVisible(false);
    onChange(selectedHour);
  };

  const handleDetailedSave = () => {
    const rawHour = Number(selectedHour || "0");
    const boundedHour = Math.min(Math.max(rawHour, 1), 12) || 12;
    const normalizedHour = String(boundedHour).padStart(2, "0");
    const normalizedMinute = String(selectedMinute || "00").padStart(2, "0");
    const normalizedSecond = String(selectedSecond || "00").padStart(2, "0");
    const selectedTime = `${normalizedHour}:${normalizedMinute}:${normalizedSecond} ${selectedPeriod}`;
    setTime(selectedTime);
    setModalVisible(false);
    onChange(selectedTime);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Pressable style={styles.input} onPress={() => setModalVisible(true)}>
          <Text style={styles.inputText}>
            {time === "" ? placeHolder : time}
          </Text>
          <Icons name="time-outline" size={24} color="#7D7D7D" />
        </Pressable>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
        style={styles.centeredView}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {showSeconds ? (
              <View style={styles.detailedPickerContainer}>
                <Text style={styles.hourPickerTitle}>
                  {buttonPlaceHolder || "Pick Time"}
                </Text>
                <View style={styles.detailedInputsRow}>
                  <View style={styles.detailedInputBlock}>
                    <Text style={styles.detailedLabel}>Hour</Text>
                    <TextInput
                      style={styles.detailedInput}
                      keyboardType="number-pad"
                      value={selectedHour}
                      onChangeText={(value) => setSelectedHour(sanitizeTimePart(value, 12))}
                      maxLength={2}
                      placeholder="12"
                      placeholderTextColor="#AAAAAA"
                      selectTextOnFocus
                    />
                  </View>
                  <View style={styles.detailedInputBlock}>
                    <Text style={styles.detailedLabel}>Minute</Text>
                    <TextInput
                      style={styles.detailedInput}
                      keyboardType="number-pad"
                      value={selectedMinute}
                      onChangeText={(value) => setSelectedMinute(sanitizeTimePart(value, 59))}
                      maxLength={2}
                      placeholder="00"
                      placeholderTextColor="#AAAAAA"
                      selectTextOnFocus
                    />
                  </View>
                  <View style={styles.detailedInputBlock}>
                    <Text style={styles.detailedLabel}>Second</Text>
                    <TextInput
                      style={styles.detailedInput}
                      keyboardType="number-pad"
                      value={selectedSecond}
                      onChangeText={(value) => setSelectedSecond(sanitizeTimePart(value, 59))}
                      maxLength={2}
                      placeholder="00"
                      placeholderTextColor="#AAAAAA"
                      selectTextOnFocus
                    />
                  </View>
                </View>
                <View style={styles.periodRow}>
                  <Pressable
                    style={[
                      styles.periodButton,
                      selectedPeriod === "AM" && styles.periodButtonActive,
                    ]}
                    onPress={() => setSelectedPeriod("AM")}
                  >
                    <Text
                      style={[
                        styles.periodButtonText,
                        selectedPeriod === "AM" && styles.periodButtonTextActive,
                      ]}
                    >
                      AM
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.periodButton,
                      selectedPeriod === "PM" && styles.periodButtonActive,
                    ]}
                    onPress={() => setSelectedPeriod("PM")}
                  >
                    <Text
                      style={[
                        styles.periodButtonText,
                        selectedPeriod === "PM" && styles.periodButtonTextActive,
                      ]}
                    >
                      PM
                    </Text>
                  </Pressable>
                </View>
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={handleDetailedSave}
                >
                  <Text style={styles.textStyle}>
                    {buttonPlaceHolder || "Save Time"}
                  </Text>
                </Pressable>
              </View>
            ) : hourOnly ? (
              <View style={styles.hourPickerContainer}>
                <Text style={styles.hourPickerTitle}>
                  {buttonPlaceHolder || "Pick Hour"}
                </Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {HOUR_OPTIONS.map((option) => (
                    <Pressable
                      key={option.label}
                      style={styles.hourOption}
                      onPress={() => handleHourSelect(option.value)}
                    >
                      <Text style={styles.hourOptionText}>{option.label}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <View style={styles.datePickerContainer}>
                <DatePicker
                  mode="time"
                  isGregorian={true}
                  minuteInterval={3}
                  locale="en"
                  onTimeChange={(selectedTime) => {
                    setTime(selectedTime);
                    setModalVisible(!modalVisible);
                    onChange(selectedTime);
                  }}
                  options={{
                    textDefaultColor: "#000000",
                    selectedTextColor: "#FFFFFF",
                    mainColor: "#707BFB",
                  }}
                  style={{ borderRadius: 10 }}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ClockPicker;

const styles = StyleSheet.create({
  inputContainer: {
    marginTop: 10,
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
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    width: 270,
    height: 275,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 0,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  datePickerContainer: {
    width: 230,
    height: 230,
  },
  detailedPickerContainer: {
    width: 230,
    minHeight: 230,
    paddingVertical: 16,
    justifyContent: "space-between",
  },
  hourPickerContainer: {
    width: 230,
    height: 230,
    paddingVertical: 14,
  },
  hourPickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555555",
    textAlign: "center",
    marginBottom: 12,
  },
  hourOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#F8FAFD",
    marginBottom: 8,
  },
  hourOptionText: {
    fontSize: 15,
    color: "#555555",
    textAlign: "center",
    fontWeight: "500",
  },
  detailedInputsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 20,
  },
  detailedInputBlock: {
    width: "31%",
  },
  periodRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    gap: 10,
  },
  periodButton: {
    minWidth: 72,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#F8FAFD",
    borderWidth: 1,
    borderColor: "#E7ECF3",
  },
  periodButtonActive: {
    backgroundColor: "#707BFB",
    borderColor: "#707BFB",
  },
  periodButtonText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#555555",
  },
  periodButtonTextActive: {
    color: "#FFFFFF",
  },
  detailedLabel: {
    fontSize: 13,
    color: "#777777",
    marginBottom: 8,
    textAlign: "center",
  },
  detailedInput: {
    height: 48,
    borderColor: "#E7ECF3",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#F8FAFD",
    textAlign: "center",
    fontSize: 16,
    color: "#333333",
    fontWeight: "600",
  },
  button: {
    borderRadius: 8,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#707BFB",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
