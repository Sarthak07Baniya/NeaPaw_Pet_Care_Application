import { useIsFocused } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useEffect } from "react";
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, selectFilteredOrders, setOrderFilter } from '../../redux/slice/ordersSlice';
import { fetchAdoptionApplications, selectAdoptionApplications } from '../../redux/slice/adoptionSlice';

const OrderTracking = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const orders = useSelector(selectFilteredOrders) || [];
  const adoptionApplications = useSelector(selectAdoptionApplications) || [];
  const selectedFilter = useSelector((state) => state.orders.selectedFilter);
  const isFocused = useIsFocused();
  const requestedFilter = route?.params?.filterType;

  const formatDisplayOrderId = (item) => {
    const rawValue = item?.order_number || item?.id;
    if ((item?.order_type || item?.type) === 'hostel') {
      return String(rawValue).replace(/^ORD-/i, 'HOSTEL-');
    }
    return rawValue;
  };

  useEffect(() => {
    if (isFocused) {
      dispatch(setOrderFilter(requestedFilter || 'all'));
      dispatch(fetchOrders());
      dispatch(fetchAdoptionApplications());
    }
  }, [dispatch, isFocused, requestedFilter]);

  const filters = [
    { id: 'all', label: 'All Orders' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'treatment', label: 'Treatment' },
    { id: 'hostel', label: 'Hostel' },
    { id: 'adoption', label: 'Adoption' },
  ];

  const mappedApplications = adoptionApplications.map((application) => ({
    ...application,
    id: `adoption-${application.id}`,
    order_type: 'adoption',
    total: 0,
    created_at: application.submitted_at,
    order_number: `APP-${application.id}`,
  }));
  const visibleOrders =
    selectedFilter === 'all'
      ? [...orders, ...mappedApplications]
      : selectedFilter === 'adoption'
        ? mappedApplications
        : orders;

  const getOrderIcon = (type) => {
    switch (type) {
      case 'shopping':
        return 'shopping-bag';
      case 'treatment':
        return 'activity';
      case 'hostel':
        return 'home';
      case 'adoption':
        return 'heart';
      default:
        return 'package';
    }
  };

  const getStatusColor = (status) => {
    switch (String(status || '').toLowerCase()) {
      case 'delivered':
      case 'completed':
      case 'approved':
        return '#4CAF50';
      case 'rejected':
      case 'cancelled':
        return '#EF4444';
      case 'confirmed':
      case 'in_transit':
      case 'out_for_delivery':
        return '#FF6B9D';
      default:
        return '#FFA500';
    }
  };

  const formatStatusLabel = (value) =>
    String(value || '')
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .trim();

  const renderOrderCard = ({ item }) => {
    const orderType = item.order_type || item.type;
    const orderItems = Array.isArray(item.items) ? item.items : [];

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetails', { order: item })}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderIconContainer}>
            <Feather name={getOrderIcon(orderType)} size={24} color="#FF6B9D" />
          </View>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>{formatDisplayOrderId(item)}</Text>
            <Text style={styles.orderDate}>
              {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Date unavailable'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{formatStatusLabel(item.status || 'pending')}</Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          {orderType === 'shopping' && (
            <Text style={styles.orderDescription}>
              {orderItems.length} item(s) • Rs. {item.total}
            </Text>
          )}
          {orderType === 'treatment' && (
            <Text style={styles.orderDescription}>Treatment booking • Rs. {item.total}</Text>
          )}
          {orderType === 'hostel' && (
            <Text style={styles.orderDescription}>Pet hostel booking • Rs. {item.total}</Text>
          )}
          {orderType === 'adoption' && (
            <Text style={styles.orderDescription}>
              Adoption application • {item.pet_details?.name || item.pet?.name || 'Pet'}
            </Text>
          )}
        </View>

        <View style={styles.orderFooter}>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => navigation.navigate('OrderChat', { order: item })}
          >
            <Feather name="message-circle" size={16} color="#FF6B9D" />
            <Text style={styles.chatButtonText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => navigation.navigate('OrderDetails', { order: item })}
          >
            <Text style={styles.detailsButtonText}>View Details</Text>
            <Feather name="chevron-right" size={16} color="#666666" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterTab,
              selectedFilter === filter.id && styles.filterTabActive,
            ]}
            onPress={() => dispatch(setOrderFilter(filter.id))}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.id && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={visibleOrders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => String(item.id || item.order_number)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={60} color="#CCCCCC" />
            <Text style={styles.emptyText}>
              {selectedFilter === 'all'
                ? 'No orders found'
                : `No ${filters.find((filter) => filter.id === selectedFilter)?.label?.toLowerCase() || 'orders'} found`}
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default OrderTracking;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  filterScroll: {
    flexGrow: 0,
    maxHeight: 56,
    backgroundColor: '#FFFFFF',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingRight: 24,
  },
  filterTab: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 20,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#FF6B9D',
  },
  filterText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 15,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF5F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 13,
    color: '#888888',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  orderDetails: {
    marginBottom: 12,
  },
  orderDescription: {
    fontSize: 14,
    color: '#666666',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chatButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsButtonText: {
    fontSize: 14,
    color: '#666666',
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
