import { createStackNavigator } from "@react-navigation/stack";

import Login from "../screens/Auth/Login";

import Welcome from "../screens/Start/Welcome/Welcome";

const Stack = createStackNavigator();

export default function AuthNavigations() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Welcome">
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="Login" component={Login} />
    
    </Stack.Navigator>
  );
}