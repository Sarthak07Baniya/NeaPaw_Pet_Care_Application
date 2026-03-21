import moment from "moment";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import catImage from "../../../assets/emptyPetImages/cat.png";
import dogImage from "../../../assets/emptyPetImages/dog.png";
import { setSelectedDate } from "../../../redux/slice/myPetSlice";
import { resolveMediaUrl } from "../../../services/api";

import { setId } from "../../../redux/slice/myPetSlice";

export const CustomMainHeaderLeft = ({ isNameVisible }) => {
  const dispatch = useDispatch();
  const currentPetInfo = useSelector((state) => state.myPet.currentPetInfo) || {};
  const myPets = useSelector((state) => state.myPet.myPets) || [];
  const currentPetId = useSelector((state) => state.myPet.currentPetId);
  const hasPets = myPets.length > 0;
  const petName = currentPetInfo?.name || "My Pet";
  const petBreed = currentPetInfo?.breed || (hasPets ? "Pet Profile" : "No pet added");
  const petSpecies = (currentPetInfo?.spicie || "").toLowerCase();
  const petPhoto = resolveMediaUrl(currentPetInfo?.photoURL || currentPetInfo?.photo || currentPetInfo?.image);

  const petChangeHandler = () => {
    if (myPets.length >= 2) {
      // swap the current pet
      dispatch(
        setId({
          id: currentPetId === myPets[0].id ? myPets[1].id : myPets[0].id,
          data: currentPetId === myPets[0].id ? myPets[1] : myPets[0],
        })
      );
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.leftContainer}
      onPress={hasPets ? petChangeHandler : undefined}
    >
      <View style={styles.imageContainer}>
        {petPhoto ? (
          <Image
            source={{ uri: petPhoto }}
            style={styles.image}
          />
        ) : (
          <Image
            style={styles.image}
            source={petSpecies === "dog" ? dogImage : catImage}
          />
        )}
      </View>
      {isNameVisible && (
        <View style={styles.leftTextContainer}>
          <Text style={styles.spicie}>{petBreed}</Text>
          <Text style={styles.name} numberOfLines={1}>{petName}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export const CustomMainHeaderRight = ({ navigation }) => {
  const currentDay = moment().format("ddd");
  const currentDayNumber = moment().format("D");
  const date = new Date().toISOString();
  const currentDate = moment(date).format("YYYY-MM-DDTHH:mm:ss");
  const dispatch = useDispatch();

  const pressHandler = () => {
    dispatch(setSelectedDate(currentDate));
    //console.log(currentDate);

    // navigation.navigate("ActivitiesMain", {
    //   screen: "NewActivity",
    // });

    // "Activities", "NewActivity";

    navigation.navigate("Activities", {
      screen: "ActivitiesMain",
      params: {
        redirectToNewActivity: true,
      },
    });
  };

  return (
    <View style={styles.rightContainer}>
      <TouchableOpacity
        style={styles.rightDateContainer}
        activeOpacity={0.7}
        onPress={pressHandler}
      >
        <Text style={styles.date}>{currentDayNumber}</Text>
        <Text style={styles.day}>{currentDay}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  rightContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  rightDateContainer: {
    right: 20,
    width: 55,
    height: 55,
    borderRadius: 12,
    borderColor: "#EAEFF5",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  date: {
    color: "#434343",
    fontWeight: "bold",
    fontSize: 25,
  },
  day: {
    color: "#9CA9B9",
    fontSize: 13,
  },
  leftContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    left:3,
  },
  imageContainer: {
    // left: 20,
    width: 70,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30 / 2,
    borderColor: "#EAEFF3",
    borderWidth: 2,
  },
  leftTextContainer: {
    // left: Platform.OS === "android" ? 5 : 25,
    height: "59%",
    justifyContent: "center",
    alignItems: "flex-start",
    flexDirection: "column",
  },
  spicie: {
    fontSize: 12,
    color: "#7D7D7D",
  },
  name: {
    fontWeight: "bold",
    fontSize: 35,
    color: "#1E1E1E",
  },
});
