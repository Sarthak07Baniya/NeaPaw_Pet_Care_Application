import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const Ionicons = ({ name, size, color }) => {
  const iconMap = {
    home: "🏠",
    "home-outline": "🏠",
    paw: "🐾",
    "paw-outline": "🐾",
    time: "⏰",
    "time-outline": "⏰",
    fitness: "💪",
    "fitness-outline": "💪",
    grid: "☰",
    "grid-outline": "☰",
  };

  return (
    <Text style={{ fontSize: size || 24, color: color || "#000" }}>
      {iconMap[name] || "•"}
    </Text>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.bottomBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={index}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={isFocused ? styles.activeButton : styles.button}
          >
            <View style={styles.icon}>
              {label === "Home" ? (
                <Ionicons
                  name={isFocused ? "home" : "home-outline"}
                  size={25}
                  color={isFocused ? "#EE7942" : "#222"}
                />
              ) : label === "My Pet" ? (
                <Ionicons
                  name={isFocused ? "paw" : "paw-outline"}
                  size={25}
                  color={isFocused ? "#EE7942" : "#222"}
                />
              ) : label === "Activities" ? (
                <Ionicons
                  name={isFocused ? "time" : "time-outline"}
                  size={25}
                  color={isFocused ? "#EE7942" : "#222"}
                />
              ) : label === "Health" ? (
                <Ionicons
                  name={isFocused ? "fitness" : "fitness-outline"}
                  size={25}
                  color={isFocused ? "#EE7942" : "#222"}
                />
              ) : label === "Menu" ? (
                <Ionicons
                  name={isFocused ? "grid" : "grid-outline"}
                  size={25}
                  color={isFocused ? "#EE7942" : "#222"}
                />
              ) : null}
            </View>
            {isFocused && (
              <Text
                style={{
                  color: isFocused ? "#EE7942" : "#222",
                  fontWeight: "bold",
                }}
              >
                {label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
    paddingHorizontal: 15,
    paddingVertical: 11,
    paddingBottom: 21,
  },
  button: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: 55,
  },
  activeButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: 55,
    borderRadius: 10,
    backgroundColor: "#FEE8DC",
  },
  icon: {
    marginBottom: 4,
  },
});

export default CustomTabBar;
