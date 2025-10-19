import React, { FC } from 'react';

import { ChangePasswordView } from './ChangePassword.view';
import { useChangePassword } from './useChangePassword';

export const ChangePasswordScreen: FC = () => {
  const props = useChangePassword();

  return <ChangePasswordView {...props} />;
};

