import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from "@expo/vector-icons";

const SearchBar = ({ value, onChangeText, onSearch, placeholder = 'Search products...' }) => {
  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View style={styles.container}>
      <Feather name="search" size={20} color="#888888" style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#AAAAAA"
        returnKeyType="search"
        onSubmitEditing={onSearch}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Feather name="x-circle" size={18} color="#888888" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 48,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#2C2C2C',
  },
  clearButton: {
    padding: 4,
  },
});
