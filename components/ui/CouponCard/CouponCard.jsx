import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CouponCard = ({ coupon, onApply, isApplied }) => {
  if (!coupon) return null;

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.badge}>
          <Feather name="tag" size={16} color="#FF6B9D" />
        </View>
        <View style={styles.content}>
          <Text style={styles.code}>{coupon.code}</Text>
          <Text style={styles.description}>
            {coupon.description || `${coupon.discount}% discount`}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        disabled={isApplied}
        style={[styles.button, isApplied && styles.buttonApplied]}
        onPress={() => onApply?.(coupon)}
      >
        <Text style={[styles.buttonText, isApplied && styles.buttonTextApplied]}>
          {isApplied ? "Applied" : "Apply"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CouponCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0D7E3",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF0F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  code: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2C2C2C",
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: "#666666",
  },
  button: {
    backgroundColor: "#FF6B9D",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  buttonApplied: {
    backgroundColor: "#E8F5E9",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
  buttonTextApplied: {
    color: "#4CAF50",
  },
});
