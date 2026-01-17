import React, { FC } from 'react';
import { observer } from 'mobx-react-lite';

import { useEditProfile } from '../../../helpers/hooks/ProfileSettings/useEditProfile';
import { EditProfileView } from './EditProfile.view';

export const ProfileInfoSettingsScreen: FC = observer(() => {
  const props = useEditProfile();

  return <EditProfileView {...props} />;
});

