import React, { FC } from 'react';
import { observer } from 'mobx-react-lite';

import { ProfileInfoView } from './ProfileInfo.view';

export const ProfileInfoSettingsScreen: FC = observer(() => {

  return <ProfileInfoView />;
});

