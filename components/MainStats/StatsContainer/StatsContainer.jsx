import { StyleSheet, Text, View } from "react-native";
import React, { useState, useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import StatsBox from "../StatsBox/StatsBox";
import { useSelector } from "react-redux";
import { getActivitiesForADate } from "../../../database/tables/activities";
import { getAllWeightbyPetId } from "../../../database/tables/weight";
import moment from "moment";

const toNumber = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const getDurationInHours = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;

  const startParts = String(startTime).split(":").map(Number);
  const endParts = String(endTime).split(":").map(Number);

  if (startParts.some((part) => !Number.isFinite(part))) return 0;
  if (endParts.some((part) => !Number.isFinite(part))) return 0;

  const startTotalMinutes = (startParts[0] || 0) * 60 + (startParts[1] || 0);
  const endTotalMinutes = (endParts[0] || 0) * 60 + (endParts[1] || 0);
  const diffInMinutes = endTotalMinutes - startTotalMinutes;

  return diffInMinutes > 0 ? Number((diffInMinutes / 60).toFixed(1)) : 0;
};

const StatsContainer = () => {
  const selectedDate = useSelector(
    (state) => state.myPet.calender.selectedDate
  );
  const currentPetId = useSelector((state) => state.myPet.currentPetId);
  const isFocused = useIsFocused();

  const [walk = 0, setWalk] = useState(0);
  const [weight = 0, setWeight] = useState(0);
  const [sleep = 0, setSleep] = useState(0);
  const [play = 0, setPlay] = useState(0);
  const [toilet = 0, setToilet] = useState(0);
  const [calorie = 0, setCalorie] = useState(0);

  useEffect(() => {
    setWalk(0);
    setWeight(0);
    setSleep(0);
    setPlay(0);
    setToilet(0);
    setCalorie(0);
    if (isFocused && currentPetId) {
      const targetDate = selectedDate || moment().toISOString();
      getActivitiesForADate(currentPetId, targetDate)
        .then((activities) => {
          let calorieData = 0;
          let walkMeters = 0;
          let sleepHours = 0;
          let playHours = 0;
          let toiletHours = 0;
          activities.forEach((activity) => {
            if (activity.activityType === "walk") {
              walkMeters += toNumber(activity.meter);
            } else if (activity.activityType === "sleep") {
              const endTimeClock = activity.endTime.split(":");
              const startTimeClock = activity.startTime.split(":");
              const endTime = +endTimeClock[0];
              const startTime = +startTimeClock[0];
              const diff = endTime - startTime;
              sleepHours += diff;
            } else if (activity.activityType === "food") {
              calorieData += toNumber(activity.calorie);
            } else if (activity.activityType === "play") {
              playHours += getDurationInHours(
                activity.startTime,
                activity.endTime
              );
            } else if (activity.activityType === "toilet") {
              toiletHours += getDurationInHours(
                activity.startTime,
                activity.endTime
              );
            }
          });
          setCalorie(calorieData);
          setWalk(walkMeters);
          setSleep(sleepHours);
          setPlay(playHours);
          setToilet(toiletHours);
        })
        .catch((err) => {
          console.log(err);
        });

      getAllWeightbyPetId(currentPetId)
        .then((weightData) => {
          if (weightData.length > 0) {
            weightData.sort((a, b) => {
              return new Date(a.date) - new Date(b.date);
            });
            const lastWeight = weightData[weightData.length - 1];
            setWeight(toNumber(lastWeight.weight));
          } else if (weightData.length === 0) {
            setWeight(0);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [isFocused, currentPetId, selectedDate]);

  return (
    <View style={styles.statsContainer}>
      <StatsBox
        backgroundC="#FEE8DC"
        textC="#EE7942"
        activity="Walk"
        data={walk}
        small="m"
      />
      <StatsBox
        backgroundC="#FFEFF1"
        textC="#FD5B71"
        activity="Calories"
        data={calorie}
        small="cal"
      />
      <StatsBox
        backgroundC="#E6EDFA"
        textC="#2871C8"
        activity="Sleep"
        data={sleep}
        small="h"
      />
      <StatsBox
        backgroundC="#E6FCF4"
        textC="#1DA8B1"
        activity="Play"
        data={play}
        small="h"
      />
      <StatsBox
        backgroundC="#F5EEFC"
        textC="#9B51E0"
        activity="Toilet"
        data={toilet}
        small="h"
      />
      <StatsBox
        backgroundC="#F3F4F6"
        textC="#6B7280"
        activity="Weight"
        data={weight}
        small="kg"
      />
    </View>
  );
};

export default StatsContainer;

const styles = StyleSheet.create({
  statsContainer: {
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
});


