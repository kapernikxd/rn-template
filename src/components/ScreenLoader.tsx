import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export const ScreenLoader = () => (
  <View style={styles.container}>
    <ActivityIndicator />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ScreenLoader;
