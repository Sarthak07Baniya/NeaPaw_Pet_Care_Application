import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from "@expo/vector-icons";

const CouponCard = ({ coupon, onApply, isApplied = false }) => {
  const { code, description, discount, discountType, minOrder, validUntil } = coupon;

  const getDiscountText = () => {
    if (discountType === 'percentage') {
      return `${discount}% OFF`;
    } else if (discountType === 'fixed') {
      return `Rs. ${discount} OFF`;
    } else {
      return 'FREE SHIPPING';
    }
  };

  return (
    <View style={[styles.container, isApplied && styles.appliedContainer]}>
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          <Feather name="tag" size={24} color="#FF6B9D" />
        </View>
      </View>

      <View style={styles.middleSection}>
        <Text style={styles.code}>{code}</Text>
        <Text style={styles.description}>{description}</Text>
        {minOrder > 0 && (
          <Text style={styles.minOrder}>Min order: Rs. {minOrder}</Text>
        )}
        <Text style={styles.validity}>Valid until {validUntil}</Text>
      </View>

      <View style={styles.rightSection}>
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{getDiscountText()}</Text>
        </View>
        
        <TouchableOpacity
          style={[styles.applyButton, isApplied && styles.appliedButton]}
          onPress={() => onApply(coupon)}
          activeOpacity={0.7}
          disabled={isApplied}
        >
          <Text style={[styles.applyText, isApplied && styles.appliedText]}>
            {isApplied ? 'Applied' : 'Apply'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CouponCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  appliedContainer: {
    borderColor: '#FF6B9D',
    backgroundColor: '#FFF5F8',
  },
  leftSection: {
    marginRight: 12,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
  },
  code: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
  },
  minOrder: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 2,
  },
  validity: {
    fontSize: 11,
    color: '#AAAAAA',
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: 8,
  },
  discountBadge: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  applyButton: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  appliedButton: {
    backgroundColor: '#4CAF50',
  },
  applyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  appliedText: {
    color: '#FFFFFF',
  },
});
