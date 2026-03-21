import { Feather } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { resolveMediaUrl } from "../../../services/api";

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  if (!item) return null;

  const { product, quantity, productId } = item;
  if (!product) return null;
  const subtotal = (product.price || 0) * quantity;
  const imageUrl = resolveMediaUrl(
    product.images?.find((image) => image?.is_primary)?.image ||
    product.images?.[0]?.image
  );

  const handleDecrease = () => {
    if (quantity > 1) {
      onUpdateQuantity(product.id || productId, quantity - 1);
    }
  };

  const handleIncrease = () => {
    onUpdateQuantity(product.id || productId, quantity + 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <Feather name="package" size={40} color="#CCCCCC" />
        )}
      </View>

      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={2}>{product?.name || 'Unknown Product'}</Text>
        <Text style={styles.price}>₹{product.price}</Text>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={handleDecrease}
            activeOpacity={0.7}
          >
            <Feather name="minus" size={16} color="#666666" />
          </TouchableOpacity>
          
          <Text style={styles.quantity}>{quantity}</Text>
          
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={handleIncrease}
            activeOpacity={0.7}
          >
            <Feather name="plus" size={16} color="#666666" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => onRemove(product.id || productId)}
          activeOpacity={0.7}
        >
          <Feather name="trash-2" size={18} color="#FF6B9D" />
        </TouchableOpacity>
        
        <Text style={styles.subtotal}>₹{subtotal}</Text>
      </View>
    </View>
  );
};

export default CartItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  details: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C2C2C',
    marginHorizontal: 15,
    minWidth: 20,
    textAlign: 'center',
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  removeButton: {
    padding: 4,
  },
  subtotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B9D',
  },
});
