import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import moment from "moment";
import { useEffect, useRef } from "react";
import { I18nManager, StatusBar as Sb, StyleSheet, View } from "react-native";
import { LocaleConfig } from "react-native-calendars";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import MainNavigations from "./navigations/MainNavigations";
import { store } from "./redux/store";
import { localNotificationService } from "./services/localNotificationService";
import { petService } from "./services/petService";

/* ---------------------------------------------------
   1 FORCE APP TO LTR (Some devices use RTL calendar)
---------------------------------------------------- */
if (I18nManager.isRTL) {
  I18nManager.allowRTL(false);
  I18nManager.forceRTL(false);
}

/* ---------------------------------------------------
   2 SET CALENDAR LOCALE BEFORE APP LOADS
---------------------------------------------------- */
LocaleConfig.locales["en"] = {
  monthNames: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  monthNamesShort: [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ],
  dayNames: [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday",
  ],
  dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

LocaleConfig.defaultLocale = "en";

/* ---------------------------------------------------
   3 FORCE MOMENT TO ENGLISH (Important)
---------------------------------------------------- */
moment.locale("en");

const NotificationReporter = () => {
  const processedVaccineIds = useRef(new Set());

  useEffect(() => {
    const syncNotification = (notificationPayload, options = {}) => {
      const notificationId = notificationPayload?.request?.identifier;
      const content = notificationPayload?.request?.content;
      const data = content?.data || {};

      if (!notificationId || !content) {
        return;
      }

      localNotificationService.upsertNotification({
        id: notificationId,
        title: content.title || "Notification",
        message: content.body || "No message",
        created_at: new Date().toISOString(),
        is_read: !!options.isRead,
        source: "expo",
        type: data?.type || "local_notification",
      }).catch((error) => {
        console.log("Unable to save local notification:", error);
      });
    };

    const markReminderSent = (notificationData) => {
      const vaccineId = notificationData?.vaccineId;
      const type = notificationData?.type;

      if (type !== "vaccine_reminder" || !vaccineId) {
        return;
      }

      if (processedVaccineIds.current.has(vaccineId)) {
        return;
      }

      processedVaccineIds.current.add(vaccineId);
      petService.markVaccineReminderSent(vaccineId).catch((error) => {
        processedVaccineIds.current.delete(vaccineId);
        console.log("Unable to sync vaccine reminder status:", error);
      });
    };

    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        syncNotification(notification, { isRead: false });
        markReminderSent(notification?.request?.content?.data);
      }
    );

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        syncNotification(response?.notification, { isRead: true });
        markReminderSent(response?.notification?.request?.content?.data);
      }
    );

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return null;
};

/* ---------------------------------------------------
   4 APP COMPONENT
---------------------------------------------------- */
export default function App() {
  return (
    <Provider store={store}>
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <NotificationReporter />
        <StatusBar style="dark" />
        <Sb animated={true} barStyle="dark-content" />
        <MainNavigations />
        <Toast />
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({});
