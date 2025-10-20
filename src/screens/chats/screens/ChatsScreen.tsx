import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { ROUTES, type ChatsNav } from '../../../navigation/types';

const CHATS = [
  {
    id: 'team',
    title: 'Команда маркетинга',
    lastMessage: 'Нужен апдейт по кампании — обсудим на встрече?',
  },
  {
    id: 'design',
    title: 'Дизайнеры',
    lastMessage: 'Макет новой посадочной готов, отправила в Figma.',
  },
  {
    id: 'support',
    title: 'Поддержка',
    lastMessage: 'Клиент ждет ответ по статусу заказа #1024.',
  },
];

export const ChatsScreen = () => {
  const navigation = useNavigation<ChatsNav>();

  return (
    <FlatList
      data={CHATS}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={() => (
        <View style={styles.header}>
          <Text style={styles.title}>Общайтесь с командой</Text>
          <Text style={styles.subtitle}>
            Следите за важными обсуждениями и быстро переходите к перепискам.
          </Text>
        </View>
      )}
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [styles.chatCard, pressed && styles.chatCardPressed]}
          onPress={() =>
            navigation.navigate(ROUTES.ChatMessages, {
              chatId: item.id,
              title: item.title,
            })
          }
        >
          <Text style={styles.chatTitle}>{item.title}</Text>
          <Text style={styles.chatPreview} numberOfLines={2}>
            {item.lastMessage}
          </Text>
        </Pressable>
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 24,
    gap: 16,
  },
  header: {
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E1E1E',
  },
  subtitle: {
    fontSize: 15,
    color: '#4A4A4A',
  },
  chatCard: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chatCardPressed: {
    backgroundColor: '#F3F4F6',
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  chatPreview: {
    fontSize: 14,
    color: '#6B7280',
  },
  separator: {
    height: 12,
  },
});
