import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from 'react';
import moment from 'moment';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createTreatmentBooking, resetTreatmentSelection } from '../../redux/slice/treatmentSlice';
import { getAppConfig } from '../../services/api';
import { paymentService } from '../../services/paymentService';

const TreatmentCheckout = ({ navigation }) => {
  const dispatch = useDispatch();
  const selectedPet = useSelector((state) => state.treatment.selectedPet);
  const selectedTreatmentType = useSelector((state) => state.treatment.selectedTreatmentType);
  const selectedService = useSelector((state) => state.treatment.selectedService);
  const selectedServiceType = useSelector((state) => state.treatment.selectedServiceType);
  const selectedDate = useSelector((state) => state.treatment.selectedDate);
  const selectedTime = useSelector((state) => state.treatment.selectedTime);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [serviceFee, setServiceFee] = useState(0);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
          const config = await getAppConfig();
          setPaymentMethods(config.payment_methods || []);
          
          if (config.treatment_service_types) {
             const type = config.treatment_service_types.find(t => t.id === selectedServiceType?.id);
             if (type) setServiceFee(type.additionalFee);
             else setServiceFee(selectedServiceType?.additionalFee || 0);
          }
      } catch (error) {
         setServiceFee(selectedServiceType?.additionalFee || 0);
      }
    };
    fetchConfig();
  }, [selectedServiceType]);

  const servicePrice = parseFloat(selectedService?.base_price || 0);
  // serviceFee is now state
  const tax = Math.round((servicePrice + serviceFee) * 0.05);
  const total = servicePrice + serviceFee + tax;

  const navigateToTreatmentOrders = () => {
    const rootNavigation = navigation.getParent?.();
    const tabNavigation = rootNavigation?.getParent?.();

    if (tabNavigation) {
      tabNavigation.navigate('Home', {
        screen: 'OrdersStack',
        params: {
          screen: 'OrderTracking',
          params: { filterType: 'treatment' },
        },
      });
      return;
    }

    if (rootNavigation) {
      rootNavigation.navigate('OrdersStack', {
        screen: 'OrderTracking',
        params: { filterType: 'treatment' },
      });
      return;
    }

    navigation.navigate('TreatmentHome');
  };

  const handleConfirmBooking = () => {
    if (!selectedPet || !selectedTreatmentType || !selectedService || !selectedServiceType || !selectedDate || !selectedTime) {
      Alert.alert('Missing Booking Details', 'Please complete the treatment booking details first.');
      return;
    }
    if (!name || !phone || !email || !address) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }
    if (!selectedPayment) {
      Alert.alert('Payment Method', 'Please select a payment method');
      return;
    }

    const bookingData = {
      pet: selectedPet.id,
      treatment_type: selectedTreatmentType.id,
      customer_name: name,
      customer_phone: phone,
      customer_email: email,
      customer_address: address,
      payment_method: selectedPayment,
      service_type:
        selectedServiceType.id === 'pick_up' ? 'pickup' : selectedServiceType.id,
      appointment_date: selectedDate,
      appointment_time: moment(selectedTime, ['hh:mm A', 'HH:mm', 'HH:mm:ss'], true).format('HH:mm:ss'),
    };

    dispatch(createTreatmentBooking(bookingData))
      .unwrap()
      .then(async (result) => {
        dispatch(resetTreatmentSelection());

        if (selectedPayment === 'esewa' && result.order) {
          const paymentResult = await paymentService.payWithEsewa(result.order);
          if (!paymentResult.success) {
            Alert.alert(
              'Payment not completed',
              'Your treatment booking was created, but eSewa payment was not completed. You can check it from My Orders.',
              [{ text: 'View Orders', onPress: navigateToTreatmentOrders }]
            );
            return;
          }
        }

        navigation.navigate('BookingConfirmation', {
          bookingId: result.id,
          orderId: result.order,
          orderNumber: result.order_number || result.order?.order_number || null,
          total,
        });
      })
      .catch((error) => {
        Alert.alert("Booking Failed", error || "Could not create booking");
      });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Booking Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pet</Text>
            <Text style={styles.summaryValue}>{selectedPet?.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Treatment</Text>
            <Text style={styles.summaryValue}>{selectedTreatmentType?.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service</Text>
            <Text style={styles.summaryValue}>{selectedService?.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Type</Text>
            <Text style={styles.summaryValue}>{selectedServiceType?.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date & Time</Text>
            <Text style={styles.summaryValue}>{selectedDate} at {selectedTime}</Text>
          </View>
        </View>

        {/* Personal Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information *</Text>
          <Text style={styles.inputLabel}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />
          <Text style={styles.inputLabel}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <Text style={styles.inputLabel}>Email Address *</Text>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <Text style={styles.inputLabel}>Address *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method *</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[styles.paymentOption, selectedPayment === method.id && styles.selectedPayment]}
              onPress={() => setSelectedPayment(method.id)}
            >
              <Feather name={method.icon} size={24} color={selectedPayment === method.id ? '#FF6B9D' : '#666666'} />
              <Text style={[styles.paymentText, selectedPayment === method.id && styles.selectedPaymentText]}>
                {method.name}
              </Text>
              {selectedPayment === method.id && (
                <Feather name="check-circle" size={20} color="#FF6B9D" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Price Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service Price</Text>
            <Text style={styles.priceValue}>Rs. {servicePrice}</Text>
          </View>
          {serviceFee > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{selectedServiceType?.name || 'Service'} Fee</Text>
              <Text style={styles.priceValue}>Rs. {serviceFee}</Text>
            </View>
          )}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tax (5%)</Text>
            <Text style={styles.priceValue}>Rs. {tax}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>Rs. {total}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmBooking}>
          <Text style={styles.confirmText}>Confirm Booking - Rs. {total}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TreatmentCheckout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#888888',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    fontSize: 15,
    color: '#2C2C2C',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    marginLeft: 4,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  selectedPayment: {
    borderColor: '#FF6B9D',
    backgroundColor: '#FFF5F8',
  },
  paymentText: {
    flex: 1,
    fontSize: 15,
    color: '#666666',
    marginLeft: 12,
  },
  selectedPaymentText: {
    color: '#FF6B9D',
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 15,
    color: '#666666',
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C2C2C',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B9D',
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
