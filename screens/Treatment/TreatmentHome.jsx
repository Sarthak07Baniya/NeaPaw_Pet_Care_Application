import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchTreatmentTypes,
  setSelectedPet,
  setSelectedService,
  setSelectedTreatmentType,
} from "../../redux/slice/treatmentSlice";

const getTreatmentIcon = (iconName) => {
  const normalized = String(iconName || "").toLowerCase();

  switch (normalized) {
    case "dog":
    case "cat":
    case "paw":
      return "activity";
    case "scissors":
      return "scissors";
    case "heart":
      return "heart";
    case "home":
      return "home";
    case "truck":
      return "truck";
    case "shield":
      return "shield";
    default:
      return "activity";
  }
};

const TreatmentHome = ({ navigation }) => {
  const dispatch = useDispatch();
  const myPets = useSelector((state) => state.myPet.myPets);
  const selectedPet = useSelector((state) => state.treatment.selectedPet);
  const selectedTreatmentType = useSelector(
    (state) => state.treatment.selectedTreatmentType
  );
  const selectedService = useSelector((state) => state.treatment.selectedService);
  const treatmentTypes = useSelector((state) => state.treatment.treatmentTypes);

  const [showPetDropdown, setShowPetDropdown] = useState(false);
  const [showTreatmentDropdown, setShowTreatmentDropdown] = useState(false);

  useEffect(() => {
    dispatch(fetchTreatmentTypes());
  }, [dispatch]);

  const handlePetSelect = (pet) => {
    dispatch(setSelectedPet(pet));
    setShowPetDropdown(false);
  };

  const handleTreatmentTypeSelect = (treatmentType) => {
    dispatch(setSelectedTreatmentType(treatmentType));
    dispatch(setSelectedService(treatmentType));
    setShowTreatmentDropdown(false);
  };

  const handleContinue = () => {
    if (!selectedPet || !selectedTreatmentType || !selectedService) {
      alert("Please select pet and treatment type");
      return;
    }

    navigation.navigate("ServiceBooking");
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Book Treatment</Text>
          <Text style={styles.headerSubtitle}>
            Select your pet and treatment type
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Pet *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowPetDropdown(!showPetDropdown)}
          >
            <Text
              style={
                selectedPet ? styles.dropdownTextSelected : styles.dropdownText
              }
            >
              {selectedPet ? selectedPet.name : "Choose your pet"}
            </Text>
            <Feather
              name={showPetDropdown ? "chevron-up" : "chevron-down"}
              size={20}
              color="#666666"
            />
          </TouchableOpacity>

          {showPetDropdown && (
            <View style={styles.dropdownMenu}>
              {(!myPets || myPets.length === 0) ? (
                <Text style={styles.emptyText}>No pets added yet</Text>
              ) : (
                myPets.map((pet) => (
                  <TouchableOpacity
                    key={pet.id}
                    style={styles.dropdownItem}
                    onPress={() => handlePetSelect(pet)}
                  >
                    <Text style={styles.dropdownItemText}>{pet.name}</Text>
                    {selectedPet?.id === pet.id && (
                      <Feather name="check" size={18} color="#FF6B9D" />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Treatment *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowTreatmentDropdown(!showTreatmentDropdown)}
          >
            <Text
              style={
                selectedTreatmentType
                  ? styles.dropdownTextSelected
                  : styles.dropdownText
              }
            >
              {selectedTreatmentType
                ? selectedTreatmentType.name
                : "Choose treatment type"}
            </Text>
            <Feather
              name={showTreatmentDropdown ? "chevron-up" : "chevron-down"}
              size={20}
              color="#666666"
            />
          </TouchableOpacity>

          {showTreatmentDropdown && (
            <View style={styles.dropdownMenu}>
              {(treatmentTypes || []).map((treatmentType) => (
                <TouchableOpacity
                  key={treatmentType.id}
                  style={styles.dropdownItem}
                  onPress={() => handleTreatmentTypeSelect(treatmentType)}
                >
                  <View style={styles.dropdownItemContent}>
                    <Feather
                      name={getTreatmentIcon(treatmentType.icon)}
                      size={20}
                      color="#FF6B9D"
                    />
                    <View style={styles.dropdownItemInfo}>
                      <Text style={styles.dropdownItemText}>
                        {treatmentType.name}
                      </Text>
                      <Text style={styles.dropdownItemDesc}>
                        {treatmentType.description}
                      </Text>
                    </View>
                  </View>
                  {selectedTreatmentType?.id === treatmentType.id && (
                    <Feather name="check" size={18} color="#FF6B9D" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {selectedTreatmentType && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selected Service</Text>
            <View style={[styles.serviceCard, styles.serviceCardSelected]}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{selectedTreatmentType.name}</Text>
                <Text style={styles.serviceDuration}>
                  {selectedTreatmentType.duration_minutes} mins
                </Text>
              </View>
              <View style={styles.servicePrice}>
                <Text style={styles.priceText}>
                  Rs {selectedTreatmentType.base_price}
                </Text>
                <Feather
                  name="check-circle"
                  size={20}
                  color="#FF6B9D"
                  style={styles.checkIcon}
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {selectedPet && selectedTreatmentType && selectedService && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueText}>Continue</Text>
            <Feather name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default TreatmentHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2C2C2C",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#888888",
  },
  section: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: 12,
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    backgroundColor: "#F8F8F8",
  },
  dropdownText: {
    fontSize: 15,
    color: "#999999",
  },
  dropdownTextSelected: {
    fontSize: 15,
    color: "#2C2C2C",
    fontWeight: "600",
  },
  dropdownMenu: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dropdownItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dropdownItemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  dropdownItemText: {
    fontSize: 15,
    color: "#2C2C2C",
    fontWeight: "500",
  },
  dropdownItemDesc: {
    fontSize: 12,
    color: "#888888",
    marginTop: 2,
  },
  emptyText: {
    padding: 15,
    fontSize: 14,
    color: "#888888",
    textAlign: "center",
  },
  serviceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    backgroundColor: "#F8F8F8",
    marginBottom: 12,
  },
  serviceCardSelected: {
    borderColor: "#FF6B9D",
    backgroundColor: "#FFF5F8",
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: 4,
  },
  serviceDuration: {
    fontSize: 13,
    color: "#888888",
  },
  servicePrice: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF6B9D",
  },
  checkIcon: {
    marginLeft: 8,
  },
  bottomBar: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
  },
  continueButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF6B9D",
    paddingVertical: 16,
    borderRadius: 12,
  },
  continueText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginRight: 8,
  },
});
