import { Feather } from "@expo/vector-icons";
import { useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import CartItem from '../../components/ui/CartItem/CartItem';
import { fetchCart, removeFromCart, selectCartItems, selectCartTotal, updateCartItem } from '../../redux/slice/cartSlice';

const ShoppingCart = ({ navigation }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const deliveryFee = cartTotal > 0 ? 50 : 0;
  const tax = Math.round(cartTotal * 0.05); // 5% tax
  const total = cartTotal + deliveryFee + tax;

  const handleUpdateQuantity = (productId, quantity) => {
    const item = cartItems.find((cartItem) => (cartItem.product?.id || cartItem.productId) === productId);
    if (item) {
      const stockQuantity = Number(item?.product?.stock_quantity || 0);
      const isOutOfStock = !item?.product?.in_stock || stockQuantity <= 0;

      if (isOutOfStock) {
        Alert.alert('Out of stock', 'This product is currently out of stock.');
        return;
      }

      if (quantity > stockQuantity) {
        Alert.alert('Stock limit reached', `Only ${stockQuantity} unit${stockQuantity === 1 ? '' : 's'} available in stock.`);
        return;
      }

      dispatch(updateCartItem({ itemId: item.id, quantity }));
    }
  };

  const handleRemove = (productId) => {
    const item = cartItems.find((cartItem) => (cartItem.product?.id || cartItem.productId) === productId);
    if (item) {
      dispatch(removeFromCart(item.id));
    }
  };

  const handleCheckout = () => {
    navigation.navigate('Checkout');
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="shopping-cart" size={80} color="#CCCCCC" />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyText}>Add some products to get started!</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.shopButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.itemsContainer}>
          {cartItems.filter(Boolean).map((item) => (
            <CartItem
              key={(item?.product?.id || item?.productId || item?.id).toString()}
              item={item}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemove}
            />
          ))}
        </View>

        {/* Price Breakdown */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>Rs. {cartTotal}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>Rs. {deliveryFee}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (5%)</Text>
            <Text style={styles.summaryValue}>Rs. {tax}</Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>Rs. {total}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.bottomBar}>
        <View style={styles.totalSection}>
          <Text style={styles.totalText}>Total</Text>
          <Text style={styles.totalAmount}>Rs. {total}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          <Feather name="arrow-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ShoppingCart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollView: {
    flex: 1,
  },
  itemsContainer: {
    padding: 15,
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666666',
  },
  summaryValue: {
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
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalText: {
    fontSize: 16,
    color: '#666666',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C2C2C',
  },
  checkoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF6B9D',
    paddingVertical: 16,
    borderRadius: 12,
  },
  checkoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C2C2C',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#888888',
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
