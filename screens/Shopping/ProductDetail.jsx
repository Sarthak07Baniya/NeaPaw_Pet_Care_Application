import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ReviewCard from '../../components/ui/ReviewCard/ReviewCard';
import { addToCart, selectCartItems } from '../../redux/slice/cartSlice';
import { fetchProductReviews } from '../../redux/slice/shoppingSlice';
import { resolveMediaUrl } from '../../services/api';
import { favouriteService } from '../../services/favouriteService';
import { shoppingService } from '../../services/shoppingService';

const ProductDetail = ({ route, navigation }) => {
  const routeProduct = route?.params?.product;
  const canReview = Boolean(route?.params?.canReview);
  const dispatch = useDispatch();
  const [product, setProduct] = useState(routeProduct || null);
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const reviews = useSelector((state) => state.shopping.productReviews) || [];
  const cartItems = useSelector(selectCartItems);
  const stockQuantity = Number(product?.stock_quantity || 0);
  const isOutOfStock = !product?.in_stock || stockQuantity <= 0;
  const quantityInCart = cartItems
    .filter((item) => (item?.product?.id || item?.productId) === product?.id)
    .reduce((total, item) => total + (item?.quantity || 0), 0);
  const remainingStock = Math.max(stockQuantity - quantityInCart, 0);

  useEffect(() => {
    setProduct(routeProduct || null);
  }, [routeProduct]);

  useEffect(() => {
    const fetchLatestProduct = async () => {
      if (!routeProduct?.id) {
        return;
      }

      try {
        const latestProduct = await shoppingService.getProduct(routeProduct.id);
        setProduct(latestProduct);
      } catch (error) {
        // Keep the route product as a fallback if the refresh fails.
      }
    };

    fetchLatestProduct();
  }, [routeProduct?.id]);

  useEffect(() => {
    if (product?.id) {
      dispatch(fetchProductReviews(product.id));
    }
  }, [dispatch, product?.id]);

  const syncFavouriteState = useCallback(async () => {
    if (!product?.id) {
      setIsFavorite(false);
      return;
    }

    const favourite = await favouriteService.isFavourite(product.id);
    setIsFavorite(favourite);
  }, [product?.id]);

  useEffect(() => {
    syncFavouriteState();
  }, [syncFavouriteState]);

  useFocusEffect(
    useCallback(() => {
      syncFavouriteState();
    }, [syncFavouriteState])
  );

  useEffect(() => {
    if (remainingStock > 0 && quantity > remainingStock) {
      setQuantity(remainingStock);
    }
  }, [quantity, remainingStock]);

  const handleAddToCart = () => {
    if (!product?.id) {
      return;
    }

    if (isOutOfStock || remainingStock <= 0) {
      Alert.alert('Out of stock', 'This product is currently out of stock.');
      return;
    }

    if (quantity > remainingStock) {
      Alert.alert('Stock limit reached', `Only ${remainingStock} more unit${remainingStock === 1 ? '' : 's'} available in stock.`);
      return;
    }

    dispatch(addToCart({ productId: product.id, quantity }));
    // Item added silently, user can see cart badge update
  };

  const handleBuyNow = () => {
    if (!product?.id) {
      return;
    }

    if (isOutOfStock || remainingStock <= 0) {
      Alert.alert('Out of stock', 'This product is currently out of stock.');
      return;
    }

    if (quantity > remainingStock) {
      Alert.alert('Stock limit reached', `Only ${remainingStock} more unit${remainingStock === 1 ? '' : 's'} available in stock.`);
      return;
    }

    dispatch(addToCart({ productId: product.id, quantity }));
    navigation.navigate('ShoppingCart');
  };

  const handleSubmitReview = async () => {
    const trimmedComment = reviewComment.trim();

    if (!product?.id) {
      return;
    }

    if (!trimmedComment || trimmedComment.length < 10) {
      Alert.alert('Review too short', 'Please write at least 10 characters in your review.');
      return;
    }

    try {
      setSubmittingReview(true);
      await shoppingService.addProductReview(product.id, {
        rating: reviewRating,
        comment: trimmedComment,
      });
      setReviewComment('');
      setReviewRating(5);
      dispatch(fetchProductReviews(product.id));
      Alert.alert('Review submitted', 'Your review has been added successfully.');
    } catch (error) {
      Alert.alert(
        'Unable to submit review',
        error?.data?.comment?.[0] || error?.message || 'Please try again.'
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleToggleFavourite = async () => {
    if (!product) {
      return;
    }

    const result = await favouriteService.toggleFavourite(product);
    setIsFavorite(result.isFavourite);
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

  const imageUrl = resolveMediaUrl(
    product?.images?.find((image) => image.is_primary)?.image || product?.images?.[0]?.image
  );

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
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.productImage} resizeMode="cover" />
          ) : (
            <Feather name="package" size={100} color="#CCCCCC" />
          )}
          <TouchableOpacity style={styles.favoriteButton} onPress={handleToggleFavourite} activeOpacity={0.85}>
            <Feather name="heart" size={22} color={isFavorite ? "#FF6B9D" : "#999999"} />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.name}>{product.name}</Text>
          
          <View style={styles.ratingRow}>
            <View style={styles.stars}>{renderStars()}</View>
            <Text style={styles.ratingText}>{product.rating}</Text>
            <Text style={styles.reviewsText}>({product.reviews_count || product.reviews || 0} reviews)</Text>
          </View>

          <Text style={styles.price}>₹{product.price}</Text>
          <Text style={[styles.stockText, isOutOfStock ? styles.outOfStockText : styles.inStockText]}>
            {isOutOfStock
              ? 'Out of Stock'
              : `${remainingStock} available${quantityInCart > 0 ? ` (${quantityInCart} already in cart)` : ''}`}
          </Text>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={isOutOfStock || remainingStock <= 0}
              >
                <Feather name="minus" size={18} color="#666666" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={[styles.quantityButton, (isOutOfStock || quantity >= remainingStock) && styles.quantityButtonDisabled]}
                onPress={() => {
                  if (quantity < remainingStock) {
                    setQuantity(quantity + 1);
                  } else {
                    Alert.alert('Stock limit reached', `Only ${remainingStock} more unit${remainingStock === 1 ? '' : 's'} available in stock.`);
                  }
                }}
                disabled={isOutOfStock || remainingStock <= 0}
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

          {canReview && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Write a Review</Text>
              <View style={styles.reviewStarsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setReviewRating(star)}
                    style={styles.reviewStarButton}
                    activeOpacity={0.8}
                  >
                    <Feather
                      name="star"
                      size={24}
                      color={star <= reviewRating ? '#FFB800' : '#E0E0E0'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.reviewInput}
                value={reviewComment}
                onChangeText={setReviewComment}
                multiline
                placeholder="Share your experience with this product"
                placeholderTextColor="#999999"
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.submitReviewButton, submittingReview && styles.submitReviewButtonDisabled]}
                onPress={handleSubmitReview}
                disabled={submittingReview}
              >
                <Text style={styles.submitReviewText}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

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
        <TouchableOpacity
          style={[styles.addToCartButton, isOutOfStock && styles.actionButtonDisabled]}
          onPress={handleAddToCart}
          disabled={isOutOfStock}
        >
          <Feather name="shopping-cart" size={20} color="#FF6B9D" />
          <Text style={styles.addToCartText}>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buyNowButton, isOutOfStock && styles.buyNowButtonDisabled]}
          onPress={handleBuyNow}
          disabled={isOutOfStock}
        >
          <Text style={styles.buyNowText}>{isOutOfStock ? 'Unavailable' : 'Buy Now'}</Text>
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
  productImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
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
  stockText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 20,
  },
  inStockText: {
    color: '#2E8B57',
  },
  outOfStockText: {
    color: '#D9534F',
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
  quantityButtonDisabled: {
    opacity: 0.5,
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
  reviewStarsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reviewStarButton: {
    marginRight: 8,
  },
  reviewInput: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#2C2C2C',
    backgroundColor: '#FAFAFA',
    marginBottom: 14,
  },
  submitReviewButton: {
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitReviewButtonDisabled: {
    opacity: 0.7,
  },
  submitReviewText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
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
  actionButtonDisabled: {
    borderColor: '#D9D9D9',
    opacity: 0.7,
  },
  buyNowButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FF6B9D',
  },
  buyNowButtonDisabled: {
    backgroundColor: '#D9D9D9',
  },
  buyNowText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
