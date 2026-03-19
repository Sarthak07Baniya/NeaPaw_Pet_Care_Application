import { useNavigation } from '@react-navigation/native';
import { useRef } from 'react';
import { StyleSheet, TouchableWithoutFeedback, Vibration, View } from 'react-native';

/**
 * ApiSettingsGesture Component
 * 
 * Provides a long-press gesture to access API settings
 * Can be wrapped around any component (typically the app logo or header)
 * 
 * Usage:
 * <ApiSettingsGesture>
 *   <YourComponent />
 * </ApiSettingsGesture>
 */
const ApiSettingsGesture = ({ children, longPressDuration = 2000 }) => {
  const navigation = useNavigation();
  const pressTimerRef = useRef(null);

  const handlePressIn = () => {
    // Start timer for long press
    pressTimerRef.current = setTimeout(() => {
      // Haptic feedback
      Vibration.vibrate(50);
      
      // Navigate to API settings
      if (navigation) {
        navigation.navigate('ApiConfig');
      }
    }, longPressDuration);
  };

  const handlePressOut = () => {
    // Clear timer if user releases before long press duration
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <View style={styles.container}>
        {children}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    // Transparent wrapper - doesn't affect layout
  },
});

export default ApiSettingsGesture;
