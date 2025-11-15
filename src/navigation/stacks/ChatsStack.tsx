import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { ChatsScreen } from '../../screens/chats/ChatsScreen';
import { ChatMessagesScreen } from '../../screens/chats/ChatMessagesScreen';
import { ROUTES, type ChatsStackParamList } from '../types';

const Stack = createNativeStackNavigator<ChatsStackParamList>();

export const ChatsStack = () => {
  const { t } = useTranslation();

  return (
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
          title: t('navigation.chats.title'),
        }}
      />
      <Stack.Screen
        name={ROUTES.ChatMessages}
        component={ChatMessagesScreen}
        options={{
          title: t('navigation.chats.messagesTitle'),
          headerBackTitle: t('navigation.common.back'),
        }}
      />
    </Stack.Navigator>
  );
};
