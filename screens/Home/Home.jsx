import { Feather } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import OfferCard from '../../components/ui/OfferCard/OfferCard';
import ProductCard from '../../components/ui/ProductCard/ProductCard';
import ServiceCard from '../../components/ui/ServiceCard/ServiceCard';
import { fetchOffers, fetchProducts, selectOffers, selectProducts } from '../../redux/slice/shoppingSlice';
import { resolveMediaUrl } from '../../services/api';
import { servicesSections } from '../../utils/appData';

const Home = ({ navigation }) => {
  const dispatch = useDispatch();
  const currentPet = useSelector((state) => state.myPet.petData);
  const userName = useSelector((state) => state.myPet.currentPetInfo?.ownerName) || 'Pet Parent';
  const latestOffers = useSelector(selectOffers) || [];
  const bestSellingItems = (useSelector(selectProducts) || []).slice(0, 6);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const loadData = () => {
    dispatch(fetchOffers());
    dispatch(fetchProducts());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    loadData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleServicePress = (route) => {
    const parentNavigation = navigation.getParent?.();

    switch (route) {
      case 'Shopping':
        if (parentNavigation) {
          parentNavigation.navigate('Home', { screen: 'ShoppingStack' });
        } else {
          navigation.navigate('ShoppingStack');
        }
        break;
      case 'Treatment':
        if (parentNavigation) {
          parentNavigation.navigate('Home', { screen: 'TreatmentStack' });
        } else {
          navigation.navigate('TreatmentStack');
        }
        break;
      case 'Pet Hostel':
        if (parentNavigation) {
          parentNavigation.navigate('Home', { screen: 'PetHostelStack' });
        } else {
          navigation.navigate('PetHostelStack');
        }
        break;
      case 'Adoption':
        if (parentNavigation) {
          parentNavigation.navigate('Home', { screen: 'AdoptionStack' });
        } else {
          navigation.navigate('AdoptionStack');
        }
        break;
      default:
        break;
    }
  };

  const handleOfferPress = (offer) => {
    navigation.navigate('ShoppingStack', {
      screen: 'ShoppingHome',
      params: { category: offer.category }
    });
  };

  const handleProductPress = (product) => {
    navigation.navigate('ShoppingStack', {
      screen: 'ProductDetail',
      params: { product }
    });
  };

  const renderServiceCard = ({ item, index }) => (
    <ServiceCard
      title={item.title}
      description={item.description}
      icon={item.icon}
      iconType={item.iconType}
      colors={item.colors}
      onPress={() => handleServicePress(item.route)}
      style={styles.serviceCardWrapper}
    />
  );

  const renderOfferCard = ({ item }) => (
    <View style={styles.offerCardWrapper}>
      <OfferCard
        title={item.title}
        description={item.description}
        discount={item.discount_text || item.discount}
        category={item.category}
        validUntil={item.valid_until || item.validUntil}
        colors={item.colors}
        imageUrl={resolveMediaUrl(item.image)}
        onPress={() => handleOfferPress(item)}
      />
    </View>
  );

  const renderProductCard = ({ item, index }) => (
    <View style={styles.productCardWrapper}>
      <ProductCard
        name={item.name}
        price={item.price}
        rating={item.rating}
        reviews={item.reviews}
        category={item.category}
        onPress={() => handleProductPress(item)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFF5F8', '#FFFFFF', '#F0F9FF']}
        locations={[0, 0.5, 1]}
        style={styles.gradientBackground}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF6B9D"
              colors={['#FF6B9D']}
            />
          }
        >
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{userName}! {String.fromCodePoint(0x1F44B)}</Text>
            </View>
            {currentPet && (
              <View style={styles.petInfo}>
                <Feather name="heart" size={16} color="#FF6B9D" />
                <Text style={styles.petName}>{currentPet.petName}</Text>
              </View>
            )}
          </View>

          {/* Main Services Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, styles.sectionTitlePadded]}>Our Services</Text>
            <FlatList
              data={servicesSections}
              renderItem={renderServiceCard}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.servicesRow}
              contentContainerStyle={styles.servicesContainer}
            />
          </View>

          {/* Latest Offers Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Latest Offers</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={latestOffers}
              renderItem={renderOfferCard}
              keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>

          {/* Best Selling Items Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Best Selling Items</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={bestSellingItems}
              renderItem={renderProductCard}
              keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.productsRow}
              contentContainerStyle={styles.productsContainer}
            />
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C2C2C',
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  petName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B9D',
    marginLeft: 6,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C2C2C',
    letterSpacing: 0.3,
  },
  sectionTitlePadded: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF6B9D',
    fontWeight: '600',
  },
  servicesContainer: {
    paddingHorizontal: 20,
  },
  servicesRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  serviceCardWrapper: {
    width: '48%',
    aspectRatio: 1,
  },
  horizontalList: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  offerCardWrapper: {
    marginRight: 12,
  },
  productsContainer: {
    paddingHorizontal: 20,
  },
  productsRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCardWrapper: {
    width: '48%',
  },
  bottomSpacing: {
    height: 100,
  },
});
