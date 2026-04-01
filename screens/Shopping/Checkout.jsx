import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import CouponCard from '../../components/ui/CouponCard/CouponCard';
import { clearCart, fetchCart, selectCartItems, selectCartTotal } from '../../redux/slice/cartSlice';
import { createOrderAsync } from '../../redux/slice/ordersSlice';
import { getAppConfig } from '../../services/api';
import { paymentService } from '../../services/paymentService';
import { shoppingService } from '../../services/shoppingService';
import { availableCoupons as staticCoupons, paymentMethods as staticPaymentMethods } from '../../utils/appData';

const Checkout = ({ navigation }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showCoupons, setShowCoupons] = useState(false);
  const [appliedCouponData, setAppliedCouponData] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigateToShoppingOrders = () => {
    const rootNavigation = navigation.getParent?.();
    const tabNavigation = rootNavigation?.getParent?.();

    if (tabNavigation) {
      tabNavigation.navigate('Home', {
        screen: 'OrdersStack',
        params: {
          screen: 'OrderTracking',
          params: { filterType: 'shopping' },
        },
      });
      return;
    }

    if (rootNavigation) {
      rootNavigation.navigate('OrdersStack', {
        screen: 'OrderTracking',
        params: { filterType: 'shopping' },
      });
      return;
    }

    navigation.navigate('ShoppingHome');
  };

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [config, couponsData] = await Promise.all([
            getAppConfig().catch(() => ({ payment_methods: staticPaymentMethods })),
            shoppingService.getCoupons().catch(() => []) 
        ]);

        const normalizedCoupons = Array.isArray(couponsData)
          ? couponsData
          : Array.isArray(couponsData?.results)
            ? couponsData.results
            : staticCoupons;

        const normalizedPaymentMethods = Array.isArray(config?.payment_methods)
          ? config.payment_methods
          : staticPaymentMethods;

        setPaymentMethods(normalizedPaymentMethods);
        setCoupons(normalizedCoupons);
      } catch (error) {
        console.error("Error loading checkout data", error);
        setPaymentMethods(staticPaymentMethods);
        setCoupons(staticCoupons);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const deliveryFee = cartTotal > 0 ? 50 : 0;
  const tax = Math.round(cartTotal * 0.05);
  // Assuming coupon discount is percentage based on appData
  const discount = appliedCouponData ? Math.round(cartTotal * (appliedCouponData.discount / 100)) : 0;
  const total = Math.max(0, cartTotal + deliveryFee + tax - discount);

  const handleApplyCoupon = (coupon) => {
    setAppliedCouponData(coupon);
    setShowCoupons(false);
    Alert.alert('Success', 'Coupon applied successfully!');
  };

  const handlePlaceOrder = async () => {
    if (isSubmitting) {
      return;
    }

    if (!name || !phone || !email || !address) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }
    if (!selectedPayment) {
      Alert.alert('Payment Method', 'Please select a payment method');
      return;
    }

    try {
      setIsSubmitting(true);
      const latestCart = await dispatch(fetchCart()).unwrap();
      const latestCartItems = Array.isArray(latestCart?.items) ? latestCart.items : [];
      const latestCartTotal = Number(latestCart?.total || 0);

      if (!latestCartItems.length || latestCartTotal <= 0) {
        Alert.alert(
          'Cart is empty',
          'Your shopping cart is empty. Please add products before placing an order.',
          [{ text: 'Go to Cart', onPress: () => navigation.goBack() }]
        );
        return;
      }

      const latestDeliveryFee = latestCartTotal > 0 ? 50 : 0;
      const latestTax = Math.round(latestCartTotal * 0.05);
      const latestDiscount = appliedCouponData ? Math.round(latestCartTotal * (appliedCouponData.discount / 100)) : 0;

      const orderData = {
        shipping_address: {
          full_name: name,
          phone,
          email,
          address_line1: address,
          city: 'City',
          state: 'State',
          postal_code: '00000',
          country: 'Country'
        },
        payment_method: selectedPayment,
        coupon_code: appliedCouponData ? appliedCouponData.code : null,
        order_type: 'shopping',
        subtotal: latestCartTotal,
        tax: latestTax,
        shipping_fee: latestDeliveryFee,
        discount: latestDiscount,
      };

      const resultAction = await dispatch(createOrderAsync(orderData));
      if (createOrderAsync.fulfilled.match(resultAction)) {
        const order = resultAction.payload;
        dispatch(clearCart());

        if (selectedPayment === 'esewa') {
          const paymentResult = await paymentService.payWithEsewa(order.id);
          if (paymentResult.success) {
            navigation.navigate('OrderConfirmation', {
              orderId: order.order_number,
              total: Math.max(0, latestCartTotal + latestDeliveryFee + latestTax - latestDiscount),
              estimatedDelivery: order.estimated_delivery,
            });
            return;
          }

          Alert.alert(
            'Payment not completed',
            'Your order was created, but eSewa payment was not completed. You can check it from My Orders.',
            [{ text: 'View Orders', onPress: navigateToShoppingOrders }]
          );
          return;
        }

        navigation.navigate('OrderConfirmation', {
          orderId: order.order_number,
          total: Math.max(0, latestCartTotal + latestDeliveryFee + latestTax - latestDiscount),
          estimatedDelivery: order.estimated_delivery,
        });
      } else {
        Alert.alert("Error", resultAction.payload || "Failed to place order");
      }
    } catch (error) {
      console.error("Place order error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Personal Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <Text style={styles.inputLabel}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />
          <Text style={styles.inputLabel}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <Text style={styles.inputLabel}>Email Address *</Text>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <Text style={styles.inputLabel}>Address *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter your complete address"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[styles.paymentOption, selectedPayment === method.id && styles.selectedPayment]}
              onPress={() => setSelectedPayment(method.id)}
            >
              <Feather name={method.icon} size={24} color={selectedPayment === method.id ? '#FF6B9D' : '#666666'} />
              <Text style={[styles.paymentText, selectedPayment === method.id && styles.selectedPaymentText]}>
                {method.name}
              </Text>
              {selectedPayment === method.id && (
                <Feather name="check-circle" size={20} color="#FF6B9D" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Coupon Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apply Coupon</Text>
          {appliedCouponData ? (
            <View style={styles.appliedCouponContainer}>
              <Feather name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.appliedCouponText}>{appliedCouponData.code} applied!</Text>
              <Text style={styles.discountAmount}>-Rs. {discount}</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.couponButton}
              onPress={() => setShowCoupons(!showCoupons)}
            >
              <Feather name="tag" size={20} color="#FF6B9D" />
              <Text style={styles.couponButtonText}>View Available Coupons</Text>
            </TouchableOpacity>
          )}
          
          {showCoupons && (
            <View style={styles.couponsContainer}>
              {(Array.isArray(coupons) ? coupons : []).map((coupon) => (
                <CouponCard
                  key={coupon.id || coupon.code}
                  coupon={coupon}
                  onApply={handleApplyCoupon}
                  isApplied={appliedCouponData?.id === coupon.id}
                />
              ))}
            </View>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
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
          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, styles.discountLabel]}>Discount</Text>
              <Text style={[styles.summaryValue, styles.discountValue]}>-Rs. {discount}</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>Rs. {total}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.placeOrderButton, (isSubmitting || !cartItems.length) && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={isSubmitting || !cartItems.length}
        >
          <Text style={styles.placeOrderText}>Place Order - Rs. {total}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Checkout;

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
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    fontSize: 15,
    color: '#2C2C2C',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    marginLeft: 4,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  selectedPayment: {
    borderColor: '#FF6B9D',
    backgroundColor: '#FFF5F8',
  },
  paymentText: {
    flex: 1,
    fontSize: 15,
    color: '#666666',
    marginLeft: 12,
  },
  selectedPaymentText: {
    color: '#FF6B9D',
    fontWeight: '600',
  },
  couponButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FF6B9D',
    borderStyle: 'dashed',
  },
  couponButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF6B9D',
    marginLeft: 8,
  },
  appliedCouponContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
  },
  appliedCouponText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 10,
  },
  discountAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
  },
  couponsContainer: {
    marginTop: 15,
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
  discountLabel: {
    color: '#4CAF50',
  },
  discountValue: {
    color: '#4CAF50',
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
  placeOrderButton: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeOrderButtonDisabled: {
    opacity: 0.6,
  },
  placeOrderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
