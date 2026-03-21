import { Feather } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { orderStatuses } from '../../utils/appData';

const OrderDetails = ({ route, navigation }) => {
  const order = route?.params?.order || {};
  const orderType = order.order_type || order.type;
  const statuses = orderStatuses[orderType] || ['Pending', 'Confirmed', 'Completed'];
  const orderItems = Array.isArray(order.items) ? order.items : [];
  const normalizeStatus = (value) =>
    String(value || '')
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .trim();
  const currentStatusIndex = Math.max(
    0,
    statuses.findIndex((status) => normalizeStatus(status) === normalizeStatus(order.status || 'pending'))
  );

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
            <Text style={styles.infoValue}>{order.order_number || order.id}</Text>
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
              {orderItems.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.product_details?.name || item.name || 'Item'}</Text>
                  <Text style={styles.itemQuantity}>x{item.quantity || 0}</Text>
                  <Text style={styles.itemPrice}>Rs. {(item.price_at_time || item.price || 0) * (item.quantity || 0)}</Text>
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
                <Text style={styles.detailValue}>{order.status || 'pending'}</Text>
              </View>
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
                <Text style={styles.detailValue}>{order.status || 'pending'}</Text>
              </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
