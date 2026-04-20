import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVOURITE_ITEMS_KEY = "neapaw_favourite_items";

const normalizeProduct = (product) => {
  if (!product?.id) {
    return null;
  }

  return {
    ...product,
    id: Number(product.id),
  };
};

const readItems = async () => {
  try {
    const raw = await AsyncStorage.getItem(FAVOURITE_ITEMS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.map(normalizeProduct).filter(Boolean)
      : [];
  } catch (error) {
    return [];
  }
};

const writeItems = async (items) => {
  await AsyncStorage.setItem(FAVOURITE_ITEMS_KEY, JSON.stringify(items));
};

export const favouriteService = {
  getFavouriteItems: async () => {
    return readItems();
  },

  isFavourite: async (productId) => {
    const items = await readItems();
    return items.some((item) => item.id === Number(productId));
  },

  toggleFavourite: async (product) => {
    const normalizedProduct = normalizeProduct(product);
    if (!normalizedProduct) {
      return { isFavourite: false, items: await readItems() };
    }

    const items = await readItems();
    const exists = items.some((item) => item.id === normalizedProduct.id);

    const nextItems = exists
      ? items.filter((item) => item.id !== normalizedProduct.id)
      : [normalizedProduct, ...items];

    await writeItems(nextItems);

    return {
      isFavourite: !exists,
      items: nextItems,
    };
  },

  removeFavourite: async (productId) => {
    const items = await readItems();
    const nextItems = items.filter((item) => item.id !== Number(productId));
    await writeItems(nextItems);
    return nextItems;
  },
};
