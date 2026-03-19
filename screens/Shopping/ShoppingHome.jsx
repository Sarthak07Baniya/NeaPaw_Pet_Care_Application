import { Feather } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import FilterChip from '../../components/ui/FilterChip/FilterChip';
import ProductCard from '../../components/ui/ProductCard/ProductCard';
import SearchBar from '../../components/ui/SearchBar/SearchBar';
import { addToCart, selectCartCount } from '../../redux/slice/cartSlice';
import { fetchProducts, selectProducts, setSearchQuery, setSelectedCategory, setSortOption } from '../../redux/slice/shoppingSlice';


const ShoppingHome = ({ navigation }) => {
  const dispatch = useDispatch();
  const searchQuery = useSelector((state) => state.shopping.searchQuery);
  const selectedCategory = useSelector((state) => state.shopping.selectedCategory);
  const sortOption = useSelector((state) => state.shopping.sortOption);
  const cartCount = useSelector(selectCartCount);
  const allProducts = useSelector(selectProducts);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const [showSortMenu, setShowSortMenu] = useState(false);

  const productCategories = useMemo(() => {
    const categories = ['All', ...new Set(allProducts.map(p => p.category))];
    return categories;
  }, [allProducts]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    // Filter by category
    if (selectedCategory !== 'All') {
      products = products.filter(p => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort products
    switch (sortOption) {
      case 'price-low':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      default: // popular
        products.sort((a, b) => b.reviews - a.reviews);
    }

    return products;
  }, [allProducts, searchQuery, selectedCategory, sortOption]);

  const handleSearch = () => {
    // Search is already reactive via useMemo
  };

  const handleCategorySelect = (category) => {
    dispatch(setSelectedCategory(category));
  };

  const handleSortSelect = (option) => {
    dispatch(setSortOption(option));
    setShowSortMenu(false);
  };

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const handleCartPress = () => {
    navigation.navigate('ShoppingCart');
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({ productId: product.id, quantity: 1 }));
  };

  const getSortLabel = () => {
    switch (sortOption) {
      case 'price-low': return 'Price: Low to High';
      case 'price-high': return 'Price: High to Low';
      case 'rating': return 'Rating';
      default: return 'Popular';
    }
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productCardWrapper}>
      <ProductCard
        name={item.name}
        price={item.price}
        rating={item.rating}
        reviews={item.reviews_count || item.reviews || 0}
        category={item.category}
        onPress={() => handleProductPress(item)}
        onAddToCart={() => handleAddToCart(item)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with Cart */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.cartButton} onPress={handleCartPress}>
          <Feather name="shopping-cart" size={24} color="#2C2C2C" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={(text) => dispatch(setSearchQuery(text))}
          onSearch={handleSearch}
        />
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {productCategories.map((category) => (
          <FilterChip
            key={category}
            label={category}
            isActive={selectedCategory === category}
            onPress={() => handleCategorySelect(category)}
          />
        ))}
      </ScrollView>

      {/* Sort and Results Count */}
      <View style={styles.sortContainer}>
        <Text style={styles.resultsText}>
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
        </Text>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortMenu(!showSortMenu)}
        >
          <Feather name="sliders" size={18} color="#666666" />
          <Text style={styles.sortText}>{getSortLabel()}</Text>
        </TouchableOpacity>
      </View>

      {/* Sort Menu */}
      {showSortMenu && (
        <View style={styles.sortMenu}>
          {[
            { value: 'popular', label: 'Popular' },
            { value: 'price-low', label: 'Price: Low to High' },
            { value: 'price-high', label: 'Price: High to Low' },
            { value: 'rating', label: 'Rating' },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.sortOption}
              onPress={() => handleSortSelect(option.value)}
            >
              <Text style={[
                styles.sortOptionText,
                sortOption === option.value && styles.sortOptionTextActive
              ]}>
                {option.label}
              </Text>
              {sortOption === option.value && (
                <Feather name="check" size={18} color="#FF6B9D" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="search" size={60} color="#CCCCCC" />
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />
    </View>
  );
};

export default ShoppingHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C2C2C',
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF6B9D',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  cartBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 10,
    marginBottom: 5,
  },
   filterContainer: {
    marginTop: 5,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  resultsText: {
    fontSize: 14,
    color: '#666666',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  sortText: {
    fontSize: 13,
    color: '#666666',
    marginLeft: 6,
  },
  sortMenu: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#666666',
  },
  sortOptionTextActive: {
    color: '#FF6B9D',
    fontWeight: '600',
  },
  productsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCardWrapper: {
    width: '48%',
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