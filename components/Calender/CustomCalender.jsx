import { useIsFocused } from "@react-navigation/native";
import moment from "moment";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  Calendar,
  LocaleConfig
} from "react-native-calendars";
import { Ionicons as Icons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedDate } from "../../redux/slice/myPetSlice";

import {
  getAllActivities
} from "../../database/tables/activities";

LocaleConfig.locales["en"] = {
  monthNames: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  monthNamesShort: [
    "Jan.",
    "Feb.",
    "Mar.",
    "Apr.",
    "May",
    "Jun.",
    "Jul.",
    "Aug.",
    "Sep.",
    "Oct.",
    "Nov.",
    "Dec.",
  ],
  dayNames: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};
LocaleConfig.defaultLocale = "en";

const food = { color: "#FC3090" };
const play = { color: "#1DA8B1" };
const sleep = { color: "#2871C8" };
const toilet = { color: "#9B51E0" };
const walk = { color: "#FFA500" };
const vet = { color: "#00BFFF" };
const vaccine = { color: "#8D8DAA" };

const CustomCalendar = () => {
  const dotsData = {
    food: food,
    play: play,
    sleep: sleep,
    toilet: toilet,
    walk: walk,
    vet: vet,
    vaccine: vaccine,
  };
  
  const selectedDate = useSelector(
    (state) => state.myPet.calender.selectedDate
  );
  const loading = useSelector((state) => state.myPet.loading);
  const currentPetId = useSelector((state) => state.myPet.currentPetId);
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const [markedDates, setMarkedDates] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const setSelectedDateHandler = (day) => {
    const newMarkedDates = { ...markedDates };
    Object.keys(newMarkedDates).forEach((key) => {
      if (newMarkedDates[key].selected) {
        newMarkedDates[key].selected = false;
      }
    });
    if (newMarkedDates[day]) {
      newMarkedDates[day].selected = true;
    } else {
      newMarkedDates[day] = {
        selected: true,
        dots: [],
      };
    }
    setMarkedDates(newMarkedDates);
  };

  useEffect(() => {
    if (isFocused) {
      setMarkedDates({});
      const currentDate = moment().format("YYYY-MM-DDTHH:mm:ss");
      const todayDate = moment().format("YYYY-MM-DD");
      
      dispatch(setSelectedDate(currentDate));

      setIsLoading(true);
      getAllActivities(currentPetId)
        .then((activities) => {
          const openingMarkedDates = {};
          openingMarkedDates[todayDate] = {
            selected: true,
            dots: [],
          };
          activities.forEach((activity) => {
            const activityDate = moment(activity.date).format("YYYY-MM-DD");
            
            if (!openingMarkedDates[activityDate]) {
              openingMarkedDates[activityDate] = {
                selected: todayDate === activityDate,
                dots: [dotsData[activity.activityType]],
              };
            } else {
              openingMarkedDates[activityDate] = {
                selected: todayDate === activityDate,
                dots: [
                  ...openingMarkedDates[activityDate].dots,
                  dotsData[activity.activityType],
                ],
              };
            }
          });
          setMarkedDates(openingMarkedDates);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching activities:", err);
          setIsLoading(false);
        });
    }
  }, [isFocused, currentPetId, loading, dispatch]);

  return (
    <View style={styles.calenderContainer}>
      <Calendar
        onDayPress={(day) => {
          const currentTime = moment().format("HH:mm:ss");
          dispatch(setSelectedDate(`${day.dateString}T${currentTime}`));
          setSelectedDateHandler(day.dateString);
        }}
        onDayLongPress={(day) => {
          console.log("selected day", day);
        }}
        monthFormat={"yyyy MM"}
        onMonthChange={(month) => {
          console.log("month changed", month);
        }}
        renderArrow={(direction) => {
          if (direction === "left") {
            return <Icons name="chevron-back-outline" size={24} color="#000" />;
          } else if (direction === "right") {
            return (
              <Icons name="chevron-forward-outline" size={24} color="#000" />
            );
          }
        }}
        hideExtraDays={true}
        disableMonthChange={false}
        firstDay={1}
        hideDayNames={false}
        showWeekNumbers={false}
        onPressArrowLeft={(subtractMonth) => subtractMonth()}
        onPressArrowRight={(addMonth) => addMonth()}
        disableArrowLeft={false}
        disableArrowRight={false}
        disableAllTouchEventsForDisabledDays={true}
        renderHeader={(date) => {
          return (
            <View style={{ flexDirection: "row" }}>
              <Text
                style={{ fontSize: 20, fontWeight: "bold", marginRight: 10 }}
              >
                {new Date(selectedDate)?.getFullYear()}
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  marginRight: isLoading ? 8 : 0,
                }}
              >
                {moment(selectedDate)
                  ?.locale("en")
                  .format("MMMM  DD")
                  .toUpperCase()}
              </Text>
            </View>
          );
        }}
        enableSwipeMonths={true}
        markingType={"multi-dot"}
        markedDates={markedDates}
        displayLoadingIndicator={isLoading}
        theme={{
          backgroundColor: "#ffffff",
          calendarBackground: "#ffffff",
          textSectionTitleColor: "#b6c1cd",
          textSectionTitleDisabledColor: "#d9e1e8",
          selectedDayBackgroundColor: "#E6EDFA",
          selectedDayTextColor: "#007FFF",
          todayTextColor: "#EE7942",
          dayTextColor: "#2d4150",
          textDisabledColor: "#d9e1e8",
          disabledArrowColor: "#d9e1e8",
          monthTextColor: "blue",
          indicatorColor: "blue",
          textDayFontWeight: "300",
          textMonthFontWeight: "bold",
          textDayHeaderFontWeight: "300",
          textDayFontSize: 15,
          textMonthFontSize: 14,
          textDayHeaderFontSize: 14,
        }}
      />
    </View>
  );
};

export default CustomCalendar;

const styles = StyleSheet.create({
  calenderContainer: {
    // height: "100%",
  },
});