import { StyleSheet, Switch, Text, View } from 'react-native';
import { useState } from 'react';

export const ProfileSettingsScreen = () => {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Настройки</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Push-уведомления</Text>
        <Switch
          value={isNotificationsEnabled}
          onValueChange={setIsNotificationsEnabled}
          trackColor={{ true: '#1E40AF' }}
        />
      </View>
      <Text style={styles.helper}>
        Здесь может быть форма редактирования профиля или другие параметры пользователя.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 24,
    backgroundColor: '#F5F7FA',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E1E1E',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  label: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  helper: {
    fontSize: 15,
    color: '#4A4A4A',
    lineHeight: 22,
  },
});
