import { Feather } from "@expo/vector-icons";
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedDate, setSelectedServiceType, setSelectedTime } from '../../redux/slice/treatmentSlice';
import { availableTimeSlots } from '../../utils/appData';

// Backend expects 'store_visit' or 'pick_up'
const serviceTypes = [
  {
    id: 'store_visit',
    name: 'Store Visit',
    description: 'Bring your pet to our center',
    icon: 'home',
    additionalFee: 0,
  },
  {
    id: 'pick_up',
    name: 'Pick Up & Drop',
    description: 'We pick up and drop your pet',
    icon: 'truck',
    additionalFee: 500,
  },
];

const ServiceBooking = ({ navigation }) => {
  const dispatch = useDispatch();
  const selectedServiceType = useSelector((state) => state.treatment.selectedServiceType);
  const selectedDate = useSelector((state) => state.treatment.selectedDate);
  const selectedTime = useSelector((state) => state.treatment.selectedTime);
  const selectedService = useSelector((state) => state.treatment.selectedService);

  const [markedDates, setMarkedDates] = useState({});

  const handleServiceTypeSelect = (serviceType) => {
    dispatch(setSelectedServiceType(serviceType));
  };

  const handleDateSelect = (day) => {
    const dateString = day.dateString;
    dispatch(setSelectedDate(dateString));
    setMarkedDates({
      [dateString]: {
        selected: true,
        selectedColor: '#FF6B9D',
      },
    });
  };

  const handleTimeSelect = (time) => {
    dispatch(setSelectedTime(time));
  };

  const handleContinue = () => {
    if (!selectedServiceType || !selectedDate || !selectedTime) {
      alert('Please select service type, date, and time');
      return;
    }
    navigation.navigate('TreatmentCheckout');
  };

  const getTotalPrice = () => {
    const servicePrice = parseFloat(selectedService?.base_price || 0);
    const serviceFee = selectedServiceType?.additionalFee || 0;
    return servicePrice + serviceFee;
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Service Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Type *</Text>
          {serviceTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.serviceTypeCard,
                selectedServiceType?.id === type.id && styles.serviceTypeCardSelected,
              ]}
              onPress={() => handleServiceTypeSelect(type)}
            >
              <Feather name={type.icon}
                size={24}
                color={selectedServiceType?.id === type.id ? '#FF6B9D' : '#666666'}
              />
              <View style={styles.serviceTypeInfo}>
                <Text style={styles.serviceTypeName}>{type.name}</Text>
                <Text style={styles.serviceTypeDesc}>{type.description}</Text>
                {type.additionalFee > 0 && (
                  <Text style={styles.additionalFee}>+Rs. {type.additionalFee}</Text>
                )}
              </View>
              {selectedServiceType?.id === type.id && (
                <Feather name="check-circle" size={20} color="#FF6B9D" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Calendar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date *</Text>
          <Calendar
            minDate={new Date().toISOString().split('T')[0]}
            onDayPress={handleDateSelect}
            markedDates={markedDates}
            theme={{
              selectedDayBackgroundColor: '#FF6B9D',
              todayTextColor: '#FF6B9D',
              arrowColor: '#FF6B9D',
            }}
          />
        </View>

        {/* Time Slots */}
        {selectedDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Time *</Text>
            <View style={styles.timeGrid}>
              {availableTimeSlots.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeSlot,
                    selectedTime === time && styles.timeSlotSelected,
                  ]}
                  onPress={() => handleTimeSelect(time)}
                >
                  <Text
                    style={[
                      styles.timeText,
                      selectedTime === time && styles.timeTextSelected,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Price Summary */}
        {selectedServiceType && (
          <View style={styles.section}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service Price</Text>
              <Text style={styles.priceValue}>Rs. {selectedService?.base_price || 0}</Text>
            </View>
            {selectedServiceType.additionalFee > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>{selectedServiceType.name} Fee</Text>
                <Text style={styles.priceValue}>Rs. {selectedServiceType.additionalFee}</Text>
              </View>
            )}
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>Rs. {getTotalPrice()}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Continue Button */}
      {selectedServiceType && selectedDate && selectedTime && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueText}>Continue to Payment</Text>
            <Feather name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ServiceBooking;

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
  serviceTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
    marginBottom: 12,
  },
  serviceTypeCardSelected: {
    borderColor: '#FF6B9D',
    backgroundColor: '#FFF5F8',
  },
  serviceTypeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  serviceTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  serviceTypeDesc: {
    fontSize: 13,
    color: '#888888',
  },
  additionalFee: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B9D',
    marginTop: 4,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlot: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
  },
  timeSlotSelected: {
    borderColor: '#FF6B9D',
    backgroundColor: '#FF6B9D',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  timeTextSelected: {
    color: '#FFFFFF',
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
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  continueButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF6B9D',
    paddingVertical: 16,
    borderRadius: 12,
  },
  continueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
});
