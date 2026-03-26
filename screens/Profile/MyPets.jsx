import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchPets } from "../../redux/slice/myPetSlice";
import { resolveMediaUrl } from "../../services/api";

const getPetType = (pet) => {
  const value = pet?.spicie || pet?.species || pet?.pet_type || "";
  if (!value) return "Not set";
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
};

const getPetName = (pet) => pet?.name || pet?.pet_name || "Unnamed Pet";

const getOwnerName = (pet, fallbackOwnerName) =>
  pet?.ownerName ||
  pet?.owner_name ||
  pet?.user_name ||
  fallbackOwnerName ||
  "Pet Parent";

const formatValue = (value, fallback = "Not set") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return String(value);
};

const formatWeight = (pet) => {
  const value = pet?.weight;
  if (value === null || value === undefined || value === "") {
    return "Not set";
  }
  return `${value} kg`;
};

const MyPets = () => {
  const dispatch = useDispatch();
  const myPets = useSelector((state) => state.myPet.myPets) || [];
  const savedOwnerName = useSelector((state) => state.myPet.currentPetInfo?.ownerName);

  useFocusEffect(
    useCallback(() => {
      if (!myPets.length) {
        dispatch(fetchPets());
      }
    }, [dispatch, myPets.length])
  );

  const renderPet = ({ item }) => {
    const imageUri = resolveMediaUrl(item.photoURL || item.photo || item.image);

    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.imageWrap}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.petImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Feather name="heart" size={28} color="#FF6B9D" />
              </View>
            )}
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={styles.petName}>{getPetName(item)}</Text>
            <Text style={styles.petType}>{getPetType(item)}</Text>
          </View>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Breed</Text>
            <Text style={styles.detailValue}>{formatValue(item?.breed)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Gender</Text>
            <Text style={styles.detailValue}>{formatValue(item?.gender)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Weight</Text>
            <Text style={styles.detailValue}>{formatWeight(item)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Owner Name</Text>
            <Text style={styles.detailValue}>{getOwnerName(item, savedOwnerName)}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={myPets}
      keyExtractor={(item, index) => String(item?.id ?? index)}
      renderItem={renderPet}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Feather name="heart" size={56} color="#D6D6D6" />
          <Text style={styles.emptyTitle}>No pets added yet</Text>
          <Text style={styles.emptySubtitle}>
            Your added pets will show here with their details.
          </Text>
        </View>
      }
    />
  );
};

export default MyPets;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  imageWrap: {
    width: 68,
    height: 68,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#FFF1F6",
    marginRight: 14,
  },
  petImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextWrap: {
    flex: 1,
  },
  petName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C2C2C",
    marginBottom: 4,
  },
  petType: {
    fontSize: 14,
    color: "#777777",
    fontWeight: "500",
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  detailItem: {
    width: "48%",
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    padding: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: "#888888",
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C2C2C",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C2C2C",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#777777",
    textAlign: "center",
    lineHeight: 22,
  },
});
