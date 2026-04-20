import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { logoutSuccess } from "../../redux/slice/authSlice";
import { resetEverything } from "../../redux/slice/myPetSlice";
import { authService } from "../../services/authService";
import { resolveMediaUrl } from "../../services/api";

const ProfileHome = ({ navigation }) => {
  const dispatch = useDispatch();
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
    "Pet Parent";
  const displayEmail = currentUser?.email || "No email available";

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await authService.logout();
            dispatch(logoutSuccess());
            dispatch(resetEverything());

            let rootNavigation = navigation;
            while (rootNavigation?.getParent?.()) {
              rootNavigation = rootNavigation.getParent();
            }

            rootNavigation?.reset?.({
              index: 0,
              routes: [
                {
                  name: "authStack",
                  state: {
                    routes: [{ name: "Welcome" }],
                  },
                },
              ],
            });
          },
        },
      ]
    );
  };

  const handleMenuPress = (item) => {
    if (item.route !== "OrdersStack") {
      if (item.route) {
        navigation.navigate(item.route);
      }
      return;
    }

    const parentNavigation = navigation.getParent?.();
    if (parentNavigation) {
      parentNavigation.navigate("Home", {
        screen: "OrdersStack",
      });
      return;
    }

    navigation.navigate("Home", {
      screen: "OrdersStack",
    });
  };

  const menuItems = [
    { id: 1, title: "Edit Profile", icon: "edit", route: "EditProfile" },
    { id: 2, title: "Change Password", icon: "lock", route: "ChangePassword" },
    { id: 3, title: "My Pets", icon: "grid", route: "MyPets" },
    { id: 4, title: "Orders", icon: "shopping-bag", route: "OrdersStack" },
    { id: 5, title: "Favourite Items", icon: "heart", route: "FavouriteItems" },
    { id: 6, title: "Reviews", icon: "star", route: "ReviewsHome" },
    { id: 7, title: "Notifications", icon: "bell", route: "NotificationsHome" },
    { id: 8, title: "About Us", icon: "info", route: "AboutUs" },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {currentUser?.profile_picture ? (
            <Image
              source={{ uri: resolveMediaUrl(currentUser.profile_picture) }}
              style={styles.avatarImage}
            />
          ) : (
            <Feather name="user" size={40} color="#FFFFFF" />
          )}
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{displayEmail}</Text>
      </View>

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
    backgroundColor: "#F8F8F8",
  },
  header: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingVertical: 30,
    marginBottom: 10,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF6B9D",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C2C2C",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#888888",
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    gap: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#2C2C2C",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6B9D",
  },
  bottomSpacing: {
    height: 30,
  },
});
