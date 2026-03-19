import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from "@expo/vector-icons";
import { useDispatch, useSelector } from 'react-redux';
import { addChatMessage, selectChatMessages } from '../../redux/slice/ordersSlice';

const OrderChat = ({ route }) => {
  const { order } = route.params;
  const dispatch = useDispatch();
  const messages = useSelector(selectChatMessages(order.id));
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim()) {
      dispatch(addChatMessage({
        orderId: order.id,
        message: inputText.trim(),
      }));
      setInputText('');
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageContainer, isUser && styles.messageContainerUser]}>
        <View style={[styles.messageBubble, isUser && styles.messageBubbleUser]}>
          <Text style={[styles.messageText, isUser && styles.messageTextUser]}>
            {item.message}
          </Text>
          <Text style={[styles.messageTime, isUser && styles.messageTimeUser]}>
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Order Info Header */}
      <View style={styles.header}>
        <Feather name="headphones" size={20} color="#FF6B9D" />
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Support Chat</Text>
          <Text style={styles.headerSubtitle}>Order #{order.id}</Text>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesList}
        inverted={false}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Feather name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default OrderChat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C2C2C',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#888888',
    marginTop: 2,
  },
  messagesList: {
    padding: 15,
  },
  messageContainer: {
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  messageContainerUser: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  messageBubbleUser: {
    backgroundColor: '#FF6B9D',
  },
  messageText: {
    fontSize: 15,
    color: '#2C2C2C',
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTextUser: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 11,
    color: '#888888',
  },
  messageTimeUser: {
    color: '#FFE0EC',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
});
