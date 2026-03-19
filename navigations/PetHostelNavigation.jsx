import { createStackNavigator } from '@react-navigation/stack';
import HostelCheckout from '../screens/PetHostel/HostelCheckout';
import HostelDetails from '../screens/PetHostel/HostelDetails';
import HostelHome from '../screens/PetHostel/HostelHome';

const Stack = createStackNavigator();

const PetHostelNavigation = () => {
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
        name="HostelHome"
        component={HostelHome}
        options={{ title: 'Pet Hostel' }}
      />
      <Stack.Screen
        name="HostelDetails"
        component={HostelDetails}
        options={{ title: 'Pet Details' }}
      />
      <Stack.Screen
        name="HostelCheckout"
        component={HostelCheckout}
        options={{ title: 'Checkout' }}
      />
    </Stack.Navigator>
  );
};

export default PetHostelNavigation;
