import { Feather } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

const OfferCard = ({ title, description, discount, category, validUntil, colors, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <LinearGradient colors={colors || ['#667eea', '#764ba2']} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{discount}</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.categoryContainer}>
            <Feather name="tag" size={14} color="#FFFFFF" />
            <Text style={styles.category}>{category}</Text>
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          
          <View style={styles.footer}>
            <Feather name="clock" size={14} color="#FFFFFF" />
            <Text style={styles.validText}>Valid until {validUntil}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default OfferCard;

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginRight: 15,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  gradient: {
    padding: 20,
    minHeight: 180,
  },
  discountBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  discountText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  category: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 6,
    fontWeight: '600',
    opacity: 0.9,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.95,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  validText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 6,
    opacity: 0.9,
  },
});
