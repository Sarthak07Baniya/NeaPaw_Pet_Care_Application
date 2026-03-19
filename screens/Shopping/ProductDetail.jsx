import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ReviewCard from '../../components/ui/ReviewCard/ReviewCard';
import { addToCart } from '../../redux/slice/cartSlice';
import { fetchProductReviews } from '../../redux/slice/shoppingSlice';

const ProductDetail = ({ route, navigation }) => {
  const product = route?.params?.product;
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const reviews = useSelector((state) => state.shopping.productReviews) || [];

  useEffect(() => {
    if (product?.id) {
      dispatch(fetchProductReviews(product.id));
    }
  }, [dispatch, product?.id]);

  const handleAddToCart = () => {
    dispatch(addToCart({ productId: product.id, quantity }));
    // Item added silently, user can see cart badge update
  };

  const handleBuyNow = () => {
    dispatch(addToCart({ productId: product.id, quantity }));
    navigation.navigate('ShoppingCart');
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(product?.rating || 0);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Feather key={i}
          name="star"
          size={16}
          color={i < fullStars ? '#FFB800' : '#E0E0E0'}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      {!product ? (
        <View style={styles.emptyState}>
          <Feather name="package" size={64} color="#CCCCCC" />
          <Text style={styles.emptyTitle}>Product not available</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
      <>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Feather name="package" size={100} color="#CCCCCC" />
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.name}>{product.name}</Text>
          
          <View style={styles.ratingRow}>
            <View style={styles.stars}>{renderStars()}</View>
            <Text style={styles.ratingText}>{product.rating}</Text>
            <Text style={styles.reviewsText}>({product.reviews} reviews)</Text>
          </View>

          <Text style={styles.price}>₹{product.price}</Text>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Feather name="minus" size={18} color="#666666" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Feather name="plus" size={18} color="#666666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {product.description || 'High-quality product for your beloved pet. Made with premium materials and designed for comfort and durability.'}
            </Text>
          </View>

          {/* Reviews */}
          {reviews.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customer Reviews</Text>
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Feather name="shopping-cart" size={20} color="#FF6B9D" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
      </>
      )}
    </View>
  );
};

export default ProductDetail;

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
  category: {
    fontSize: 12,
    color: '#888888',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FF6B9D',
    marginBottom: 20,
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginRight: 15,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
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
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF6B9D',
    marginRight: 10,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B9D',
    marginLeft: 8,
  },
  buyNowButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FF6B9D',
  },
  buyNowText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
