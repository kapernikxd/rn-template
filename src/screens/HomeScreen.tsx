import { StyleSheet, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';

import Screen from '../components/Screen';

export default function HomeScreen() {
  const { colors } = useTheme();

  return (
    <Screen>
      <Text style={[styles.title, { color: colors.text }]}>Главная</Text>
      <Text style={[styles.description, { color: colors.text, opacity: 0.7 }]}>
        Это пример домашней страницы. Добавьте сюда контент приложения.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
  },
});
