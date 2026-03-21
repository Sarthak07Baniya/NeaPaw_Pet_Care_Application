import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from "@expo/vector-icons";
import { useDispatch, useSelector } from 'react-redux';
import { logoutSuccess } from '../../redux/slice/authSlice';
import { resetEverything } from '../../redux/slice/myPetSlice';
import { authService } from '../../services/authService';

const ProfileHome = ({ navigation }) => {
  const dispatch = useDispatch();
  const [darkMode, setDarkMode] = useState(false);
  const authUser = useSelector((state) => state.auth.user);
  const [currentUser, setCurrentUser] = useState(authUser || null);

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      const user = authUser || await authService.getCurrentUser();
      if (isMounted) {
        setCurrentUser(user);
      }
    };

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [authUser]);

  const displayName =
    currentUser?.full_name ||
    currentUser?.name ||
    currentUser?.first_name ||
    'Pet Parent';
  const displayEmail = currentUser?.email || 'No email available';

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            dispatch(logoutSuccess());
            dispatch(resetEverything());
          },
        },
      ]
    );
  };

  const handleMenuPress = (item) => {
    if (item.route !== 'OrdersStack') {
      return;
    }

    navigation.navigate('Home', {
      screen: 'OrdersStack',
    });
  };

  const menuItems = [
    { id: 1, title: 'Edit Profile', icon: 'edit', route: null },
    { id: 2, title: 'Orders', icon: 'shopping-bag', route: 'OrdersStack' },
    { id: 3, title: 'Shipping Address', icon: 'map-pin', route: null },
    { id: 4, title: 'My Saved Cards', icon: 'credit-card', route: null },
    { id: 5, title: 'Reviews', icon: 'star', route: null },
    { id: 6, title: 'Notifications', icon: 'bell', route: null },
    { id: 7, title: 'About Us', icon: 'info', route: null },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Feather name="user" size={40} color="#FFFFFF" />
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{displayEmail}</Text>
      </View>

      {/* Dark Mode */}
      <View style={styles.section}>
        <View style={styles.darkModeRow}>
          <Feather name="moon" size={20} color="#666666" />
          <Text style={styles.darkModeText}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#E0E0E0', true: '#FFB3D1' }}
            thumbColor={darkMode ? '#FF6B9D' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.section}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleMenuPress(item)}
          >
            <Feather name={item.icon} size={20} color="#666666" />
            <Text style={styles.menuText}>{item.title}</Text>
            <Feather name="chevron-right" size={20} color="#CCCCCC" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={20} color="#FF6B9D" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

export default ProfileHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 10,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#888888',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  darkModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  darkModeText: {
    flex: 1,
    fontSize: 16,
    color: '#2C2C2C',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#2C2C2C',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  bottomSpacing: {
    height: 30,
  },
});
