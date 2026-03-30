import { Feather } from "@expo/vector-icons";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import { orderStatuses } from '../../utils/appData';
import { treatmentService } from '../../services/treatmentService';
import { hostelService } from '../../services/hostelService';
import { adoptionService } from '../../services/adoptionService';

const OrderDetails = ({ route, navigation }) => {
  const order = route?.params?.order || {};
  const orderType = order.order_type || order.type;
  const displayOrderId =
    orderType === 'hostel'
      ? String(order.order_number || order.id || '').replace(/^ORD-/i, 'HOSTEL-')
      : order.order_number || order.id;
  const [treatmentRating, setTreatmentRating] = useState(5);
  const [treatmentComment, setTreatmentComment] = useState('');
  const [submittingTreatmentReview, setSubmittingTreatmentReview] = useState(false);
  const [hostelRating, setHostelRating] = useState(5);
  const [hostelComment, setHostelComment] = useState('');
  const [submittingHostelReview, setSubmittingHostelReview] = useState(false);
  const [adoptionRating, setAdoptionRating] = useState(5);
  const [adoptionComment, setAdoptionComment] = useState('');
  const [submittingAdoptionReview, setSubmittingAdoptionReview] = useState(false);
  const statuses = orderStatuses[orderType] || ['Pending', 'Confirmed', 'Completed'];
  const orderItems = Array.isArray(order.items) ? order.items : [];
  const normalizeStatus = (value) =>
    String(value || '')
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .trim();
  const formatStatusLabel = (value) =>
    String(value || '')
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .trim();
  const normalizedOrderStatus = normalizeStatus(order.status || 'pending');
  const canReviewPurchasedItems =
    orderType === 'shopping' &&
    normalizedOrderStatus === 'delivered';
  const canReviewTreatment =
    orderType === 'treatment' &&
    normalizedOrderStatus === 'completed' &&
    Boolean(order.treatment_booking_id);
  const canReviewHostel =
    orderType === 'hostel' &&
    ['completed', 'check out'].includes(normalizedOrderStatus) &&
    Boolean(order.hostel_booking_id);
  const canReviewAdoption =
    orderType === 'adoption' &&
    ['approved', 'rejected'].includes(normalizedOrderStatus) &&
    Boolean(order.id);
  const currentStatusIndex = Math.max(
    0,
    statuses.findIndex((status) => normalizeStatus(status) === normalizedOrderStatus)
  );

  const getProductFromOrderItem = (item) => {
    const product = item?.product_details || item?.product || null;
    const productId = product?.id || item?.product_id || item?.product;

    if (!productId) {
      return null;
    }

    return {
      ...product,
      id: productId,
      name: product?.name || item?.name || 'Product',
      price: product?.price || item?.price_at_time || item?.price || 0,
      images: Array.isArray(product?.images) ? product.images : [],
    };
  };

  const handleReviewProduct = (item) => {
    const product = getProductFromOrderItem(item);

    if (!product?.id) {
      const fallbackMessage =
        item?.product_details?.name || item?.name
          ? `The product data for "${item?.product_details?.name || item?.name}" is incomplete.`
          : "This order item is missing product data.";
      Alert.alert("Review unavailable", fallbackMessage);
      return;
    }

    const rootNavigation = navigation.getParent?.();
    const parentNavigation = rootNavigation?.getParent?.();

    if (parentNavigation) {
      parentNavigation.navigate('Home', {
        screen: 'ShoppingStack',
        params: {
          screen: 'ProductDetail',
          params: { product, canReview: true },
        },
      });
      return;
    }

    if (rootNavigation) {
      rootNavigation.navigate('ShoppingStack', {
        screen: 'ProductDetail',
        params: { product, canReview: true },
      });
      return;
    }

    navigation.navigate('ProductDetail', { product, canReview: true });
  };

  const handleSubmitTreatmentReview = async () => {
    const trimmedComment = treatmentComment.trim();

    if (!order.treatment_booking_id) {
      Alert.alert('Review unavailable', 'This treatment booking is not linked correctly.');
      return;
    }

    if (trimmedComment.length < 10) {
      Alert.alert('Review too short', 'Please write at least 10 characters in your review.');
      return;
    }

    try {
      setSubmittingTreatmentReview(true);
      await treatmentService.addReview(order.treatment_booking_id, {
        rating: treatmentRating,
        comment: trimmedComment,
      });
      setTreatmentComment('');
      setTreatmentRating(5);
      Alert.alert('Review submitted', 'Your treatment review has been sent to the admin panel.');
    } catch (error) {
      Alert.alert(
        'Unable to submit review',
        error?.response?.data?.comment?.[0] ||
          error?.response?.data?.detail ||
          error?.message ||
          'Please try again.'
      );
    } finally {
      setSubmittingTreatmentReview(false);
    }
  };

  const handleSubmitHostelReview = async () => {
    const trimmedComment = hostelComment.trim();

    if (!order.hostel_booking_id) {
      Alert.alert('Review unavailable', 'This hostel booking is not linked correctly.');
      return;
    }

    if (trimmedComment.length < 10) {
      Alert.alert('Review too short', 'Please write at least 10 characters in your review.');
      return;
    }

    try {
      setSubmittingHostelReview(true);
      await hostelService.addReview(order.hostel_booking_id, {
        rating: hostelRating,
        comment: trimmedComment,
      });
      setHostelComment('');
      setHostelRating(5);
      Alert.alert('Review submitted', 'Your pet hostel review has been sent to the admin panel.');
    } catch (error) {
      Alert.alert(
        'Unable to submit review',
        error?.response?.data?.comment?.[0] ||
          error?.response?.data?.detail ||
          error?.message ||
          'Please try again.'
      );
    } finally {
      setSubmittingHostelReview(false);
    }
  };

  const handleSubmitAdoptionReview = async () => {
    const trimmedComment = adoptionComment.trim();

    if (!order.id) {
      Alert.alert('Review unavailable', 'This adoption application is not linked correctly.');
      return;
    }

    if (trimmedComment.length < 10) {
      Alert.alert('Review too short', 'Please write at least 10 characters in your review.');
      return;
    }

    try {
      setSubmittingAdoptionReview(true);
      const applicationId = String(order.id).replace('adoption-', '');
      await adoptionService.addReview(applicationId, {
        rating: adoptionRating,
        comment: trimmedComment,
      });
      setAdoptionComment('');
      setAdoptionRating(5);
      Alert.alert('Review submitted', 'Your adoption review has been sent to the admin panel.');
    } catch (error) {
      Alert.alert(
        'Unable to submit review',
        error?.response?.data?.comment?.[0] ||
          error?.response?.data?.detail ||
          error?.message ||
          'Please try again.'
      );
    } finally {
      setSubmittingAdoptionReview(false);
    }
  };

  const renderStatusTimeline = () => {
    return statuses.map((status, index) => {
      const isCompleted = index <= currentStatusIndex;
      const isCurrent = index === currentStatusIndex;

      return (
        <View key={index} style={styles.timelineItem}>
          <View style={styles.timelineLeft}>
            <View
              style={[
                styles.timelineDot,
                isCompleted && styles.timelineDotCompleted,
                isCurrent && styles.timelineDotCurrent,
              ]}
            >
              {isCompleted && <Feather name="check" size={12} color="#FFFFFF" />}
            </View>
            {index < statuses.length - 1 && (
              <View
                style={[
                  styles.timelineLine,
                  isCompleted && styles.timelineLineCompleted,
                ]}
              />
            )}
          </View>
          <View style={styles.timelineRight}>
            <Text style={[styles.statusLabel, isCurrent && styles.statusLabelCurrent]}>
              {status}
            </Text>
            {isCurrent && <Text style={styles.statusDate}>Current Status</Text>}
          </View>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order ID</Text>
            <Text style={styles.infoValue}>{displayOrderId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order Date</Text>
            <Text style={styles.infoValue}>
              {order.created_at ? new Date(order.created_at).toLocaleString() : 'Date unavailable'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Amount</Text>
            <Text style={styles.infoValueHighlight}>Rs. {order.total || 0}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <View style={styles.timeline}>{renderStatusTimeline()}</View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          {orderType === 'shopping' && (
            <>
              {canReviewPurchasedItems && (
                <Text style={styles.reviewHint}>
                  You can now rate and review the products in this order.
                </Text>
              )}
              {orderItems.map((item, index) => (
                <View key={index} style={styles.itemCard}>
                  <View style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.product_details?.name || item.name || 'Item'}</Text>
                    <Text style={styles.itemQuantity}>x{item.quantity || 0}</Text>
                    <Text style={styles.itemPrice}>Rs. {(item.price_at_time || item.price || 0) * (item.quantity || 0)}</Text>
                  </View>
                  {canReviewPurchasedItems ? (
                    <TouchableOpacity
                      style={styles.reviewButton}
                      onPress={() => handleReviewProduct(item)}
                    >
                      <Feather name="star" size={16} color="#FF6B9D" />
                      <Text style={styles.reviewButtonText}>Rate & Review</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ))}
              {orderItems.length === 0 && (
                <Text style={styles.emptyText}>No order items available.</Text>
              )}
            </>
          )}
          {orderType === 'treatment' && (
            <>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Order Type</Text>
                <Text style={styles.detailValue}>Treatment</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={styles.detailValue}>{formatStatusLabel(order.status || 'pending')}</Text>
              </View>
              {canReviewTreatment ? (
                <View style={styles.treatmentReviewSection}>
                  <Text style={styles.reviewHint}>
                    You can now rate and review this completed treatment.
                  </Text>
                  <View style={styles.reviewStarsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setTreatmentRating(star)}
                        style={styles.reviewStarButton}
                        activeOpacity={0.8}
                      >
                        <Feather
                          name="star"
                          size={22}
                          color={star <= treatmentRating ? '#FFB800' : '#E0E0E0'}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    style={styles.reviewInput}
                    value={treatmentComment}
                    onChangeText={setTreatmentComment}
                    multiline
                    placeholder="Share your treatment experience"
                    placeholderTextColor="#999999"
                    textAlignVertical="top"
                  />
                  <TouchableOpacity
                    style={[styles.submitReviewButton, submittingTreatmentReview && styles.submitReviewButtonDisabled]}
                    onPress={handleSubmitTreatmentReview}
                    disabled={submittingTreatmentReview}
                  >
                    <Text style={styles.submitReviewText}>
                      {submittingTreatmentReview ? 'Submitting...' : 'Submit Review'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </>
          )}
          {orderType === 'hostel' && (
            <>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Order Type</Text>
                <Text style={styles.detailValue}>Pet Hostel</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={styles.detailValue}>{formatStatusLabel(order.status || 'pending')}</Text>
              </View>
              {canReviewHostel ? (
                <View style={styles.treatmentReviewSection}>
                  <Text style={styles.reviewHint}>
                    You can now rate and review this pet hostel stay.
                  </Text>
                  <View style={styles.reviewStarsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setHostelRating(star)}
                        style={styles.reviewStarButton}
                        activeOpacity={0.8}
                      >
                        <Feather
                          name="star"
                          size={22}
                          color={star <= hostelRating ? '#FFB800' : '#E0E0E0'}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    style={styles.reviewInput}
                    value={hostelComment}
                    onChangeText={setHostelComment}
                    multiline
                    placeholder="Share your pet hostel experience"
                    placeholderTextColor="#999999"
                    textAlignVertical="top"
                  />
                  <TouchableOpacity
                    style={[styles.submitReviewButton, submittingHostelReview && styles.submitReviewButtonDisabled]}
                    onPress={handleSubmitHostelReview}
                    disabled={submittingHostelReview}
                  >
                    <Text style={styles.submitReviewText}>
                      {submittingHostelReview ? 'Submitting...' : 'Submit Review'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </>
          )}
          {orderType === 'adoption' && (
            <>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Application Type</Text>
                <Text style={styles.detailValue}>Adoption</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Pet</Text>
                <Text style={styles.detailValue}>{order.pet_details?.name || order.pet?.name || 'Pet'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={styles.detailValue}>{formatStatusLabel(order.status || 'pending')}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Address</Text>
                <Text style={styles.detailValue}>
                  {order.address_line1}, {order.city}, {order.state} {order.postal_code}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Reason</Text>
                <Text style={styles.detailValue}>{order.reason_for_adoption || '-'}</Text>
              </View>
              {canReviewAdoption ? (
                <View style={styles.treatmentReviewSection}>
                  <Text style={styles.reviewHint}>
                    You can now rate and review this adoption application process.
                  </Text>
                  <View style={styles.reviewStarsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setAdoptionRating(star)}
                        style={styles.reviewStarButton}
                        activeOpacity={0.8}
                      >
                        <Feather
                          name="star"
                          size={22}
                          color={star <= adoptionRating ? '#FFB800' : '#E0E0E0'}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    style={styles.reviewInput}
                    value={adoptionComment}
                    onChangeText={setAdoptionComment}
                    multiline
                    placeholder="Share your adoption application experience"
                    placeholderTextColor="#999999"
                    textAlignVertical="top"
                  />
                  <TouchableOpacity
                    style={[styles.submitReviewButton, submittingAdoptionReview && styles.submitReviewButtonDisabled]}
                    onPress={handleSubmitAdoptionReview}
                    disabled={submittingAdoptionReview}
                  >
                    <Text style={styles.submitReviewText}>
                      {submittingAdoptionReview ? 'Submitting...' : 'Submit Review'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => navigation.navigate('OrderChat', { order })}
        >
          <Feather name="message-circle" size={20} color="#FFFFFF" />
          <Text style={styles.chatButtonText}>Chat with Support</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OrderDetails;

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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: '#666666',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  infoValueHighlight: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B9D',
  },
  timeline: {
    paddingLeft: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 15,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDotCompleted: {
    backgroundColor: '#4CAF50',
  },
  timelineDotCurrent: {
    backgroundColor: '#FF6B9D',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 4,
  },
  timelineLineCompleted: {
    backgroundColor: '#4CAF50',
  },
  timelineRight: {
    flex: 1,
    paddingTop: 2,
  },
  statusLabel: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 2,
  },
  statusLabelCurrent: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C2C2C',
  },
  statusDate: {
    fontSize: 13,
    color: '#FF6B9D',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  itemCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 4,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 10,
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  reviewHint: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    color: '#2C2C2C',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#888888',
    marginRight: 15,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  emptyText: {
    fontSize: 14,
    color: '#888888',
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 15,
    color: '#666666',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C2C2C',
    textTransform: 'capitalize',
  },
  treatmentReviewSection: {
    marginTop: 16,
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
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  chatButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF6B9D',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
