import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StatusBar as Sb, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import ApiConfigScreen from "../screens/Settings/ApiConfigScreen";
import { loginSuccess, logoutSuccess } from "../redux/slice/authSlice";
import { fetchPets, setPetData, setSelectedDate } from "../redux/slice/myPetSlice";
import AuthNavigations from "./AuthNavigation";
import BottomTabBarNavigations from "./BottomTabBarNavigations";
import StartingScreensNavigations from "./StartingScreensNavigations";

SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

const MainNavigations = () => {
  const dispatch = useDispatch();
  const navigationRef = useRef(null);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { myPets, currentPetId } = useSelector((state) => state.myPet);
  const [appIsReady, setAppIsReady] = useState(false);
  const [petsResolved, setPetsResolved] = useState(false);

  const hydrateAuthenticatedState = useCallback(async () => {
    try {
      setPetsResolved(false);
      const resultAction = await dispatch(fetchPets());

      if (!fetchPets.fulfilled.match(resultAction)) {
        dispatch(logoutSuccess());
        return;
      }

      const pets = resultAction.payload?.results || resultAction.payload || [];
      if (pets.length > 0) {
        dispatch(setPetData(pets[0]));
        dispatch(setSelectedDate(new Date().toISOString()));
      }
    } catch (error) {
      console.error("Fetching pets failed:", error);
      dispatch(logoutSuccess());
    } finally {
      setPetsResolved(true);
    }
  }, [dispatch]);

  useEffect(() => {
    async function prepare() {
      try {
        const token = await AsyncStorage.getItem("token");
        const userJson = await AsyncStorage.getItem("neapaw_current_user");
        const user = userJson ? JSON.parse(userJson) : null;

        if (!token) {
          dispatch(logoutSuccess());
          setPetsResolved(true);
          return;
        }

        dispatch(loginSuccess({ token, user }));
      } catch (error) {
        console.warn(error);
        dispatch(logoutSuccess());
        setPetsResolved(true);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, [dispatch]);

  useEffect(() => {
    if (!appIsReady) return;

    if (!isAuthenticated) {
      setPetsResolved(true);
      return;
    }

    hydrateAuthenticatedState();
  }, [appIsReady, isAuthenticated, hydrateAuthenticatedState]);

  const activeRootScreen = useMemo(() => {
    if (!isAuthenticated) return "authStack";
    if (!petsResolved) return null;
    if (currentPetId || myPets.length > 0) return "bottomNavStack";
    return "startStack";
  }, [currentPetId, isAuthenticated, myPets.length, petsResolved]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady || !activeRootScreen) return null;

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <StatusBar style="dark" />
      <Sb animated={true} barStyle="dark-content" />

      <TouchableOpacity
        style={styles.hiddenTouch}
        onLongPress={() => navigationRef.current?.navigate("ApiConfig")}
        delayLongPress={2000}
        activeOpacity={1}
      />

      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          key={activeRootScreen}
          initialRouteName={activeRootScreen}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="authStack" component={AuthNavigations} />
          <Stack.Screen name="startStack" component={StartingScreensNavigations} />
          <Stack.Screen name="bottomNavStack" component={BottomTabBarNavigations} />
          <Stack.Screen
            name="ApiConfig"
            component={ApiConfigScreen}
            options={{
              headerShown: true,
              title: "API Settings",
              presentation: "modal",
              headerStyle: {
                backgroundColor: "#FF6B9D",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default MainNavigations;

const styles = StyleSheet.create({
  hiddenTouch: {
    position: "absolute",
    top: 40,
    right: 0,
    width: 80,
    height: 80,
    zIndex: 999,
    backgroundColor: "transparent",
  },
});
