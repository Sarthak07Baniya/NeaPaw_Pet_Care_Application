import { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { profileService } from "../../services/profileService";

const emptyCard = {
  card_type: "Visa",
  last_four_digits: "",
  expiry_month: "",
  expiry_year: "",
  cardholder_name: "",
  is_default: false,
};

const SavedCards = () => {
  const [cards, setCards] = useState([]);
  const [form, setForm] = useState(emptyCard);
  const [loading, setLoading] = useState(false);

  const loadCards = async () => {
    try {
      const data = await profileService.getSavedCards();
      setCards(Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert("Unable to load cards", error?.message || "Please try again.");
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const handleSave = async () => {
    if (!form.cardholder_name || !form.last_four_digits || !form.expiry_month || !form.expiry_year) {
      Alert.alert("Missing details", "Please complete the card details.");
      return;
    }

    try {
      setLoading(true);
      await profileService.addSavedCard({
        ...form,
        expiry_month: Number(form.expiry_month),
        expiry_year: Number(form.expiry_year),
      });
      setForm(emptyCard);
      await loadCards();
    } catch (error) {
      Alert.alert("Unable to save card", error?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Delete card", "Remove this saved card?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await profileService.deleteSavedCard(id);
            await loadCards();
          } catch (error) {
            Alert.alert("Unable to delete card", error?.message || "Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={cards}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={
        <View style={styles.card}>
          <Text style={styles.title}>Add Saved Card</Text>
          <TextInput style={styles.input} placeholder="Card Type (Visa, Mastercard)" value={form.card_type} onChangeText={(value) => setForm((current) => ({ ...current, card_type: value }))} />
          <TextInput style={styles.input} placeholder="Last Four Digits" value={form.last_four_digits} onChangeText={(value) => setForm((current) => ({ ...current, last_four_digits: value.replace(/[^0-9]/g, "").slice(0, 4) }))} keyboardType="number-pad" />
          <TextInput style={styles.input} placeholder="Expiry Month" value={form.expiry_month} onChangeText={(value) => setForm((current) => ({ ...current, expiry_month: value.replace(/[^0-9]/g, "").slice(0, 2) }))} keyboardType="number-pad" />
          <TextInput style={styles.input} placeholder="Expiry Year" value={form.expiry_year} onChangeText={(value) => setForm((current) => ({ ...current, expiry_year: value.replace(/[^0-9]/g, "").slice(0, 4) }))} keyboardType="number-pad" />
          <TextInput style={styles.input} placeholder="Cardholder Name" value={form.cardholder_name} onChangeText={(value) => setForm((current) => ({ ...current, cardholder_name: value }))} />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Set as default</Text>
            <Switch value={form.is_default} onValueChange={(value) => setForm((current) => ({ ...current, is_default: value }))} />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Saving..." : "Save Card"}</Text>
          </TouchableOpacity>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.listCard}>
          <Text style={styles.itemTitle}>{item.card_type} ending in {item.last_four_digits}</Text>
          <Text style={styles.itemText}>Cardholder: {item.cardholder_name}</Text>
          <Text style={styles.itemText}>Expires: {item.expiry_month}/{item.expiry_year}</Text>
          {item.is_default && <Text style={styles.defaultBadge}>Default</Text>}
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.emptyText}>No saved cards yet.</Text>}
    />
  );
};

export default SavedCards;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },
  content: { padding: 16, paddingBottom: 32 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "700", color: "#222222", marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: 10, backgroundColor: "#FAFAFA" },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4, marginBottom: 12 },
  switchLabel: { fontSize: 15, color: "#333333" },
  button: { backgroundColor: "#FF6B9D", borderRadius: 12, alignItems: "center", paddingVertical: 14 },
  buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  listCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 12 },
  itemTitle: { fontSize: 16, fontWeight: "700", color: "#222222", marginBottom: 6 },
  itemText: { fontSize: 14, color: "#666666", marginBottom: 4 },
  defaultBadge: { marginTop: 6, color: "#FF6B9D", fontWeight: "700" },
  deleteText: { marginTop: 10, color: "#E11D48", fontWeight: "600" },
  emptyText: { textAlign: "center", color: "#888888", marginTop: 20 },
});
