import { useFonts } from "expo-font";
import { useRef, useState } from "react";
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Button from "../../../components/ui/Button/Button";
// Import placeholder images for the 3 screens
import image1 from '../../../welcome.png';
import image2 from '../../../welcome1.png';
import image3 from '../../../welcome2.png';

const { width } = Dimensions.get("window");

const onboardingData = [
  {
    id: 1,
    title: "Easily Manage\nYour Pet",
    subtitle: "All your pet's needs and records in one convenient place.",
    image: image1,
  },
  {
    id: 2,
    title: "Health & Vax\nReminders",
    subtitle: "Never miss a vet appointment or vaccination again.",
    image: image2,
  },
  {
    id: 3,
    title: "Track Activities\n& Growth",
    subtitle: "Monitor feeding, walking, and your pet's milestones.",
    image: image3,
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [activeScreen, setActiveScreen] = useState(0);
  const scrollViewRef = useRef(null);

  let [fontsLoaded] = useFonts({
    "Nunito-Bold": require("../../../assets/fonts/Nunito-ExtraBold.ttf"),
  });

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  // --- Scroll Logic (Pagination) ---
  const handleScroll = (event) => {
    // Calculate the index of the currently visible page
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setActiveScreen(currentIndex);
  };

  const scrollToNext = () => {
    const nextIndex = activeScreen + 1;
    if (nextIndex < onboardingData.length) {
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
      setActiveScreen(nextIndex);
    } else {
      // Last screen, navigate to Registration
      handlePress();
    }
  };

  const navigateToRegister = () => {
    const parentNavigation = navigation.getParent?.();

    if (navigation.getState().routeNames?.includes("Register")) {
      navigation.navigate("Register");
      return;
    }

    if (parentNavigation?.getState().routeNames?.includes("authStack")) {
      parentNavigation.navigate("authStack", { screen: "Register" });
    }
  };

  const handlePress = () => {
    navigateToRegister();
  };

  // --- Render Functions ---
  const renderItem = (item) => (
    <View key={item.id} style={styles.slide}>
      <View style={styles.imageContainer}>
        <Image style={styles.image} source={item.image}

         />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {onboardingData.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            activeScreen === index ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Decorative Background Circle */}
      <View style={styles.circle} />

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16} // Update scroll state frequently
        style={styles.scrollView}
      >
        {onboardingData.map(renderItem)}
      </ScrollView>

      {/* Pagination and Button Area */}
      <View style={styles.footer}>
        {renderPagination()}
        <View style={styles.buttonContainer}>
          <Button
            onPress={scrollToNext}
            text={activeScreen === onboardingData.length - 1 ? "Get Started" : "Next"}
          />
        </View>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={navigateToRegister}
        >
            <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  // --- Decorative Circle (from your Welcome screen) ---
  circle: {
    width: "100%",
    height: Dimensions.get("window").height * 0.45,
    borderBottomLeftRadius: Dimensions.get("window").width * 0.5,
    borderBottomRightRadius: Dimensions.get("window").width * 0.5,
    backgroundColor: "#8D94F4",
    position: "absolute",
    zIndex: -1,
  },
  // --- Slide Styling ---
  scrollView: {
    flex: 1,
  },
  slide: {
    width, // Full width of the screen
    alignItems: "center",
    paddingHorizontal: 25,
    paddingTop: Dimensions.get("window").height * 0.1,
  },
  imageContainer: {
    width: "100%",
    height: Dimensions.get("window").height * 0.45,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  image: {
    flex: 1,
    resizeMode: "contain",
    width: "100%",
    height: "100%",
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: "Nunito-Bold",
    textAlign: "center",
    lineHeight: 40,
    marginBottom: 15,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
  },
  // --- Footer and Pagination ---
  footer: {
    paddingHorizontal: 25,
    paddingBottom: 40,
    alignItems: "center",
  },
  pagination: {
    flexDirection: "row",
    marginBottom: 25,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#8D94F4",
    width: 25, // Make active dot stand out
  },
  inactiveDot: {
    backgroundColor: "#ccc",
  },
  buttonContainer: {
    width: "100%",
  },
  skipButton: {
    marginTop: 15,
  },
  skipText: {
    color: "#555",
    fontSize: 16,
    textDecorationLine: 'underline',
  }
});
