import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useRootStore } from '../../../store/StoreProvider';
import { usePortalNavigation } from '../../../helpers/hooks';

type ChangePasswordForm = {
  oldPassword: string;
  password: string;
  rePassword: string;
};

export const useChangePassword = () => {
  const { profileStore, uiStore } = useRootStore();
  const { goBack } = usePortalNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<ChangePasswordForm>();

  const submit = useCallback(
    methods.handleSubmit(async data => {
      setIsSubmitting(true);
      try {
        await profileStore.changePassword({ oldPassword: data.oldPassword, password: data.password });
        uiStore.showSnackbar('Udpated', 'success');
      } catch (errors: any) {
        if (errors && typeof errors === 'object') {
          Object.entries(errors).forEach(([field, message]) => {
            methods.setError(field as keyof ChangePasswordForm, {
              type: 'server',
              message: String(message),
            });
          });
        }
        uiStore.showSnackbar('Failed', 'error');
      } finally {
        setIsSubmitting(false);
      }
    }),
    [methods, profileStore, uiStore],
  );

  const reset = useCallback(() => {
    methods.reset();
  }, [methods]);

  return {
    methods,
    onSubmit: submit,
    onReset: reset,
    onBackPress: goBack,
    isSubmitting,
  };
};

