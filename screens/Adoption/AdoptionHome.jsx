import { Feather } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import FilterChip from '../../components/ui/FilterChip/FilterChip';
import SearchBar from '../../components/ui/SearchBar/SearchBar';
import { fetchAdoptionPets, selectAdoptionPets } from '../../redux/slice/adoptionSlice';

const AdoptionHome = ({ navigation }) => {
  const dispatch = useDispatch();
  const adoptablePets = useSelector(selectAdoptionPets);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    dispatch(fetchAdoptionPets());
  }, [dispatch]);

  const petTypes = useMemo(() => {
    const types = ['All', ...new Set((adoptablePets || []).map(p => p.pet_type))];
    return types;
  }, [adoptablePets]);

  const filteredPets = useMemo(() => {
    let pets = Array.isArray(adoptablePets) ? [...adoptablePets] : [];

    if (selectedType !== 'All') {
      pets = pets.filter(p => p.pet_type === selectedType);
    }

    if (searchQuery.trim()) {
      pets = pets.filter(p =>
        (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.breed || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return pets;
  }, [adoptablePets, searchQuery, selectedType]);

  const renderPetCard = ({ item }) => (
    <TouchableOpacity
      style={styles.petCard}
      onPress={() => navigation.navigate('PetDetails', { pet: item })}
    >
      <View style={styles.imageContainer}>
        {item.photo ? (
          <Feather name="image" size={60} color="#CCCCCC" /> // Should ideally use Image component with item.photo
        ) : (
          <Feather name="image" size={60} color="#CCCCCC" />
        )}
      </View>
      <View style={styles.petInfo}>
        <Text style={styles.petName}>{item.name}</Text>
        <Text style={styles.petBreed}>{item.breed}</Text>
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Feather name="calendar" size={12} color="#888888" />
            <Text style={styles.detailText}>{item.age_months}m</Text>
          </View>
          <View style={styles.detailItem}>
            <Feather name={item.gender === 'Male' ? 'user' : 'user'} size={12} color="#888888" />
            <Text style={styles.detailText}>{item.gender}</Text>
          </View>
          <View style={styles.detailItem}>
            <Feather name="activity" size={12} color="#888888" />
            <Text style={styles.detailText}>{item.weight}kg</Text>
          </View>
        </View>
        <View style={styles.ratingRow}>
          <Feather name="star" size={14} color="#FFD700" />
          <Text style={styles.rating}>{item.rating || '4.5'}</Text>
          <Text style={styles.reviews}>({item.reviews_count || '0'} reviews)</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Your Companion</Text>
        <Text style={styles.headerSubtitle}>Adopt a pet and give them a loving home</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name or breed"
        />
      </View>

      {/* Filter Chips */}
 <ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.filterContent}
  style={styles.filterContainer}
  keyboardShouldPersistTaps="handled"
>
  {petTypes.map((type) => (
    <FilterChip
      key={type}
      label={type}
      isActive={selectedType === type}
      onPress={() => setSelectedType(type)}
    />
  ))}
</ScrollView>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredPets.length} {filteredPets.length === 1 ? 'pet' : 'pets'} available
        </Text>
      </View>

      {/* Pets List */}
      <FlatList
        data={filteredPets}
        renderItem={renderPetCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="search" size={60} color="#CCCCCC" />
            <Text style={styles.emptyText}>No pets found</Text>
          </View>
        }
      />
    </View>
  );
};

export default AdoptionHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#888888',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
   filterContainer: {
    marginTop: 12,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  resultsText: {
    fontSize: 14,
    color: '#666666',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  petCard: {
    width: '48%',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petInfo: {
    padding: 12,
  },
  petName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 2,
  },
  petBreed: {
    fontSize: 13,
    color: '#888888',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 11,
    color: '#888888',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C2C2C',
    marginLeft: 4,
  },
  reviews: {
    fontSize: 12,
    color: '#888888',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#888888',
    marginTop: 15,
  },
});
