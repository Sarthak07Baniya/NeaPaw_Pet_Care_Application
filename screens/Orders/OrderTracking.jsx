import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from "@expo/vector-icons";
import { useDispatch, useSelector } from 'react-redux';
import { selectFilteredOrders, setOrderFilter } from '../../redux/slice/ordersSlice';

const OrderTracking = ({ navigation }) => {
  const dispatch = useDispatch();
  const orders = useSelector(selectFilteredOrders);
  const selectedFilter = useSelector((state) => state.orders.selectedFilter);

  const filters = [
    { id: 'all', label: 'All Orders' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'treatment', label: 'Treatment' },
    { id: 'hostel', label: 'Hostel' },
  ];

  const getOrderIcon = (type) => {
    switch (type) {
      case 'shopping': return 'shopping-bag';
      case 'treatment': return 'activity';
      case 'hostel': return 'home';
      default: return 'package';
    }
  };

  const getStatusColor = (type, currentIndex, totalSteps) => {
    if (currentIndex === totalSteps - 1) return '#4CAF50'; // Completed
    if (currentIndex > 0) return '#FF6B9D'; // In Progress
    return '#FFA500'; // Pending
  };

  const renderOrderCard = ({ item }) => {
    const statusSteps = item.type === 'shopping' ? 4 : 
                       item.type === 'treatment' ? 4 : 4;
    const statusColor = getStatusColor(item.type, item.currentStatusIndex, statusSteps);

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetails', { order: item })}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderIconContainer}>
            <Feather name={getOrderIcon(item.type)} size={24} color="#FF6B9D" />
          </View>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>{item.id}</Text>
            <Text style={styles.orderDate}>{item.date}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          {item.type === 'shopping' && (
            <Text style={styles.orderDescription}>
              {item.items.length} item(s) • ₹{item.total}
            </Text>
          )}
          {item.type === 'treatment' && (
            <Text style={styles.orderDescription}>
              {item.petName} • {item.service} • ₹{item.total}
            </Text>
          )}
          {item.type === 'hostel' && (
            <Text style={styles.orderDescription}>
              {item.petName} • {item.room} • {item.days} days • ₹{item.total}
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
          <TouchableOpacity style={styles.detailsButton}>
            <Text style={styles.detailsButtonText}>View Details</Text>
            <Feather name="chevron-right" size={16} color="#666666" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
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
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={60} color="#CCCCCC" />
            <Text style={styles.emptyText}>No orders found</Text>
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
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
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
