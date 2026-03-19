import { createStackNavigator } from '@react-navigation/stack';
import AdoptionForm from '../screens/Adoption/AdoptionForm';
import AdoptionHome from '../screens/Adoption/AdoptionHome';
import PetDetails from '../screens/Adoption/PetDetails';

const Stack = createStackNavigator();

const AdoptionNavigation = () => {
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
        name="AdoptionHome"
        component={AdoptionHome}
        options={{ title: 'Adoption' }}
      />
      <Stack.Screen
        name="PetDetails"
        component={PetDetails}
        options={{ title: 'Pet Details' }}
      />
      <Stack.Screen
        name="AdoptionForm"
        component={AdoptionForm}
        options={{ title: 'Adoption Form' }}
      />
    </Stack.Navigator>
  );
};

export default AdoptionNavigation;
