import { Feather } from "@expo/vector-icons";
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setPetDetails, toggleAdditionalTreatment } from '../../redux/slice/hostelSlice';
import { additionalHostelTreatments as additionalTreatments, dietOptions, petNatureOptions } from '../../utils/appData';

const HostelDetails = ({ navigation }) => {
  const dispatch = useDispatch();
  const selectedTreatments = useSelector((state) => state.hostel.additionalTreatments);
  const petDetails = useSelector((state) => state.hostel.petDetails);

  const [allergies, setAllergies] = useState(petDetails.allergies || '');
  const [diet, setDiet] = useState(petDetails.diet || '');
  const [nature, setNature] = useState(petDetails.nature || '');
  const [vaccinated, setVaccinated] = useState(petDetails.vaccinated || false);
  const [communicableDisease, setCommunicableDisease] = useState(petDetails.communicableDisease || false);

  const handleTreatmentToggle = (treatment) => {
    dispatch(toggleAdditionalTreatment(treatment));
  };

  const handleContinue = () => {
    dispatch(setPetDetails({
      allergies,
      diet,
      nature,
      vaccinated,
      communicableDisease,
    }));
    navigation.navigate('HostelCheckout');
  };

  const isTreatmentSelected = (treatmentId) => {
    return selectedTreatments.some(t => t.id === treatmentId);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Additional Treatments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Treatments (Optional)</Text>
          <Text style={styles.sectionDesc}>Select one or more additional services</Text>
          {additionalTreatments.map((treatment) => (
            <TouchableOpacity
              key={treatment.id}
              style={[
                styles.treatmentCard,
                isTreatmentSelected(treatment.id) && styles.treatmentCardSelected,
              ]}
              onPress={() => handleTreatmentToggle(treatment)}
            >
              <View style={styles.treatmentInfo}>
                <Text style={styles.treatmentName}>{treatment.name}</Text>
                <Text style={styles.treatmentPrice}>₹{treatment.price}</Text>
              </View>
              {isTreatmentSelected(treatment.id) && (
                <Feather name="check-circle" size={20} color="#FF6B9D" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Pet Health Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pet Health Information</Text>
          
          <Text style={styles.label}>Allergies / Health Conditions</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe any allergies or health conditions"
            value={allergies}
            onChangeText={setAllergies}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Diet Type</Text>
          <View style={styles.optionsGrid}>
            {dietOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.optionChip, diet === option && styles.optionChipSelected]}
                onPress={() => setDiet(option)}
              >
                <Text style={[styles.optionText, diet === option && styles.optionTextSelected]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Pet Nature</Text>
          <View style={styles.optionsGrid}>
            {petNatureOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.optionChip, nature === option && styles.optionChipSelected]}
                onPress={() => setNature(option)}
              >
                <Text style={[styles.optionText, nature === option && styles.optionTextSelected]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Vaccination Up to Date?</Text>
            <Switch
              value={vaccinated}
              onValueChange={setVaccinated}
              trackColor={{ false: '#E0E0E0', true: '#FFB3D1' }}
              thumbColor={vaccinated ? '#FF6B9D' : '#f4f3f4'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Any Communicable Disease?</Text>
            <Switch
              value={communicableDisease}
              onValueChange={setCommunicableDisease}
              trackColor={{ false: '#E0E0E0', true: '#FFB3D1' }}
              thumbColor={communicableDisease ? '#FF6B9D' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Document Upload Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Required Documents</Text>
          <View style={styles.noteCard}>
            <Feather name="info" size={20} color="#4CAF50" />
            <Text style={styles.noteText}>
              Please bring vaccination records and pet ID during check-in
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueText}>Continue to Payment</Text>
          <Feather name="arrow-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HostelDetails;

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
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 15,
  },
  treatmentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
    marginBottom: 12,
  },
  treatmentCardSelected: {
    borderColor: '#FF6B9D',
    backgroundColor: '#FFF5F8',
  },
  treatmentInfo: {
    flex: 1,
  },
  treatmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  treatmentPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 10,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    fontSize: 15,
    color: '#2C2C2C',
    marginBottom: 15,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  optionChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
  },
  optionChipSelected: {
    borderColor: '#FF6B9D',
    backgroundColor: '#FF6B9D',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  switchLabel: {
    fontSize: 15,
    color: '#2C2C2C',
    flex: 1,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    gap: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#2C2C2C',
    lineHeight: 20,
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
