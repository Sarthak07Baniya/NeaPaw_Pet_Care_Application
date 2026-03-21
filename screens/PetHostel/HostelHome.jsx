import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHostelRooms, setCheckInDate, setCheckOutDate, setSelectedPet, setSelectedRoom, setSelectedServiceType } from '../../redux/slice/hostelSlice';
import { hostelServiceTypes as serviceTypes } from '../../utils/appData';

const HostelHome = ({ navigation }) => {
  const dispatch = useDispatch();
  const myPets = useSelector((state) => state.myPet.myPets);
  const rooms = useSelector((state) => state.hostel.rooms);
  const selectedPet = useSelector((state) => state.hostel.selectedPet);
  const selectedRoom = useSelector((state) => state.hostel.selectedRoom);
  const checkInDate = useSelector((state) => state.hostel.checkInDate);
  const checkOutDate = useSelector((state) => state.hostel.checkOutDate);
  const selectedServiceType = useSelector((state) => state.hostel.selectedServiceType);

  useEffect(() => {
    dispatch(fetchHostelRooms());
  }, [dispatch]);

  const [showPetDropdown, setShowPetDropdown] = useState(false);
  const [markedDates, setMarkedDates] = useState({});

  const handlePetSelect = (pet) => {
    dispatch(setSelectedPet(pet));
    setShowPetDropdown(false);
  };

  const handleRoomSelect = (room) => {
    dispatch(setSelectedRoom(room));
  };

  const handleServiceTypeSelect = (serviceType) => {
    dispatch(setSelectedServiceType(serviceType));
  };

  const handleDateSelect = (day) => {
    const dateString = day.dateString;
    
    if (!checkInDate || (checkInDate && checkOutDate)) {
      // Set check-in date
      dispatch(setCheckInDate(dateString));
      dispatch(setCheckOutDate(null));
      setMarkedDates({
        [dateString]: { startingDay: true, color: '#FF6B9D', textColor: 'white' },
      });
    } else if (checkInDate && !checkOutDate) {
      // Set check-out date
      if (dateString > checkInDate) {
        dispatch(setCheckOutDate(dateString));
        const range = getDateRange(checkInDate, dateString);
        setMarkedDates(range);
      }
    }
  };

  const getDateRange = (start, end) => {
    const dates = {};
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    dates[start] = { startingDay: true, color: '#FF6B9D', textColor: 'white' };
    dates[end] = { endingDay: true, color: '#FF6B9D', textColor: 'white' };
    
    let currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + 1);
    
    while (currentDate < endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      dates[dateString] = { color: '#FFE0EC', textColor: '#2C2C2C' };
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  const calculateDays = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleContinue = () => {
    if (!selectedPet || !selectedRoom || !checkInDate || !checkOutDate || !selectedServiceType) {
      alert('Please complete all selections');
      return;
    }
    navigation.navigate('HostelDetails');
  };

  const days = calculateDays();
  const totalPrice = selectedRoom ? parseFloat(selectedRoom.price_per_day) * days + (selectedServiceType?.additionalFee || 0) : 0;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Select Pet */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Pet *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowPetDropdown(!showPetDropdown)}
          >
            <Text style={selectedPet ? styles.dropdownTextSelected : styles.dropdownText}>
              {selectedPet ? selectedPet.name : 'Choose your pet'}
            </Text>
            <Feather name={showPetDropdown ? 'chevron-up' : 'chevron-down'} size={20} color="#666666" />
          </TouchableOpacity>

          {showPetDropdown && (
            <View style={styles.dropdownMenu}>
              {myPets.length === 0 ? (
                <Text style={styles.emptyText}>No pets added yet</Text>
              ) : (
                myPets.map((pet) => (
                  <TouchableOpacity
                    key={pet.id}
                    style={styles.dropdownItem}
                    onPress={() => handlePetSelect(pet)}
                  >
                    <Text style={styles.dropdownItemText}>{pet.name}</Text>
                    {selectedPet?.id === pet.id && (
                      <Feather name="check" size={18} color="#FF6B9D" />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Room *</Text>
          {(rooms || []).map((room) => (
            <TouchableOpacity
              key={room.id}
              style={[styles.roomCard, selectedRoom?.id === room.id && styles.roomCardSelected]}
              onPress={() => handleRoomSelect(room)}
            >
              <View style={styles.roomInfo}>
                <Text style={styles.roomName}>{room.name}</Text>
                <Text style={styles.roomDesc}>{room.description}</Text>
                <View style={styles.features}>
                  {(room.features || []).map((feature, index) => (
                    <View key={feature.id || index} style={styles.featureItem}>
                      <Feather name="check" size={14} color="#4CAF50" />
                      <Text style={styles.featureText}>{feature.text || feature}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.roomPrice}>
                <Text style={styles.priceText}>₹{room.price_per_day}</Text>
                <Text style={styles.perDay}>/day</Text>
                {selectedRoom?.id === room.id && (
                  <Feather name="check-circle" size={20} color="#FF6B9D" style={styles.checkIcon} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Calendar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Check-in / Check-out *</Text>
          <Calendar
            minDate={new Date().toISOString().split('T')[0]}
            onDayPress={handleDateSelect}
            markedDates={markedDates}
            markingType={'period'}
            theme={{
              selectedDayBackgroundColor: '#FF6B9D',
              todayTextColor: '#FF6B9D',
              arrowColor: '#FF6B9D',
            }}
          />
          {checkInDate && checkOutDate && (
            <View style={styles.dateInfo}>
              <Text style={styles.dateText}>
                {checkInDate} to {checkOutDate} ({days} {days === 1 ? 'day' : 'days'})
              </Text>
            </View>
          )}
        </View>

        {/* Service Type */}
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
                  <Text style={styles.additionalFee}>+₹{type.additionalFee}</Text>
                )}
              </View>
              {selectedServiceType?.id === type.id && (
                <Feather name="check-circle" size={20} color="#FF6B9D" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Price Summary */}
        {selectedRoom && days > 0 && (
          <View style={styles.section}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Room ({days} {days === 1 ? 'day' : 'days'})</Text>
              <Text style={styles.priceValue}>₹{parseFloat(selectedRoom.price_per_day) * days}</Text>
            </View>
            {selectedServiceType && selectedServiceType.additionalFee > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>{selectedServiceType.name}</Text>
                <Text style={styles.priceValue}>₹{selectedServiceType.additionalFee}</Text>
              </View>
            )}
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{totalPrice}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedPet || !selectedRoom || !checkInDate || !checkOutDate || !selectedServiceType) &&
              styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>Continue</Text>
          <Feather name="arrow-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HostelHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollContent: {
    paddingBottom: 100,
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
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
  },
  dropdownText: {
    fontSize: 15,
    color: '#999999',
  },
  dropdownTextSelected: {
    fontSize: 15,
    color: '#2C2C2C',
    fontWeight: '600',
  },
  dropdownMenu: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#2C2C2C',
    fontWeight: '500',
  },
  emptyText: {
    padding: 15,
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },
  roomCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
    marginBottom: 12,
  },
  roomCardSelected: {
    borderColor: '#FF6B9D',
    backgroundColor: '#FFF5F8',
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  roomDesc: {
    fontSize: 13,
    color: '#888888',
    marginBottom: 8,
  },
  features: {
    gap: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    color: '#666666',
  },
  roomPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B9D',
  },
  perDay: {
    fontSize: 12,
    color: '#888888',
  },
  checkIcon: {
    marginTop: 8,
  },
  dateInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#2C2C2C',
    textAlign: 'center',
    fontWeight: '600',
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
  continueButtonDisabled: {
    backgroundColor: '#D7A1B5',
  },
  continueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
});
