import { createStackNavigator } from '@react-navigation/stack';
import Checkout from '../screens/Shopping/Checkout';
import OrderConfirmation from '../screens/Shopping/OrderConfirmation';
import ProductDetail from '../screens/Shopping/ProductDetail';
import ShoppingCart from '../screens/Shopping/ShoppingCart';
import ShoppingHome from '../screens/Shopping/ShoppingHome';

const Stack = createStackNavigator();

const ShoppingNavigation = () => {
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
        name="ShoppingHome"
        component={ShoppingHome}
        options={{ headerShown: true ,
          title: 'Shop for Your Pet',
        }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetail}
        options={{ title: 'Product Details' }}
      />
      <Stack.Screen
        name="ShoppingCart"
        component={ShoppingCart}
        options={{ title: 'Shopping Cart' }}
      />
      <Stack.Screen
        name="Checkout"
        component={Checkout}
        options={{ title: 'Checkout' }}
      />
      <Stack.Screen
        name="OrderConfirmation"
        component={OrderConfirmation}
        options={{
          title: 'Order Confirmed',
          headerLeft: () => null,
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default ShoppingNavigation;
