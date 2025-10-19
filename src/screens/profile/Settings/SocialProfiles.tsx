import React, { FC } from 'react';
import { observer } from 'mobx-react-lite';

import { SocialProfilesView } from './SocialProfiles.view';
import { useSocialProfiles } from './useSocialProfiles';

export const SocialProfilesScreen: FC = observer(() => {
  const props = useSocialProfiles();

  return <SocialProfilesView {...props} />;
});

