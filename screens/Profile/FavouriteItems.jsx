import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import ProductCard from "../../components/ui/ProductCard/ProductCard";
import { resolveMediaUrl } from "../../services/api";
import { favouriteService } from "../../services/favouriteService";

const FavouriteItems = ({ navigation }) => {
  const [items, setItems] = useState([]);

  const loadItems = useCallback(async () => {
    const favouriteItems = await favouriteService.getFavouriteItems();
    setItems(favouriteItems);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  const handleToggleFavourite = async (product) => {
    const result = await favouriteService.toggleFavourite(product);
    setItems(result.items);
  };

  const handleProductPress = (product) => {
    const parentNavigation = navigation.getParent?.();

    if (parentNavigation) {
      parentNavigation.navigate("Home", {
        screen: "ShoppingStack",
        params: {
          screen: "ProductDetail",
          params: { product },
        },
      });
      return;
    }

    navigation.navigate("Home", {
      screen: "ShoppingStack",
      params: {
        screen: "ProductDetail",
        params: { product },
      },
    });
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={items}
      keyExtractor={(item) => String(item.id)}
      numColumns={2}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => (
        <View style={styles.cardWrapper}>
          <ProductCard
            name={item.name}
            price={item.price}
            rating={item.rating || 0}
            reviews={item.reviews_count || item.reviews || 0}
            category={item.category}
            imageUrl={resolveMediaUrl(item.images?.find((image) => image.is_primary)?.image || item.images?.[0]?.image)}
            showFavoriteButton
            isFavorite
            onToggleFavorite={() => handleToggleFavourite(item)}
            onPress={() => handleProductPress(item)}
          />
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Feather name="heart" size={56} color="#D6D6D6" />
          <Text style={styles.emptyTitle}>No favourite items yet</Text>
          <Text style={styles.emptySubtitle}>Tap the heart on shopping products and they will show here.</Text>
        </View>
      }
    />
  );
};

export default FavouriteItems;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardWrapper: {
    width: "48%",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C2C2C",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#777777",
    textAlign: "center",
    lineHeight: 22,
  },
});
