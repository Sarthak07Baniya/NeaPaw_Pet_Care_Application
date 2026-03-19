import { StatusBar } from "expo-status-bar";
import moment from "moment";
import { I18nManager, StatusBar as Sb, StyleSheet, View } from "react-native";
import { LocaleConfig } from "react-native-calendars";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import MainNavigations from "./navigations/MainNavigations";
import { store } from "./redux/store";

/* ---------------------------------------------------
   1️⃣ FORCE APP TO LTR (Some devices use RTL calendar)
---------------------------------------------------- */
if (I18nManager.isRTL) {
  I18nManager.allowRTL(false);
  I18nManager.forceRTL(false);
}

/* ---------------------------------------------------
   2️⃣ SET CALENDAR LOCALE BEFORE APP LOADS
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
   3️⃣ FORCE MOMENT TO ENGLISH (Important)
---------------------------------------------------- */
moment.locale("en");

/* ---------------------------------------------------
   4️⃣ APP COMPONENT
---------------------------------------------------- */
export default function App() {
  return (
    <Provider store={store}>
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <StatusBar style="dark" />
        <Sb animated={true} barStyle="dark-content" />
        <MainNavigations />
        <Toast />
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({});