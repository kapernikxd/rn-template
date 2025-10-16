import { StyleSheet, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';

import Screen from '../components/Screen';

export default function SettingsScreen() {
  const { colors } = useTheme();

  return (
    <Screen>
      <Text style={[styles.title, { color: colors.text }]}>Настройки</Text>
      <Text style={[styles.description, { color: colors.text, opacity: 0.7 }]}>
        Соберите элементы управления приложением на этой вкладке.
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
