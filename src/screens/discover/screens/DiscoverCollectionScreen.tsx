import { StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';

import type { DiscoverStackParamList } from '../../../navigation/types';
import type { RouteProp } from '@react-navigation/native';

type Route = RouteProp<DiscoverStackParamList, 'DiscoverCollection'>;

export const DiscoverCollectionScreen = () => {
  const { params } = useRoute<Route>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Подборка #{params.collectionId}</Text>
      <Text style={styles.subtitle}>
        Здесь можно отобразить карточки, подборки или другой контент конкретной коллекции.
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
