import * as ImagePicker from 'expo-image-picker';
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createHostelBooking, resetHostelSelection } from '../../redux/slice/hostelSlice';
import { getAppConfig } from '../../services/api';
import { paymentService } from '../../services/paymentService';

const HostelCheckout = ({ navigation }) => {
  const dispatch = useDispatch();
  const selectedPet = useSelector((state) => state.hostel.selectedPet);
  const selectedRoom = useSelector((state) => state.hostel.selectedRoom);
  const checkInDate = useSelector((state) => state.hostel.checkInDate);
  const checkOutDate = useSelector((state) => state.hostel.checkOutDate);
  const selectedServiceType = useSelector((state) => state.hostel.selectedServiceType);
  const additionalTreatments = useSelector((state) => state.hostel.additionalTreatments);
  const petDetails = useSelector((state) => state.hostel.petDetails);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [ownerPhoto, setOwnerPhoto] = useState(null);
  const [policeReport, setPoliceReport] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await getAppConfig();
        setPaymentMethods(config.payment_methods || []);
      } catch (error) {
        console.error("Error loading hostel checkout config", error);
      }
    };
    fetchConfig();
  }, []);

  const pickImage = async (setter, label) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission needed', `Please allow photo library access to upload ${label}.`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length) {
      setter(result.assets[0]);
    }
  };

  const appendImageField = (formData, fieldName, asset) => {
    if (!asset?.uri) {
      return;
    }

    const filename = asset.fileName || `${fieldName}.jpg`;
    const extension = filename.split('.').pop()?.toLowerCase();
    const mimeType =
      asset.mimeType ||
      (extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg');

    formData.append(fieldName, {
      uri: asset.uri,
      name: filename,
      type: mimeType,
    });
  };

  const calculateDays = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const days = calculateDays();
  const roomPrice = parseFloat(selectedRoom?.price_per_day || 0) * days;
  const serviceFee = selectedServiceType?.additionalFee || 0;
  const getTreatmentPrice = (treatment) => Number(treatment?.price || treatment?.base_price || 0);
  const treatmentsTotal = additionalTreatments.reduce((sum, treatment) => sum + getTreatmentPrice(treatment), 0);
  const tax = Math.round((roomPrice + serviceFee + treatmentsTotal) * 0.05);
  const total = roomPrice + serviceFee + treatmentsTotal + tax;

  const formatHostelOrderId = (value) => {
    if (!value) return value;
    return String(value).replace(/^ORD-/i, 'HOSTEL-');
  };

  const navigateToOrders = () => {
    const rootNavigation = navigation.getParent?.();
    const tabNavigation = rootNavigation?.getParent?.();

    if (tabNavigation) {
      tabNavigation.navigate('Home', {
        screen: 'OrdersStack',
        params: {
          screen: 'OrderTracking',
          params: {
            filterType: 'hostel',
          },
        },
      });
      return;
    }

    if (rootNavigation) {
      rootNavigation.navigate('OrdersStack', {
        screen: 'OrderTracking',
        params: {
          filterType: 'hostel',
        },
      });
      return;
    }

    navigation.navigate('HostelHome');
  };

  const handleConfirmBooking = () => {
    if (!selectedPet || !selectedRoom || !checkInDate || !checkOutDate || !selectedServiceType) {
      Alert.alert('Incomplete Booking', 'Please complete the hostel selections first.');
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
    if (!ownerPhoto || !policeReport) {
      Alert.alert('Missing Documents', 'Please upload your photo and police report.');
      return;
    }
    if (!agreedToTerms) {
      Alert.alert('Terms & Conditions', 'Please agree to the terms and conditions');
      return;
    }

    const bookingData = new FormData();
    bookingData.append('pet', String(selectedPet.id));
    bookingData.append('room', String(selectedRoom.id));
    bookingData.append('check_in_date', checkInDate);
    bookingData.append('check_out_date', checkOutDate);
    bookingData.append('service_type', selectedServiceType.id === 'self' ? 'store_visit' : selectedServiceType.id);
    bookingData.append('name', name);
    bookingData.append('full_name', name);
    bookingData.append('phone', phone);
    bookingData.append('email', email);
    bookingData.append('address', address);
    bookingData.append('address_line1', address);
    bookingData.append('payment_method', selectedPayment);
    bookingData.append('allergies', petDetails.allergies || '');
    bookingData.append('health_conditions', petDetails.allergies || '');
    bookingData.append('diet_type', (petDetails.diet || 'Carnivore').toLowerCase().replace(/\s+/g, '_'));
    bookingData.append('pet_nature', petDetails.nature || 'Friendly');
    bookingData.append('vaccination_status', petDetails.vaccinated ? 'up_to_date' : 'not_updated');
    bookingData.append('communicable_disease', petDetails.communicableDisease ? 'true' : 'false');
    bookingData.append('total_price', String(total));
    additionalTreatments.forEach((treatment) => {
      if (treatment?.backendId) {
        bookingData.append('additional_treatments', String(treatment.backendId));
      }
      if (treatment?.name) {
        bookingData.append('additional_treatment_labels', String(treatment.name));
      }
    });
    appendImageField(bookingData, 'owner_photo', ownerPhoto);
    appendImageField(bookingData, 'police_report', policeReport);

    dispatch(createHostelBooking(bookingData))
      .unwrap()
      .then(async (result) => {
        dispatch(resetHostelSelection());

        if (selectedPayment === 'esewa' && result.order) {
          const paymentResult = await paymentService.payWithEsewa(result.order);
          if (!paymentResult.success) {
            Alert.alert(
              'Payment not completed',
              'Your hostel booking was created, but eSewa payment was not completed. You can check it from My Orders.',
              [{ text: 'View Orders', onPress: navigateToOrders }]
            );
            return;
          }
        }

        const orderNumber = formatHostelOrderId(
          result?.order_number || result?.order?.order_number || result?.order || result?.id
        );
        Alert.alert(
          'Booking Confirmed!',
          `Your hostel booking has been confirmed. Order ID: #${orderNumber}`,
          [{ text: 'OK', onPress: navigateToOrders }]
        );
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
            <Text style={styles.summaryLabel}>Room</Text>
            <Text style={styles.summaryValue}>{selectedRoom?.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Check-in</Text>
            <Text style={styles.summaryValue}>{checkInDate}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Check-out</Text>
            <Text style={styles.summaryValue}>{checkOutDate}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>{days} {days === 1 ? 'day' : 'days'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Type</Text>
            <Text style={styles.summaryValue}>{selectedServiceType?.name}</Text>
          </View>
          {additionalTreatments.length > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Additional Treatments</Text>
              <Text style={styles.summaryValue}>{additionalTreatments.length}</Text>
            </View>
          )}
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

          <Text style={styles.sectionTitle}>KYC Documents *</Text>
          <TouchableOpacity
            style={styles.uploadCard}
            onPress={() => pickImage(setOwnerPhoto, 'your photo')}
          >
            <View style={styles.uploadPreview}>
              {ownerPhoto?.uri ? (
                <Image source={{ uri: ownerPhoto.uri }} style={styles.uploadImage} />
              ) : (
                <Feather name="camera" size={26} color="#FF6B9D" />
              )}
            </View>
            <View style={styles.uploadInfo}>
              <Text style={styles.uploadTitle}>Upload Photo *</Text>
              <Text style={styles.uploadSubtitle}>
                {ownerPhoto?.fileName || 'Upload your recent clear photo'}
              </Text>
            </View>
            <Feather name="upload" size={20} color="#888888" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.uploadCard}
            onPress={() => pickImage(setPoliceReport, 'police report')}
          >
            <View style={styles.uploadPreview}>
              {policeReport?.uri ? (
                <Image source={{ uri: policeReport.uri }} style={styles.uploadImage} />
              ) : (
                <Feather name="shield" size={26} color="#FF6B9D" />
              )}
            </View>
            <View style={styles.uploadInfo}>
              <Text style={styles.uploadTitle}>Police Report *</Text>
              <Text style={styles.uploadSubtitle}>
                {policeReport?.fileName || 'Upload police report image'}
              </Text>
            </View>
            <Feather name="upload" size={20} color="#888888" />
          </TouchableOpacity>
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
            <Text style={styles.priceLabel}>Room ({days} {days === 1 ? 'day' : 'days'})</Text>
            <Text style={styles.priceValue}>Rs. {roomPrice}</Text>
          </View>
          {serviceFee > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{selectedServiceType.name}</Text>
              <Text style={styles.priceValue}>Rs. {serviceFee}</Text>
            </View>
          )}
          {additionalTreatments.map((treatment) => (
            <View key={treatment.id} style={styles.priceRow}>
              <Text style={styles.priceLabel}>{treatment.name}</Text>
              <Text style={styles.priceValue}>Rs. {getTreatmentPrice(treatment)}</Text>
            </View>
          ))}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tax (5%)</Text>
            <Text style={styles.priceValue}>Rs. {tax}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>Rs. {total}</Text>
          </View>
        </View>

        {/* Terms & Conditions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
          >
            <Feather name={agreedToTerms ? 'check-square' : 'square'}
              size={20}
              color={agreedToTerms ? '#FF6B9D' : '#666666'}
            />
            <Text style={styles.termsText}>
              I agree to the terms and conditions for pet hostel services
              {' *'}
            </Text>
          </TouchableOpacity>
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

export default HostelCheckout;

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
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  uploadPreview: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#FFF5F8',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  uploadImage: {
    width: '100%',
    height: '100%',
  },
  uploadInfo: {
    flex: 1,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: '#888888',
    lineHeight: 18,
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#2C2C2C',
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
