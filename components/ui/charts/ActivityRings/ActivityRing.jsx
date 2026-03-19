import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useIsFocused } from "@react-navigation/native";
import { useSelector } from "react-redux";
import moment from "moment";

import { getActivitiesForADate } from "../../../../database/tables/activities";

const DEFAULT_ACTIVITY_DATA = [
  {
    label: "Food",
    value: 0,
    color: "#FC3090",
  },
  {
    label: "Play",
    value: 0,
    color: "#1DA8B1",
  },
  {
    label: "Sleep",
    value: 0,
    color: "#2871C8",
  },
  {
    label: "Toilet",
    value: 0,
    color: "#9B51E0",
  },
  {
    label: "Walk",
    value: 0,
    color: "#FFA500",
  },
];

const ActivityRing = () => {
  const currentPetId = useSelector((state) => state.myPet.currentPetId);
  const isFocused = useIsFocused();
  const [activityData, setActivityData] = useState(DEFAULT_ACTIVITY_DATA);

  const activityNameConverter = (activityName) => {
    switch (activityName) {
      case "walk":
        return "Walk";
      case "food":
        return "Food";
      case "sleep":
        return "Sleep";
      case "play":
        return "Play";
      case "toilet":
        return "Toilet";
      default:
        return "";
    }
  };

  useEffect(() => {
    if (!isFocused || !currentPetId) return;

    const currentDate = moment().format("YYYY-MM-DDTHH:mm:ss");

    getActivitiesForADate(currentPetId, currentDate)
      .then((activities) => {
        const data = DEFAULT_ACTIVITY_DATA.map((item) => ({ ...item }));
        const values = new Array(data.length).fill(0);

        activities.forEach((activity) => {
          const name = activityNameConverter(activity.activityType);
          const index = data.findIndex((item) => item.label === name);

          if (index !== -1) {
            values[index] += 1;
          }
        });

        const total = values.reduce((sum, value) => sum + value, 0);

        const normalizedData = data.map((item, index) => ({
          ...item,
          value: total > 0 ? values[index] / total : 0,
        }));

        setActivityData(normalizedData);
      })
      .catch((error) => {
        console.log(error);
        setActivityData(DEFAULT_ACTIVITY_DATA);
      });
  }, [currentPetId, isFocused]);

  const totalPercent = Math.round(
    activityData.reduce((sum, item) => sum + item.value, 0) * 100
  );

  return (
    <View style={styles.ringContainer}>
      <LinearGradient
        colors={["#FAFAFA", "#FFFFFF"]}
        style={styles.ringInnerContainer}
      >
        <View style={styles.textContainer}>
          <Text style={styles.headerText}>Activity Distribution</Text>
          <Text style={styles.headerSmallText}>Daily</Text>
        </View>

        <View style={styles.chartContainer}>
          <View style={styles.progressTrack}>
            {activityData.map((item) => (
              <View
                key={item.label}
                style={[
                  styles.progressSegment,
                  {
                    backgroundColor: item.color,
                    flex: item.value > 0 ? item.value : 0,
                  },
                ]}
              />
            ))}
          </View>

          <Text style={styles.summaryText}>
            {totalPercent > 0 ? `${totalPercent}% tracked today` : "No activity recorded yet"}
          </Text>
        </View>

        <View style={styles.legendContainer}>
          {activityData.map((item) => (
            <View key={item.label} style={styles.legendRow}>
              <View
                style={[styles.legendDot, { backgroundColor: item.color }]}
              />
              <Text style={styles.legendLabel}>{item.label}</Text>
              <Text style={styles.legendValue}>
                {Math.round(item.value * 100)}%
              </Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </View>
  );
};

export default ActivityRing;

const styles = StyleSheet.create({
  ringContainer: {},
  ringInnerContainer: {
    width: "90%",
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    marginTop: 13,
    borderWidth: 3,
    borderColor: "#EAEFF5",
    borderRadius: 12,
  },
  textContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    width: "100%",
    marginBottom: 12,
  },
  headerText: {
    color: "#434343",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 5,
  },
  headerSmallText: {
    color: "#AAAAAA",
    fontSize: 14,
    fontWeight: "500",
    top: -2,
  },
  chartContainer: {
    width: "100%",
    marginBottom: 14,
  },
  progressTrack: {
    width: "100%",
    height: 18,
    backgroundColor: "#EEF2F7",
    borderRadius: 999,
    overflow: "hidden",
    flexDirection: "row",
  },
  progressSegment: {
    height: "100%",
  },
  summaryText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 13,
    marginTop: 10,
    fontWeight: "500",
  },
  legendContainer: {
    width: "100%",
    gap: 8,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendLabel: {
    flex: 1,
    color: "#434343",
    fontSize: 14,
  },
  legendValue: {
    color: "#7D7D7D",
    fontSize: 13,
    fontWeight: "600",
  },
});
