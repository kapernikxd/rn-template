import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback } from 'react';

import type { DashboardStackParamList } from '../../../navigation';

type NavigationProp = NativeStackNavigationProp<DashboardStackParamList, 'Dashboard'>;

export const DashboardScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleOpenDetails = useCallback(() => {
    navigation.navigate('DashboardDetails');
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Главный экран</Text>
      <Text style={styles.subtitle}>
        Это базовый пример домашнего экрана. Здесь может быть лента, статистика или другие
        ключевые данные вашего приложения.
      </Text>
      <Pressable style={styles.button} onPress={handleOpenDetails}>
        <Text style={styles.buttonText}>Открыть подробности</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F5F7FA',
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
    marginBottom: 24,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#1E40AF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
