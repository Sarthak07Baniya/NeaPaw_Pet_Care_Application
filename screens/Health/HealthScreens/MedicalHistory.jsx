import { Ionicons as Icons } from "@expo/vector-icons";
import moment from "moment";
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
import { useSelector } from "react-redux";

import { petService } from "../../../services/petService";
import CustomLineChart from "../../../components/ui/charts/LineChart/CustomLineChart";

const MedicalHistory = () => {
  const [medicalData, setMedicalData] = useState([]);
  const isFocused = useIsFocused();
  const currentPetId = useSelector((state) => state.myPet.currentPetId);

  useEffect(() => {
    if (isFocused) {
      loadMedicalHistory();
    }
  }, [isFocused, currentPetId]);

  const loadMedicalHistory = () => {
    petService
      .getMedicalRecords(currentPetId)
      .then((records) => {
        const validRecords = records.filter((item) =>
          moment(item.date, [moment.ISO_8601, "YYYY-MM-DD", "YYYY/MM/DD"], true).isValid()
        );
        const sortedRecords = [...validRecords].sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });

        const data = sortedRecords.map((item) => ({
          id: item.id,
          month: moment(item.date).format("MMM"),
          date: moment(item.date).format("Do dddd"),
          condition: item.condition || "Medical record",
          treatment: item.treatment || item.note || "",
        }));

        setMedicalData(data.reverse());
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const onLongPressButton = (id) => {
    Alert.alert(
      "Delete Medical Record",
      "Are you sure you want to delete this medical record?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "DELETE",
          onPress: () => {
            petService
              .deleteMedicalRecord(id)
              .then(() => {
                setMedicalData((current) =>
                  current.filter((item) => item.id !== id)
                );
              })
              .catch((err) => {
                console.log(err);
                Alert.alert("Error", "Could not delete medical record");
              });
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Pet Medical History</Text>
      <CustomLineChart title="Medical History Stats" />
      <FlatList
        data={medicalData}
        contentContainerStyle={styles.listContent}
        style={styles.flatList}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableHighlight
            onLongPress={() => onLongPressButton(item.id)}
            underlayColor="#FAFAFA"
            style={styles.touchable}
          >
            <View style={styles.listItemContainer}>
              <View style={styles.iconContainer}>
                <Icons name="medkit-outline" size={20} color="#ffffff" />
              </View>
              <View style={styles.infoContainer}>
                <View style={styles.monthContainer}>
                  <Text style={styles.monthText}>{item.month}</Text>
                  <Text style={styles.dateText}>{item.date}</Text>
                </View>
                <Text style={styles.primaryText}>{item.condition}</Text>
                {!!item.treatment && (
                  <Text style={styles.secondaryText}>{item.treatment}</Text>
                )}
              </View>
            </View>
          </TouchableHighlight>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No medical records yet.</Text>
        }
      />
    </View>
  );
};

export default MedicalHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerText: {
    fontSize: 18,
    color: "#7D7D7D",
    textAlign: "center",
    fontWeight: "500",
    marginTop: 12,
  },
  flatList: {
    marginTop: 15,
    paddingHorizontal: 5,
    width: "100%",
  },
  listContent: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
  touchable: {
    width: "100%",
  },
  listItemContainer: {
    marginBottom: 8,
    width: "90%",
    minWidth: "90%",
    minHeight: 72,
    borderRadius: 12,
    borderTopWidth: 2,
    borderRightWidth: 3,
    borderBottomWidth: 2,
    borderLeftWidth: 3,
    borderLeftColor: "#E76F51",
    borderRightColor: "#E76F51",
    borderTopColor: "#F8F8F8",
    borderBottomColor: "#F8F8F8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E76F51",
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
  },
  monthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  monthText: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "bold",
    marginRight: 5,
  },
  dateText: {
    fontSize: 14,
    color: "#4F4F4F",
  },
  primaryText: {
    fontSize: 16,
    color: "#2D2D2D",
    fontWeight: "500",
  },
  secondaryText: {
    marginTop: 2,
    fontSize: 13,
    color: "#828282",
  },
  emptyText: {
    marginTop: 30,
    color: "#999999",
    fontSize: 15,
  },
});
