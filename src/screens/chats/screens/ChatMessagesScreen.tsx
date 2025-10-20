import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';

import type { ChatMessagesRoute } from '../../../navigation/types';

const MESSAGES = [
  {
    id: '1',
    author: 'Алина',
    content: 'Привет! Мы финализировали презентацию, можно отправлять клиенту.',
    timestamp: '10:24',
  },
  {
    id: '2',
    author: 'Дмитрий',
    content: 'Отлично, давайте уточним детали бюджета до звонка.',
    timestamp: '10:26',
  },
  {
    id: '3',
    author: 'Алина',
    content: 'Ок, подготовлю таблицу с расчётами и поделюсь здесь.',
    timestamp: '10:28',
  },
];

export const ChatMessagesScreen = () => {
  const route = useRoute<ChatMessagesRoute>();
  const { title } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.chatHeader}>
        <Text style={styles.chatTitle}>{title}</Text>
        <Text style={styles.chatSubtitle}>История переписки</Text>
      </View>

      <FlatList
        data={MESSAGES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContent}
        renderItem={({ item }) => (
          <View style={styles.messageBubble}>
            <View style={styles.messageHeader}>
              <Text style={styles.messageAuthor}>{item.author}</Text>
              <Text style={styles.messageTimestamp}>{item.timestamp}</Text>
            </View>
            <Text style={styles.messageText}>{item.content}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.messageSeparator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  chatHeader: {
    gap: 4,
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E1E1E',
  },
  chatSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  messagesContent: {
    gap: 12,
  },
  messageBubble: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  messageTimestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  messageText: {
    fontSize: 15,
    color: '#374151',
  },
  messageSeparator: {
    height: 12,
  },
});
