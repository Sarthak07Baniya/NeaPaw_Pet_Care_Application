import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from "@expo/vector-icons";

const BookingConfirmation = ({ route, navigation }) => {
  const { bookingId, orderId, total } = route.params;

  const navigateToOrders = () => {
    const rootNavigation = navigation.getParent?.();
    const tabNavigation = rootNavigation?.getParent?.();

    if (tabNavigation) {
      tabNavigation.navigate('Home', {
        screen: 'OrdersStack',
      });
      return;
    }

    if (rootNavigation) {
      rootNavigation.navigate('OrdersStack');
      return;
    }

    navigation.navigate('TreatmentHome');
  };

  const handleContinue = () => {
    navigateToOrders();
  };

  const handleRateReview = () => {
    navigateToOrders();
  };

  const handleSupportChat = () => {
    const rootNavigation = navigation.getParent?.();
    const tabNavigation = rootNavigation?.getParent?.();

    if (tabNavigation && orderId) {
      tabNavigation.navigate('Home', {
        screen: 'OrdersStack',
        params: {
          screen: 'OrderChat',
          params: {
            order: {
              id: orderId,
              order_type: 'treatment',
            },
          },
        },
      });
      return;
    }

    navigateToOrders();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Feather name="check-circle" size={80} color="#4CAF50" />
        </View>
        
        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>Your treatment has been successfully booked</Text>
        
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Booking ID</Text>
            <Text style={styles.detailValue}>{bookingId}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Amount</Text>
            <Text style={styles.detailValueHighlight}>₹{total}</Text>
          </View>
        </View>

        <Text style={styles.infoText}>
          You will receive a confirmation email shortly with all the booking details.
        </Text>

        <TouchableOpacity style={styles.rateButton} onPress={handleRateReview}>
          <Feather name="star" size={20} color="#FF6B9D" />
          <Text style={styles.rateButtonText}>Rate & Review</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.chatButton} onPress={handleSupportChat}>
          <Feather name="message-circle" size={20} color="#FFFFFF" />
          <Text style={styles.chatButtonText}>Chat with Support</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BookingConfirmation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 40,
    textAlign: 'center',
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 15,
    color: '#666666',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  detailValueHighlight: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B9D',
  },
  infoText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF6B9D',
    marginBottom: 15,
    width: '100%',
  },
  rateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B9D',
    marginLeft: 8,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    marginBottom: 15,
    width: '100%',
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  continueButton: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  continueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
