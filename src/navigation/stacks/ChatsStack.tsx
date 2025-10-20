import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ChatsScreen } from '../../screens/chats/screens/ChatsScreen';
import { ChatMessagesScreen } from '../../screens/chats/screens/ChatMessagesScreen';
import { withAuthGuard } from '../guards/withAuthGuard';
import { ROUTES, type ChatsStackParamList } from '../types';

const Stack = createNativeStackNavigator<ChatsStackParamList>();

const GuardedChatsScreen = withAuthGuard(ChatsScreen, {
  redirect: {
    tab: ROUTES.ChatsTab,
    params: { screen: ROUTES.Chats },
  },
});

const GuardedChatMessagesScreen = withAuthGuard(ChatMessagesScreen, {
  redirect: {
    tab: ROUTES.ChatsTab,
    params: { screen: ROUTES.Chats },
  },
});

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
      component={GuardedChatsScreen}
      options={{
        title: 'Чаты',
      }}
    />
    <Stack.Screen
      name={ROUTES.ChatMessages}
      component={GuardedChatMessagesScreen}
      options={{
        title: 'Сообщения',
        headerBackTitle: 'Назад',
      }}
    />
  </Stack.Navigator>
);
