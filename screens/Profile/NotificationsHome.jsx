import { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { localNotificationService } from "../../services/localNotificationService";
import { orderService } from "../../services/orderService";

const NotificationsHome = () => {
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = async () => {
    try {
      const [remoteData, localData] = await Promise.all([
        orderService.getNotifications(),
        localNotificationService.getNotifications(),
      ]);
      const remoteNotifications = Array.isArray(remoteData?.results)
        ? remoteData.results
        : Array.isArray(remoteData)
          ? remoteData
          : [];
      const mergedNotifications = [...remoteNotifications, ...localData].sort((a, b) => {
        const firstDate = a?.created_at ? new Date(a.created_at).getTime() : 0;
        const secondDate = b?.created_at ? new Date(b.created_at).getTime() : 0;
        return secondDate - firstDate;
      });
      setNotifications(mergedNotifications);
    } catch (error) {
      Alert.alert("Unable to load notifications", error?.message || "Please try again.");
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      const notification = notifications.find((item) => item.id === id);
      if (notification?.source === "expo") {
        await localNotificationService.markAsRead(id);
      } else {
        await orderService.markNotificationRead(id);
      }
      setNotifications((current) =>
        current.map((item) => (item.id === id ? { ...item, is_read: true } : item))
      );
    } catch (error) {
      Alert.alert("Unable to update notification", error?.message || "Please try again.");
    }
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={notifications}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <View style={[styles.card, item.is_read && styles.cardRead]}>
          <Text style={styles.title}>{item.title || "Notification"}</Text>
          <Text style={styles.message}>{item.message || item.description || "No message"}</Text>
          <Text style={styles.date}>
            {item.created_at ? new Date(item.created_at).toLocaleString() : ""}
          </Text>
          {!item.is_read && (
            <TouchableOpacity onPress={() => handleMarkRead(item.id)}>
              <Text style={styles.action}>Mark as read</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      ListEmptyComponent={<Text style={styles.emptyText}>No notifications yet.</Text>}
    />
  );
};

export default NotificationsHome;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },
  content: { padding: 16, paddingBottom: 30 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 12 },
  cardRead: { opacity: 0.7 },
  title: { fontSize: 16, fontWeight: "700", color: "#222222", marginBottom: 6 },
  message: { fontSize: 14, lineHeight: 20, color: "#666666", marginBottom: 8 },
  date: { fontSize: 12, color: "#999999" },
  action: { marginTop: 10, color: "#FF6B9D", fontWeight: "700" },
  emptyText: { textAlign: "center", color: "#888888", marginTop: 24 },
});
