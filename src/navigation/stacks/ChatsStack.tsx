import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ChatsScreen } from '../../screens/chats/ChatsScreen';
import { ChatMessagesScreen } from '../../screens/chats/ChatMessagesScreen';
import { ROUTES, type ChatsStackParamList } from '../types';

const Stack = createNativeStackNavigator<ChatsStackParamList>();

export const ChatsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerLargeTitle: true,
      headerShadowVisible: false,
      contentStyle: { backgroundColor: '#F5F7FA' },
      headerShown: false,
    }}
  >
    <Stack.Screen
      name={ROUTES.Chats}
      component={ChatsScreen}
      options={{
        title: 'Чаты',
      }}
    />
    <Stack.Screen
      name={ROUTES.ChatMessages}
      component={ChatMessagesScreen}
      options={{
        title: 'Сообщения',
        headerBackTitle: 'Назад',
      }}
    />
  </Stack.Navigator>
);
