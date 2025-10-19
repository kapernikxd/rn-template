import React, { FC } from 'react';
import { observer } from 'mobx-react-lite';

import { NotificationSettingsView } from './NotificationSettings.view';
import { useNotificationSettings } from './useNotificationSettings';

export const NotificationSettingsScreen: FC = observer(() => {
  const props = useNotificationSettings();

  return <NotificationSettingsView {...props} />;
});

