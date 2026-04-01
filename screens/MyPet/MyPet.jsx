import { useIsFocused } from "@react-navigation/native";
import moment from "moment";
import { useEffect } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import StatsContainer from "../../components/MainStats/StatsContainer/StatsContainer";
import UpcomingEvents from "../../components/UpcomingEvents/UpcomingEvents";
import ActivityRing from "../../components/ui/charts/ActivityRings/ActivityRing";
import CustomBarChart from "../../components/ui/charts/BarChart/CustomBarChart";
import CustomLineChart from "../../components/ui/charts/LineChart/CustomLineChart";
import CustomStackedBarChart from "../../components/ui/charts/StackedBarChart/CustomStackedBarChart";
import { fetchPets, setId, setSelectedDate } from "../../redux/slice/myPetSlice";

const MyPet = ({ navigation }) => {
  const isFocused = useIsFocused();
  const dispatch = useDispatch();

  const myPets = useSelector((state) => state.myPet.myPets);
  const currentPetId = useSelector((state) => state.myPet.currentPetId);

  useEffect(() => {
    if (isFocused) {
      dispatch(fetchPets());
      const currentDate = moment().format("YYYY-MM-DDTHH:mm:ss");
      dispatch(setSelectedDate(currentDate));
    }
  }, [isFocused, dispatch]);

  useEffect(() => {
    if (myPets.length > 0 && !currentPetId) {
      // Set first pet as default if none selected
      dispatch(setId({ id: myPets[0].id, data: myPets[0] }));
    }
  }, [myPets, currentPetId, dispatch]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      style={styles.myPetContainer}
    >
      <Text style={styles.headerText}>TODAY</Text>
      <StatsContainer />
      <UpcomingEvents navigation={navigation} />
      <ActivityRing />
      <CustomBarChart title="Weight History" />
      <CustomBarChart title="Vet Appoitments" />
      <CustomLineChart />
      <CustomStackedBarChart />
    </ScrollView>
  );
};

export default MyPet;

const styles = StyleSheet.create({
  myPetContainer: {
    backgroundColor: "#FFFFFF",
    flex: 1,
  },
  headerText: {
    fontSize: 15,
    color: "#434343",
    fontWeight: "bold",
    width: "100%",
    marginTop: "1%",
    marginBottom: "3%",
    paddingHorizontal: "5%",
  },
});
