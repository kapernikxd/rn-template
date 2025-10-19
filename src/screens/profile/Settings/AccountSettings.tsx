import React, { FC } from 'react';
import { observer } from 'mobx-react-lite';

import { AccountSettingsView } from './AccountSettings.view';
import { useAccountSettings } from '../../../helpers/hooks/ProfileSettings/useAccountSettings';

export const AccountSettingsScreen: FC = observer(() => {
  const props = useAccountSettings();

  return <AccountSettingsView {...props} />;
});

