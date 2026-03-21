import { createStackNavigator } from "@react-navigation/stack";
import AboutUs from "../screens/Profile/AboutUs";
import EditProfile from "../screens/Profile/EditProfile";
import NotificationsHome from "../screens/Profile/NotificationsHome";
import ProfileHome from "../screens/Profile/ProfileHome";
import ReviewsHome from "../screens/Profile/ReviewsHome";
import SavedCards from "../screens/Profile/SavedCards";
import ShippingAddress from "../screens/Profile/ShippingAddress";

const Stack = createStackNavigator();

const ProfileNavigation = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: "#2C2C2C",
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen
        name="ProfileHome"
        component={ProfileHome}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="EditProfile" component={EditProfile} options={{ title: "Edit Profile" }} />
      <Stack.Screen name="ShippingAddress" component={ShippingAddress} options={{ title: "Shipping Address" }} />
      <Stack.Screen name="SavedCards" component={SavedCards} options={{ title: "My Saved Cards" }} />
      <Stack.Screen name="ReviewsHome" component={ReviewsHome} options={{ title: "Reviews" }} />
      <Stack.Screen name="NotificationsHome" component={NotificationsHome} options={{ title: "Notifications" }} />
      <Stack.Screen name="AboutUs" component={AboutUs} options={{ title: "About Us" }} />
    </Stack.Navigator>
  );
};

export default ProfileNavigation;
