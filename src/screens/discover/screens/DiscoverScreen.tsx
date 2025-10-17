import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { DiscoverStackParamList } from '../../../navigation';

const COLLECTIONS = [
  { id: '01', title: 'Лучшие практики' },
  { id: '02', title: 'UI-галерея' },
  { id: '03', title: 'Статьи' },
  { id: '04', title: 'Вдохновение' },
];

type NavigationProp = NativeStackNavigationProp<DiscoverStackParamList, 'Discover'>;

export const DiscoverScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <FlatList
      data={COLLECTIONS}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => navigation.navigate('DiscoverCollection', { collectionId: item.id })}
        >
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>Откройте подборку #{item.id}</Text>
        </Pressable>
      )}
      ListHeaderComponent={() => (
        <View style={styles.header}>
          <Text style={styles.title}>Обзор контента</Text>
          <Text style={styles.subtitle}>
            Пример экрана c подборками. Тап по карточке открывает вложенный экран стека.
          </Text>
        </View>
      )}
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
    marginBottom: 16,
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
  card: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
});
