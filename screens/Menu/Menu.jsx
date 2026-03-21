import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import moment from "moment";
import { useEffect } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import catImage from "../../assets/emptyPetImages/cat.png";
import dogImage from "../../assets/emptyPetImages/dog.png";
import profile from "../../assets/images/profile.png";
import { deleteAPet } from "../../database/tables/myPet";
import { logoutSuccess } from "../../redux/slice/authSlice";
import {
  removePetFromMyPetArray,
  resetEverything,
  resetPetInfo,
  setPetData
} from "../../redux/slice/myPetSlice";
import { authService } from "../../services/authService";
import { resolveMediaUrl } from "../../services/api";

const Menu = ({ navigation }) => {
  const dispatch = useDispatch();
  const myPets = useSelector((state) => state.myPet.myPets);
  const currentPetInfo = useSelector((state) => state.myPet.currentPetInfo);
  const currentPetId = useSelector((state) => state.myPet.currentPetId);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      //find the current pet inside the myPets array
      const currentPet = myPets.find((pet) => pet.id === currentPetId);
      //if the current pet is found, set the currentPetInfo to the current pet
      if (currentPet) {
        dispatch(setPetData(currentPet));
      }
    }
  }, [isFocused, currentPetId]);

  const calculateYearOldwithMonth = (birthdate) => {
    let yearOld = 0;
    const birthdateWithMonth = moment(birthdate, "YYYY-MM-DD");
    const currentDateWithMonth = moment();
    const diff = currentDateWithMonth.diff(birthdateWithMonth, "months");
    yearOld = diff / 12;
    const birthdateWithDay = moment(birthdate, "YYYY-MM-DD");
    const currentDateWithDay = moment();
    const diffDay = currentDateWithDay.diff(birthdateWithDay, "days");
    if (diffDay < 40) {
      return diffDay + " days";
    }
    if (yearOld < 1) {
      return `${Math.round(yearOld * 12)} months`;
    } else if (yearOld >= 1) {
      return `${Math.round(yearOld)} years`;
    }
  };

  const petDeleteHandler = (id) => {
    Alert.alert(
      "Ohoii Boiiii",
      `You are about to delete ${currentPetInfo.name}. 
        Are you sure?`,
      [
        {
          text: "Cancel",
          onPress: () => {},
        },
        {
          text: "Delete",
          onPress: () => {
            deleteAPet(id)
              .then(() => {
                if (myPets.length === 2) {
                  const otherPet = myPets.find((pet) => pet.id !== id);
                  dispatch(setPetData(otherPet));
                  dispatch(removePetFromMyPetArray(id));
                  navigation.navigate("bottomNavStack", {
                    screen: "My Pet",
                  });
                } else {
                  dispatch(resetEverything());
                  navigation.navigate("startStack", {
                    screen: "Welcome",
                  });
                }
              })
              .catch((err) => {
                console.log(err);
              });
          },
        },
      ],
      { cancelable: false }
    );
  };

  // const deleteEverything = () => {
  //   Alert.alert(
  //     "Wait a minute",
  //     `You are about to delete everything.
  //       Are you sure?`,
  //     [
  //       {
  //         text: "Cancel",
  //         onPress: () => {},
  //       },
  //       {
  //         text: "Delete All",
  //         onPress: () => {
  //           dropDatabase()
  //             .then(() => {
  //               dispatch(resetEverything());
  //               dbInit()
  //                 .then(() => {})
  //                 .catch((err) => {
  //                   console.log(err);
  //                 });
  //             })
  //             .catch((err) => {
  //               console.log(err);
  //             });
  //         },
  //       },
  //     ],
  //     { cancelable: false }
  //   );
  // };

  const addNewPet = () => {
    dispatch(resetPetInfo());
    navigation.navigate("startStack", {
      screen: "PetSpicie",
      params: {
        hasBack: true,
      },
    });
  };

  return (
    <ScrollView style={styles.menuContainer}>
      <View style={styles.profileContainer}>
        <View style={styles.profileImageContainer}>
          <Image source={profile} style={styles.profile} />
        </View>
        <Text style={styles.profileText}>{currentPetInfo.ownerName}</Text>
      </View>
      <View style={styles.petControlContainer}>
        {myPets.map((pet, index) => {
          return (
            <View
              key={pet.id}
              style={[
                styles.pet,
                {
                  borderColor:
                    pet.gender === "male"
                      ? "#E6EAF2"
                      : pet.gender === "female"
                      ? "rgba(247, 143, 143, 0.25)"
                      : "#EAEFF5",
                },
              ]}
            >
              <View style={styles.petImageContainer}>
                {resolveMediaUrl(pet.photoURL || pet.photo || pet.image) ? (
                  <Image
                    source={{ uri: resolveMediaUrl(pet.photoURL || pet.photo || pet.image) }}
                    style={styles.petImage}
                  />
                ) : (
                  <Image
                    source={pet.spicie === "dog" ? dogImage : catImage}
                    style={styles.petImage}
                  />
                )}
              </View>
              <View style={styles.petInfoContainer}>
                <Text style={styles.petName}>{pet.name}</Text>
                <Text style={styles.petAge}>
                  {calculateYearOldwithMonth(pet.birthDate)}
                </Text>
                <Text style={styles.petBreed}>{pet.breed}</Text>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.deleteButton}
                  onPress={() => {
                    petDeleteHandler(pet.id);
                  }}
                >
                  <Text style={styles.buttonText}>DELETE</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        {myPets.length === 1 && (
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.pet}
            onPress={addNewPet}
          >
            <View style={styles.petImageContainer}>
              <View style={styles.emptypetImage}>
                <Ionicons name={"add-circle-outline"} size={55} color={"#EAEFF5"} />
              </View>
            </View>
            <View style={styles.petInfoContainer}>
              <Text style={styles.petAge}>Add New Pet</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.bottomButtonContainers}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.logoutButton}
          onPress={async () => {
            Alert.alert(
              "Logout",
              "Are you sure you want to logout?",
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Logout", 
                  style: "destructive",
                  onPress: async () => {
                    await authService.logout();
                    dispatch(logoutSuccess());
                    dispatch(resetEverything());
                  }
                }
              ]
            );
          }}
        >
          <Ionicons
            name={"log-out-outline"}
            size={24}
            color={"#FFFFFF"}
          />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Menu;

const styles = StyleSheet.create({
  menuContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  abotUsContainer: {
    flexDirection: "column",
    width: "100%",
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
  },
  abotUsIconContainer: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  aboutUsText: {
    marginTop: 0,
    fontSize: 12,
    fontWeight: "bold",
    color: "#7D7D7D",
  },
  profileContainer: {
    paddingHorizontal: 12,
    marginTop: 0,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    padding: 20,
  },
  profileText: {
    fontSize: 22,
    color: "black",
    fontWeight: "500",
    textAlign: "center",
    marginTop: 6,
  },
  profileImageContainer: {
    height: 130,
    width: 130,
    borderRadius: 130 / 2,
    borderWidth: 3.1,
    borderColor: "#FFD9C4",
    backgroundColor: "#FEE8DC",
  },
  profile: {
    flex: 1,
    height: null,
    width: null,
    resizeMode: "contain",
    borderRadius: 130 / 2,
  },
  petControlContainer: {
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  pet: {
    height: 200,
    width: "45%",
    borderColor: "#EAEFF5",
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  petImageContainer: {
    height: 80,
    width: 80,
    borderRadius: 10,
    marginBottom: 5,
  },
  petImage: {
    flex: 1,
    height: null,
    width: null,
    resizeMode: "contain",
    borderRadius: 15,
  },
  petInfoContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  petName: {
    fontSize: 20,
    color: "#434343",
    fontWeight: "600",
  },
  petAge: {
    fontSize: 13,
    color: "#7D7D7D",
    fontWeight: "400",
  },
  petBreed: {
    fontSize: 13,
    color: "#4F4F4F",
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  deleteButton: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#FF8271",
  },
  buttonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  emptypetImage: {
    height: 80,
    width: 80,
    borderStyle: "dashed",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#D6DCE3",
    alignItems: "center",
    justifyContent: "center",
    top: -13,
  },
  logoutButton: {
    marginTop: 20,
    height: 50,
    width: "90%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    paddingHorizontal: 20,
    marginBottom: 40,
    shadowColor: "#FF6B6B",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  logoutText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 10,
  },
});
