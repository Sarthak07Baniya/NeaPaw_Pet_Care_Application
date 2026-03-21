import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { StyleSheet } from "react-native";
import {
    CustomMainHeaderLeft,
    CustomMainHeaderRight,
} from "../components/ui/CustomHeader/CustomMainHeader";
import Home from "../screens/Home/Home";
import MyPet from "../screens/MyPet/MyPet";
import ProfileHome from "../screens/Profile/ProfileHome";
import AdoptionNavigation from "./AdoptionNavigation";
import ActivitiesNavigation from "./ActivitiesNavigation";
import HealtNavigations from "./HealthNavigation";
import OrdersNavigation from "./OrdersNavigations";
import PetHostelNavigation from "./PetHostelNavigation";
import ShoppingNavigation from "./ShoppingNavigation";
import TreatmentNavigation from "./TreatmentNavigation";

import CustomTabBar from "../components/ui/CustomTabBar/CustomTabBar";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Home Stack Navigator (includes Home and all service navigations)
const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeScreen"
        component={Home}
        options={({ navigation }) => ({
          headerStyle: {
            shadowColor: "transparent",
            elevation: 0,
            height: 120,
          },
          headerTitleStyle: {
            display: "none",
          },
          headerLeft: () => <CustomMainHeaderLeft isNameVisible={true} />,
          headerRight: () => <CustomMainHeaderRight navigation={navigation} />,
        })}
      />
      <Stack.Screen
        name="ShoppingStack"
        component={ShoppingNavigation}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TreatmentStack"
        component={TreatmentNavigation}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PetHostelStack"
        component={PetHostelNavigation}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdoptionStack"
        component={AdoptionNavigation}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrdersStack"
        component={OrdersNavigation}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const BottomTabBarNavigations = ({ navigation }) => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        tabBarHideOnKeyboard: false,
        style: {
          position: "absolute",
          elevation: 0,
        },
      }}

    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="My Pet"
        component={MyPet}
        options={({ navigation }) => ({
          headerStyle: {
            shadowColor: "transparent", // this covers iOS
            elevation: 0, // this covers Android
            height: 120,
          },
          headerTitleStyle: {
            display: "none",
          },
          headerLeft: () => <CustomMainHeaderLeft isNameVisible={true} />,
          headerRight: () => <CustomMainHeaderRight navigation={navigation} />,
        })}
      />
      <Tab.Screen
        name="Activities"
        options={{
          headerShown: false,
        }}
        component={ActivitiesNavigation}
      />
      <Tab.Screen
        name="Health"
        options={{
          headerShown: false,
        }}
        component={HealtNavigations}
      />
      <Tab.Screen
        name="Menu"
        component={ProfileHome}
        options={({ navigation }) => ({
          headerStyle: {
            shadowColor: "transparent", // this covers iOS
            elevation: 0, // this covers Android
            height: 120,
          },
          headerTitleStyle: {
            display: "none",
          },
          headerLeft: () => <CustomMainHeaderLeft isNameVisible={true} />,
          headerRight: () => <CustomMainHeaderRight navigation={navigation} />,
        })}
      />
    </Tab.Navigator>
  );
};

export default BottomTabBarNavigations;

const styles = StyleSheet.create({});
