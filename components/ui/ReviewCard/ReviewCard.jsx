import { StyleSheet, Text, View } from 'react-native';
import { Feather } from "@expo/vector-icons";

const ReviewCard = ({ review }) => {
  const { userName, rating, comment, date } = review;

  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Feather key={i}
          name="star"
          size={14}
          color={i < rating ? '#FFB800' : '#E0E0E0'}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Feather name="user" size={20} color="#FFFFFF" />
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userName}</Text>
          <View style={styles.ratingContainer}>
            {renderStars()}
          </View>
        </View>
        
        <Text style={styles.date}>{date}</Text>
      </View>

      <Text style={styles.comment}>{comment}</Text>
    </View>
  );
};

export default ReviewCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  date: {
    fontSize: 12,
    color: '#888888',
  },
  comment: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});
