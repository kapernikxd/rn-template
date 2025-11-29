import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useRootStore } from '../../../store/StoreProvider';
import { usePortalNavigation } from '../../../helpers/hooks';

type AccountSettingsFormValues = {
  username?: string;
  email?: string;
};

export const useAccountSettings = () => {
  const { profileStore, authStore, uiStore } = useRootStore();
  const { goBack } = usePortalNavigation();
  const { t } = useTranslation();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<AccountSettingsFormValues>({
    defaultValues: {
      username: profileStore.myProfile?.username,
      email: authStore.user?.email,
    },
  });

  const submit = useCallback(
    methods.handleSubmit(async data => {
      setIsSubmitting(true);
      try {
        await profileStore.updateProfile({ username: data.username });
        uiStore.showSnackbar(
          t('components.account.settings.snackbar.updated'),
          'success'
        );
      } catch {
        uiStore.showSnackbar(
          t('components.account.settings.snackbar.error'),
          'error'
        );
      } finally {
        setIsSubmitting(false);
      }
    }),
    [methods, profileStore, uiStore, t],
  );

  const reset = useCallback(() => {
    methods.reset();
  }, [methods]);

  useEffect(() => {
    methods.reset({
      username: profileStore.myProfile?.username ?? '',
      email: authStore.user?.email ?? '',
    });
  }, [
    methods,
    profileStore.myProfile?.username,
    authStore.user?.email,
  ]);

  return {
    methods,
    onSubmit: submit,
    onReset: reset,
    onBackPress: goBack,
    isSubmitting,
  };
};
