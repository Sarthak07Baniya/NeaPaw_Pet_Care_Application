import { createStackNavigator } from '@react-navigation/stack';
import BookingConfirmation from '../screens/Treatment/BookingConfirmation';
import ServiceBooking from '../screens/Treatment/ServiceBooking';
import TreatmentCheckout from '../screens/Treatment/TreatmentCheckout';
import TreatmentHome from '../screens/Treatment/TreatmentHome';

const Stack = createStackNavigator();

const TreatmentNavigation = () => {
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
        name="TreatmentHome"
        component={TreatmentHome}
        options={{ title: 'Treatment Services' }}
      />
      <Stack.Screen
        name="ServiceBooking"
        component={ServiceBooking}
        options={{ title: 'Book Service' }}
      />
      <Stack.Screen
        name="TreatmentCheckout"
        component={TreatmentCheckout}
        options={{ title: 'Checkout' }}
      />
      <Stack.Screen
        name="BookingConfirmation"
        component={BookingConfirmation}
        options={{
          title: 'Booking Confirmed',
          headerLeft: () => null,
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default TreatmentNavigation;
