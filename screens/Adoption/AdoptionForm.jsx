import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from "@expo/vector-icons";
import { useDispatch } from 'react-redux';
import { submitAdoptionApplication } from '../../redux/slice/adoptionSlice';

const AdoptionForm = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const pet = route?.params?.pet;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [previousPets, setPreviousPets] = useState('');
  const [reason, setReason] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = () => {
    if (!pet?.id) {
      Alert.alert('Pet Not Found', 'Please select a pet again before submitting.');
      return;
    }
    if (!name || !email || !phone || !address || !previousPets || !reason) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }
    if (!agreedToTerms) {
      Alert.alert('Terms & Conditions', 'Please agree to the terms and conditions');
      return;
    }

    const applicationData = {
      pet: pet.id,
      full_name: name,
      email,
      phone,
      address,
      previous_pets_experience: previousPets,
      reason_for_adoption: reason,
    };

    dispatch(submitAdoptionApplication(applicationData))
      .unwrap()
      .then((result) => {
        Alert.alert(
          'Application Submitted!',
          `Your adoption application for ${pet.name} has been submitted successfully. Application ID: ${result.application_reference || result.id}\n\nWe will review your application and contact you soon.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Home'),
            },
          ]
        );
      })
      .catch((error) => {
        Alert.alert("Submission Failed", error || "Could not submit application");
      });
  };

  return (
    <View style={styles.container}>
      {!pet ? (
        <View style={styles.emptyState}>
          <Feather name="heart" size={64} color="#CCCCCC" />
          <Text style={styles.emptyTitle}>Adoption form not available</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
      <>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Pet Info */}
        <View style={styles.petInfoCard}>
          <Feather name="heart" size={24} color="#FF6B9D" />
          <View style={styles.petInfo}>
            <Text style={styles.petName}>Adopting: {pet.name}</Text>
            <Text style={styles.petBreed}>{pet.breed}</Text>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name *"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email Address *"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number *"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Living Address *"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Adoption Questions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adoption Questions</Text>
          
          <Text style={styles.label}>Have you previously owned pets? *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Please describe your experience with pets"
            value={previousPets}
            onChangeText={setPreviousPets}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Why do you want to adopt {pet.name}? *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell us why you'd like to adopt this pet"
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
          />
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
              I agree to the adoption terms and conditions, and understand that I will be responsible for the pet's care and well-being
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Note */}
        <View style={styles.noteCard}>
          <Feather name="info" size={20} color="#4CAF50" />
          <Text style={styles.noteText}>
            Our team will review your application and contact you within 2-3 business days
          </Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit Application</Text>
        </TouchableOpacity>
      </View>
      </>
      )}
    </View>
  );
};

export default AdoptionForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C2C2C',
    marginTop: 16,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  petInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F8',
    padding: 16,
    margin: 15,
    borderRadius: 12,
    gap: 12,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C2C2C',
  },
  petBreed: {
    fontSize: 14,
    color: '#888888',
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
  label: {
    fontSize: 15,
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
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#2C2C2C',
    lineHeight: 20,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    margin: 15,
    gap: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#2C2C2C',
    lineHeight: 20,
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
