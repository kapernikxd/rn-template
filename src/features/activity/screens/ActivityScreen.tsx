import { FlatList, StyleSheet, Text, View } from 'react-native';

const ACTIVITIES = [
  { id: '1', title: 'Сегодня', description: 'Вы получили 12 новых уведомлений.' },
  { id: '2', title: 'Вчера', description: 'Отмечено 3 выполненных задачи.' },
  { id: '3', title: 'На этой неделе', description: 'Завершено 5 проектов.' },
];

export const ActivityScreen = () => (
  <FlatList
    data={ACTIVITIES}
    keyExtractor={(item) => item.id}
    contentContainerStyle={styles.listContent}
    ListHeaderComponent={() => (
      <View style={styles.header}>
        <Text style={styles.title}>Активность команды</Text>
        <Text style={styles.subtitle}>
          Собирайте важные уведомления, события и изменения в одном месте.
        </Text>
      </View>
    )}
    renderItem={({ item }) => (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.description}</Text>
      </View>
    )}
  />
);

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
  card: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
});
