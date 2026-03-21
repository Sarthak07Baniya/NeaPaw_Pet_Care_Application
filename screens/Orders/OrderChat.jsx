import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, SectionList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from "@expo/vector-icons";
import { useDispatch, useSelector } from 'react-redux';
import { fetchChatMessages, selectChatMessages, sendChatMessageAsync } from '../../redux/slice/ordersSlice';

const OrderChat = ({ route }) => {
  const { order } = route.params;
  const dispatch = useDispatch();
  const messages = useSelector(selectChatMessages(order.id));
  const [inputText, setInputText] = useState('');

  const sortMessagesByTime = (items) =>
    [...items].sort((a, b) => {
      const first = a?.timestamp ? new Date(a.timestamp).getTime() : 0;
      const second = b?.timestamp ? new Date(b.timestamp).getTime() : 0;
      return first - second;
    });

  const userMessages = sortMessagesByTime(
    messages.filter((item) => !item.is_admin_reply)
  );
  const adminMessages = sortMessagesByTime(
    messages.filter((item) => item.is_admin_reply)
  );
  const sections = [
    { title: 'Your Messages', data: userMessages, isUserSection: true },
    { title: 'Admin Replies', data: adminMessages, isUserSection: false },
  ].filter((section) => section.data.length > 0);

  useEffect(() => {
    if (!order?.id) {
      return;
    }

    dispatch(fetchChatMessages(order.id));
    const intervalId = setInterval(() => {
      dispatch(fetchChatMessages(order.id));
    }, 5000);

    return () => clearInterval(intervalId);
  }, [dispatch, order?.id]);

  const handleSend = async () => {
    if (inputText.trim()) {
      await dispatch(sendChatMessageAsync({
        orderId: order.id,
        message: inputText.trim(),
      }));
      setInputText('');
    }
  };

  const renderMessage = ({ item, section }) => {
    const isUser = section.isUserSection;
    const timestamp = item.timestamp
      ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';
    return (
      <View style={[styles.messageContainer, isUser && styles.messageContainerUser]}>
        <View style={[styles.messageBubble, isUser && styles.messageBubbleUser]}>
          <Text style={[styles.messageText, isUser && styles.messageTextUser]}>
            {item.message}
          </Text>
          <Text style={[styles.messageTime, isUser && styles.messageTimeUser]}>
            {timestamp}
          </Text>
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

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
      <SectionList
        sections={sections}
        renderItem={renderMessage}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item, index) => String(item.id || `${item.timestamp}-${index}`)}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No messages yet. Start the conversation below.</Text>
          </View>
        }
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
  sectionHeader: {
    marginTop: 8,
    marginBottom: 10,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
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
