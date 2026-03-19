import { Feather } from "@expo/vector-icons";
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { authService } from '../services/authService';
import BottomTabBarNavigations from './BottomTabBarNavigations';

const Drawer = createDrawerNavigator();

// Custom Drawer Content
const CustomDrawerContent = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await authService.logout();
            // Use CommonActions to navigate to root and reset to auth stack
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'authStack' }],
              })
            );
          }
        }
      ]
    );
  };

  const menuItems = [
    { id: 1, title: 'Home', icon: 'home', route: 'Main', screen: 'Home' },
    { id: 2, title: 'Shopping', icon: 'shopping-bag', route: 'Main', screen: 'Home', params: { screen: 'ShoppingStack' } },
    { id: 3, title: 'Treatment', icon: 'activity', route: 'Main', screen: 'Home', params: { screen: 'TreatmentStack' } },
    { id: 4, title: 'Pet Hostel', icon: 'home', route: 'Main', screen: 'Home', params: { screen: 'PetHostelStack' } },
    { id: 5, title: 'Adoption', icon: 'heart', route: 'Main', screen: 'Home', params: { screen: 'AdoptionStack' } },
    { id: 6, title: 'My Orders', icon: 'package', route: 'Main', screen: 'Home', params: { screen: 'OrdersStack' } },
    { id: 7, title: 'My Pets', icon: 'users', route: 'Main', screen: 'My Pet' },
    { id: 8, title: 'Activities', icon: 'trending-up', route: 'Main', screen: 'Activities' },
    { id: 9, title: 'Health', icon: 'heart', route: 'Main', screen: 'Health' },
    { id: 10, title: 'Profile', icon: 'user', route: 'Main', screen: 'Menu' },
  ];

  return (
    <View style={styles.drawerContainer}>
      {/* Drawer Header */}
      <View style={styles.drawerHeader}>
        <View style={styles.logoContainer}>
          <Feather name="heart" size={32} color="#FFFFFF" />
        </View>
        <Text style={styles.appName}>PawPaw</Text>
        <Text style={styles.appTagline}>Pet Care Made Easy</Text>
        {currentUser && (
          <View style={styles.userInfoContainer}>
            <Feather name="user" size={14} color="rgba(255, 255, 255, 0.9)" />
            <Text style={styles.userEmail}>{currentUser.email}</Text>
          </View>
        )}
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => {
              if (item.params) {
                navigation.navigate(item.route, {
                  screen: item.screen,
                  params: item.params
                });
              } else {
                navigation.navigate(item.route, { screen: item.screen });
              }
            }}
          >
            <Feather name={item.icon} size={22} color="#666666" />
            <Text style={styles.menuText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Feather name="log-out" size={22} color="#FF6B9D" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.drawerFooter}>
        <Text style={styles.footerText}>Version 1.0.0</Text>
      </View>
    </View>
  );
};

const DrawerNavigation = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 280,
        },
      }}
    >
      <Drawer.Screen name="Main" component={BottomTabBarNavigations} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigation;

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  drawerHeader: {
    backgroundColor: '#FF6B9D',
    padding: 30,
    paddingTop: 60,
    alignItems: 'center',
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  userEmail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 25,
    gap: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 25,
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 'auto',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF6B9D',
    fontWeight: '600',
  },
  menuText: {
    fontSize: 16,
    color: '#2C2C2C',
    fontWeight: '500',
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#888888',
  },
});
