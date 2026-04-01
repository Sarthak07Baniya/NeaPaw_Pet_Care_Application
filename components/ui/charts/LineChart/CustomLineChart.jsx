import { StyleSheet, Text, View, Dimensions } from "react-native";
import React, { useState, useEffect } from "react";
import { LineChart } from "react-native-chart-kit";
import { useSelector } from "react-redux";
import moment from "moment";
import { useIsFocused } from "@react-navigation/native";
import { getAllMedicalbyPetId } from "../../../../database/tables/medical";
import { petService } from "../../../../services/petService";

const getLastSixMonthLabels = () => {
  const lastSixMonths = [];
  for (let i = 0; i < 6; i++) {
    lastSixMonths.push(moment().subtract(i, "month").format("MMM"));
  }
  return lastSixMonths.reverse();
};

const CustomLineChart = ({ title }) => {
  const screenWidth = Dimensions.get("window").width * 0.8;
  const isFocused = useIsFocused();
  const [data, setData] = React.useState([0, 0, 0, 0, 0, 0]);
  const [dataLabels, setDataLabels] = useState(getLastSixMonthLabels());
  const currentPetId = useSelector((state) => state.myPet.currentPetId);

  useEffect(() => {
    setData([0, 0, 0, 0, 0, 0]);
    const lastSixMonths = getLastSixMonthLabels();
    setDataLabels(lastSixMonths);

    if (!isFocused || !currentPetId) {
      return;
    }

    const loadChartData =
      title === "Medical History Stats"
        ? getAllMedicalbyPetId(currentPetId)
        : petService.getVaccines(currentPetId);

    loadChartData
      .then((res) => {
        const allMontData = [0, 0, 0, 0, 0, 0];
        res.forEach((element) => {
          const parsedDate = moment(
            element.date,
            [moment.ISO_8601, "YYYY-MM-DD", "YYYY/MM/DD"],
            true
          );
          if (!parsedDate.isValid()) {
            return;
          }
          const date = parsedDate.format("MMM");
          const index = lastSixMonths.indexOf(date);
          if (index !== -1) {
            allMontData[index]++;
          }
        });
        setData(allMontData);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [isFocused, currentPetId]);

  return (
    <View style={styles.barContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.headerText}>
          {title || "Vaccine History Stats"}
        </Text>
        <Text style={styles.headerSmallText}>Last 6 Months</Text>
      </View>
      <LineChart
        // style={graphStyle}
        bezier={true}
        bezierCurve={1}
        data={{
          labels: dataLabels,
          datasets: [
            {
              data: data,
              color: (opacity = 1) =>
                title === "Medical History Stats" ? `#E76F51` : `#FD5B71`,
              strokeWidth: 2, // optional
            },
          ],
        }}
        width={screenWidth}
        height={168}
        // yAxisLabel="$"
        // yAxisSuffix="k"
        chartConfig={{
          backgroundGradientFrom: "#FFFFFF",
          backgroundGradientFromOpacity: 0,
          backgroundGradientTo: "#FFFFFF",
          backgroundGradientToOpacity: 0.5,
          color: (opacity = 1) => `#7D7D7D`,
          strokeWidth: 2, // optional, default 3
          barPercentage: 0.5,
          useShadowColorFromDataset: false, // optional
          fillShadowGradientFrom:
            title === "Medical History Stats" ? "#E76F51" : "#FD5B71",
          fillShadowGradientTo:
            title === "Medical History Stats" ? "#FFF3EF" : "#FFF1F3",
          fillShadowGradientFromOpacity: 0.8,
          fillShadowGradientFromOffset: 1,
          fillShadowGradientToOffset: 0.1,
          barRadius: 5,
        }}
        withHorizontalLabels={true}
        withInnerLines={true}
        showBarTops={false}
        flatColor={true}
        fromZero={true}
        withCustomBarColorFromData={true}
        showValuesOnTopOfBars={true}
        style={{
          marginLeft: -20,
          marginTop: 10,
        }}
      />
    </View>
  );
};

export default CustomLineChart;

const styles = StyleSheet.create({
  barContainer: {
    width: "90%",
    alignSelf: "center",
    paddingHorizontal: 5,
    paddingVertical: 10,
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
    width: "80%",
    right: "8%",
    marginBottom: 2,
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
});
