import { StyleSheet, Text, View } from 'react-native';

export const ActivityScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Уведомления</Text>
      <Text style={styles.subtitle}>
        Здесь будут отображаться события и уведомления пользователя.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F3F9FF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1E1E1E',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#4A4A4A',
  },
});
