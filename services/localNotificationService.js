import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "neapaw_local_notifications";

const readNotifications = async () => {
  const rawValue = await AsyncStorage.getItem(STORAGE_KEY);
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const writeNotifications = async (notifications) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
};

export const localNotificationService = {
  getNotifications: async () => {
    return await readNotifications();
  },

  upsertNotification: async (notification) => {
    const current = await readNotifications();
    const existingIndex = current.findIndex((item) => item.id === notification.id);

    if (existingIndex >= 0) {
      current[existingIndex] = {
        ...current[existingIndex],
        ...notification,
      };
    } else {
      current.unshift(notification);
    }

    await writeNotifications(current);
    return notification;
  },

  markAsRead: async (id) => {
    const current = await readNotifications();
    const updated = current.map((item) =>
      item.id === id ? { ...item, is_read: true } : item
    );
    await writeNotifications(updated);
    return true;
  },
};
