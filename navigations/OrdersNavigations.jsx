import { createStackNavigator } from '@react-navigation/stack';
import OrderChat from '../screens/Orders/OrderChat';
import OrderDetails from '../screens/Orders/OrderDetails';
import OrderTracking from '../screens/Orders/OrderTracking';

const Stack = createStackNavigator();

const OrdersNavigation = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#2C2C2C',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen
        name="OrderTracking"
        component={OrderTracking}
        options={{ title: 'My Orders' }}
      />
      <Stack.Screen
        name="OrderDetails"
        component={OrderDetails}
        options={{ title: 'Order Details' }}
      />
      <Stack.Screen
        name="OrderChat"
        component={OrderChat}
        options={{ title: 'Support Chat' }}
      />
    </Stack.Navigator>
  );
};

export default OrdersNavigation;
