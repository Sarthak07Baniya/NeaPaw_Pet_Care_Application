import { createStackNavigator } from "@react-navigation/stack";
import ForgotPassword from "../screens/Auth/ForgotPassword";
import Login from "../screens/Auth/Login";
import Register from "../screens/Auth/Register";
import ResetPassword from "../screens/Auth/ResetPassword";
import Welcome from "../screens/Start/Welcome/Welcome";

const Stack = createStackNavigator();

export default function AuthNavigations() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Welcome">
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
    </Stack.Navigator>
  );
}