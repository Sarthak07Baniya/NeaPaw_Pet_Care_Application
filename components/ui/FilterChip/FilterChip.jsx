import { StyleSheet, Text, TouchableOpacity } from 'react-native';

const FilterChip = ({ label, isActive, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.chip, isActive && styles.activeChip]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, isActive && styles.activeLabel]}>{label}</Text>
    </TouchableOpacity>
  );
};

export default FilterChip;

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeChip: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  activeLabel: {
    color: '#FFFFFF',
  },
});
