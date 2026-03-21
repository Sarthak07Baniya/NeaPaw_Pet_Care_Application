import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ReviewsHome = ({ navigation }) => {
  const handleOpenOrders = () => {
    const parentNavigation = navigation.getParent?.();
    parentNavigation?.navigate("Home", {
      screen: "OrdersStack",
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Review Your Purchases</Text>
        <Text style={styles.description}>
          You can rate and review products only after the related shopping order is delivered.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleOpenOrders}
        >
          <Text style={styles.buttonText}>Go to My Orders</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ReviewsHome;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8", padding: 16 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 20 },
  title: { fontSize: 20, fontWeight: "700", color: "#222222", marginBottom: 10 },
  description: { fontSize: 15, lineHeight: 22, color: "#666666", marginBottom: 18 },
  button: { backgroundColor: "#FF6B9D", borderRadius: 12, alignItems: "center", paddingVertical: 14 },
  buttonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
});
