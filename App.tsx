import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BottomTabs } from './src/navigation/BottomTabs';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <BottomTabs />
    </SafeAreaProvider>
  );
}
