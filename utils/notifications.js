import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import api from "../services/api";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

const ensureNotificationPermission = async () => {
  const settings = await Notifications.getPermissionsAsync();

  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return (
    requested.granted ||
    requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
};

const ensureAndroidNotificationChannel = async () => {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("default", {
    name: "default",
    importance: Notifications.AndroidImportance.MAX,
  });
};

export const registerDevicePushToken = async () => {
  const hasPermission = await ensureNotificationPermission();

  if (!hasPermission) {
    throw new Error("Notification permission not granted");
  }

  await ensureAndroidNotificationChannel();

  const tokenResponse = await Notifications.getDevicePushTokenAsync();
  const rawToken =
    typeof tokenResponse?.data === "string"
      ? tokenResponse.data
      : tokenResponse?.data?.token;

  if (!rawToken) {
    throw new Error("Could not fetch device push token");
  }

  await api.post("pets/device-tokens/", {
    token: rawToken,
    platform: Platform.OS,
    device_name: Platform.OS,
    is_active: true,
  });

  return rawToken;
};

export const schedulePushNotification = async (
  title,
  body,
  time,
  hours,
  options = {}
) => {
  const {
    includeReminderBefore = true,
    reminderMinutesBefore = 15,
    data = {},
  } = options;
  const hasPermission = await ensureNotificationPermission();

  if (!hasPermission) {
    throw new Error("Notification permission not granted");
  }

  await ensureAndroidNotificationChannel();

  const trigger = new Date(time);
  trigger.setHours(hours.split(":")[0]);
  trigger.setMinutes(hours.split(":")[1]);
  trigger.setSeconds(hours.split(":")[2]);
  trigger.setMilliseconds(0);

  if (trigger.getTime() <= Date.now()) {
    throw new Error("Notification time must be in the future");
  }

  const scheduledIds = [];
  const mainTrigger = {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: trigger,
    ...(Platform.OS === "android" ? { channelId: "default" } : {}),
  };

  const mainNotificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      data,
    },
    trigger: mainTrigger,
  });
  scheduledIds.push(mainNotificationId);

  if (includeReminderBefore) {
    const reminderTrigger = new Date(trigger);
    reminderTrigger.setMinutes(reminderTrigger.getMinutes() - reminderMinutesBefore);

    if (reminderTrigger.getTime() > Date.now()) {
      const reminderScheduleTrigger = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderTrigger,
        ...(Platform.OS === "android" ? { channelId: "default" } : {}),
      };
      const reminderId = await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: `${reminderMinutesBefore} minute${reminderMinutesBefore === 1 ? "" : "s"} left to activity......`,
          data,
        },
        trigger: reminderScheduleTrigger,
      });
      scheduledIds.push(reminderId);
    }
  }

  return scheduledIds;
};
