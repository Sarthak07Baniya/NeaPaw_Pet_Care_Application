import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from "@expo/vector-icons";

const PetDetails = ({ route, navigation }) => {
  const pet = route?.params?.pet;

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(pet?.rating || 0);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Feather key={i}
          name="star"
          size={16}
          color={i < fullStars ? '#FFD700' : '#E0E0E0'}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      {!pet ? (
        <View style={styles.emptyState}>
          <Feather name="heart" size={64} color="#CCCCCC" />
          <Text style={styles.emptyTitle}>Pet details not available</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
      <>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Pet Image */}
        <View style={styles.imageContainer}>
          <Feather name="image" size={100} color="#CCCCCC" />
        </View>

        {/* Pet Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{pet.name}</Text>
          <Text style={styles.breed}>{pet.breed}</Text>

          <View style={styles.ratingRow}>
            <View style={styles.stars}>{renderStars()}</View>
            <Text style={styles.ratingText}>{pet.rating || '4.5'}</Text>
            <Text style={styles.reviewsText}>({pet.reviews_count || pet.reviews || 0} reviews)</Text>
          </View>

          {/* Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailCard}>
              <Feather name="calendar" size={24} color="#FF6B9D" />
              <Text style={styles.detailLabel}>Age</Text>
              <Text style={styles.detailValue}>{pet.age || `${pet.age_months || 0} months`}</Text>
            </View>
            <View style={styles.detailCard}>
              <Feather name="user" size={24} color="#FF6B9D" />
              <Text style={styles.detailLabel}>Sex</Text>
              <Text style={styles.detailValue}>{pet.sex || pet.gender || 'Unknown'}</Text>
            </View>
            <View style={styles.detailCard}>
              <Feather name="activity" size={24} color="#FF6B9D" />
              <Text style={styles.detailLabel}>Weight</Text>
              <Text style={styles.detailValue}>{pet.weight ? `${pet.weight} kg` : 'N/A'}</Text>
            </View>
          </View>

          {/* Badges */}
          <View style={styles.badgesRow}>
            {pet.vaccinated && (
              <View style={styles.badge}>
                <Feather name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.badgeText}>Vaccinated</Text>
              </View>
            )}
            {pet.trained && (
              <View style={styles.badge}>
                <Feather name="award" size={16} color="#4CAF50" />
                <Text style={styles.badgeText}>Trained</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About {pet.name}</Text>
            <Text style={styles.description}>{pet.description || 'No description available.'}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Adopt Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.adoptButton}
          onPress={() => navigation.navigate('AdoptionForm', { pet })}
        >
          <Text style={styles.adoptText}>Adopt {pet.name}</Text>
          <Feather name="heart" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      </>
      )}
    </View>
  );
};

export default PetDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 20,
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
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  breed: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2C2C',
    marginRight: 4,
  },
  reviewsText: {
    fontSize: 14,
    color: '#888888',
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailCard: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#888888',
    marginTop: 8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2C2C',
    marginTop: 4,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
  },
  bottomBar: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  adoptButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF6B9D',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  adoptText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
