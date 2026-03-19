import { Feather } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { orderStatuses } from '../../utils/appData';

const OrderDetails = ({ route, navigation }) => {
  const { order } = route.params;
  const statuses = orderStatuses[order.type];

  const renderStatusTimeline = () => {
    return statuses.map((status, index) => {
      const isCompleted = index <= order.currentStatusIndex;
      const isCurrent = index === order.currentStatusIndex;

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
        {/* Order Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order ID</Text>
            <Text style={styles.infoValue}>{order.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order Date</Text>
            <Text style={styles.infoValue}>{order.date}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Amount</Text>
            <Text style={styles.infoValueHighlight}>₹{order.total}</Text>
          </View>
        </View>

        {/* Status Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <View style={styles.timeline}>{renderStatusTimeline()}</View>
        </View>

        {/* Order Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          {order.type === 'shopping' && (
            <>
              {order.items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                  <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                </View>
              ))}
              {order.trackingNumber && (
                <View style={styles.trackingInfo}>
                  <Feather name="truck" size={16} color="#FF6B9D" />
                  <Text style={styles.trackingText}>Tracking: {order.trackingNumber}</Text>
                </View>
              )}
            </>
          )}
          {order.type === 'treatment' && (
            <>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Pet</Text>
                <Text style={styles.detailValue}>{order.petName}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Service</Text>
                <Text style={styles.detailValue}>{order.service}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Appointment</Text>
                <Text style={styles.detailValue}>
                  {order.appointmentDate} at {order.appointmentTime}
                </Text>
              </View>
            </>
          )}
          {order.type === 'hostel' && (
            <>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Pet</Text>
                <Text style={styles.detailValue}>{order.petName}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Room</Text>
                <Text style={styles.detailValue}>{order.room}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Check-in</Text>
                <Text style={styles.detailValue}>{order.checkIn}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Check-out</Text>
                <Text style={styles.detailValue}>{order.checkOut}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Duration</Text>
                <Text style={styles.detailValue}>{order.days} days</Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Chat Button */}
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
  trackingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 12,
    backgroundColor: '#FFF5F8',
    borderRadius: 8,
    gap: 8,
  },
  trackingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B9D',
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
