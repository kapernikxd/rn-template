import React, { FC } from 'react';
import { observer } from 'mobx-react-lite';

import { NotificationSettingsView } from './NotificationSettings.view';
import { useNotificationSettings } from './useNotificationSettings';
import { ScreenLoader } from '../../../../components';

export const NotificationSettingsScreen: FC = observer(() => {
  const { isAuthReady, ...props } = useNotificationSettings();

  if (!isAuthReady) {
    return <ScreenLoader />;
  }

  return <NotificationSettingsView {...props} />;
});

