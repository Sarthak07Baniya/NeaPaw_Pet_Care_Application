import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Utility: Calculate brightness of a hex color
const hexToBrightness = (hex) => {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  // Formula for perceived brightness
  return (r * 299 + g * 587 + b * 114) / 1000;
};

// Choose black or white text based on gradient average brightness
const getTextColorFromGradient = (colors) => {
  const brightnessAvg =
    colors.reduce((sum, c) => sum + hexToBrightness(c), 0) / colors.length;
  return brightnessAvg > 180 ? "#2C2C2C" : "#FFF";
};

const ServiceCard = ({
  title,
  description,
  icon,
  iconType,
  colors = ["#FF6B9D", "#C44569"],
  onPress,
}) => {
  const IconComponent = iconType === "Ionicons" ? Ionicons : Feather;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      speed: 20,
      bounciness: 6,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      speed: 20,
      bounciness: 6,
      useNativeDriver: true,
    }).start();
  };

  const textColor = getTextColorFromGradient(colors);

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.wrapper}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: "rgba(255,255,255,0.25)" },
            ]}
          >
            <IconComponent name={icon} size={26} color={textColor} />
          </View>

          <View>
            <Text style={[styles.title, { color: textColor }]}>{title}</Text>
            <Text
              style={[styles.description, { color: textColor }]}
              numberOfLines={2}
            >
              {description}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default ServiceCard;

const styles = StyleSheet.create({
  wrapper: {
    width: "48%",
    marginBottom: 16,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    minHeight: 125,
    justifyContent: "space-between",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    opacity: 0.9,
    lineHeight: 16,
  },
});
