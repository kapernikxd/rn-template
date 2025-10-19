import React, { FC } from 'react';
import { observer } from 'mobx-react-lite';

import { EditProfileView } from './EditProfile.view';
import { useEditProfile } from '../../../helpers/hooks/ProfileSettings/useEditProfile';

export const EditProfilesScreen: FC = observer(() => {
  const props = useEditProfile();

  return <EditProfileView {...props} />;
});

