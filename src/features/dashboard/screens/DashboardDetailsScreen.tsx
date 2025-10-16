import { StyleSheet, Text, View } from 'react-native';

export const DashboardDetailsScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Подробности</Text>
    <Text style={styles.subtitle}>
      Используйте этот экран, чтобы показать дополнительную информацию, графики или аналитику.
      Это демонстрация вложенного экрана в стеке.
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F5F7FA',
  },
  title: {
    fontSize: 22,
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
