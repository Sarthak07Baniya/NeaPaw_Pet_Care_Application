import { ScrollView, StyleSheet, Text, View } from "react-native";

const AboutUs = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>NeaPaw Pet Care</Text>
        <Text style={styles.paragraph}>
          NeaPaw brings pet care services, shopping, treatment booking, pet hostel, and activity tracking into one mobile experience.
        </Text>
        <Text style={styles.paragraph}>
          Our goal is to make everyday pet care simpler for pet parents with clear schedules, easy bookings, and personalized pet information.
        </Text>
        <Text style={styles.paragraph}>
          Thank you for using NeaPaw and building your pet’s daily routine with us.
        </Text>
      </View>
    </ScrollView>
  );
};

export default AboutUs;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },
  content: { padding: 16 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 20 },
  title: { fontSize: 22, fontWeight: "700", color: "#222222", marginBottom: 14 },
  paragraph: { fontSize: 15, lineHeight: 24, color: "#555555", marginBottom: 12 },
});
