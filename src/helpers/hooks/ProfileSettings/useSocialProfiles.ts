import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useRootStore } from '../../../store/StoreProvider';
import { usePortalNavigation } from '../../../helpers/hooks';

type SocialProfilesForm = {
  facebook?: string;
  instagram?: string;
  vk?: string;
  tg?: string;
};

export const useSocialProfiles = () => {
  const { profileStore, uiStore } = useRootStore();
  const { goBack } = usePortalNavigation();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = useMemo(
    () => ({
      facebook: profileStore.myProfile?.socialMediaLinks?.facebook,
      instagram: profileStore.myProfile?.socialMediaLinks?.instagram,
      vk: profileStore.myProfile?.socialMediaLinks?.vk,
      tg: profileStore.myProfile?.socialMediaLinks?.tg,
    }),
    [profileStore.myProfile?.socialMediaLinks],
  );

  const methods = useForm<SocialProfilesForm>({
    defaultValues,
  });

  const submit = useCallback(
    methods.handleSubmit(async data => {
      setIsSubmitting(true);
      try {
        await profileStore.updateProfile({
          socialMediaLinks: {
            ...data,
          },
        });
        uiStore.showSnackbar(
          t('components.profile.socialProfiles.snackbar.updated'),
          'success',
        );
      } catch {
        uiStore.showSnackbar(
          t('components.profile.socialProfiles.snackbar.error'),
          'error',
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
      facebook: profileStore.myProfile?.socialMediaLinks?.facebook ?? '',
      instagram: profileStore.myProfile?.socialMediaLinks?.instagram ?? '',
      vk: profileStore.myProfile?.socialMediaLinks?.vk ?? '',
      tg: profileStore.myProfile?.socialMediaLinks?.tg ?? '',
    });
  }, [methods, profileStore.myProfile?.socialMediaLinks]);

  return {
    methods,
    onSubmit: submit,
    onReset: reset,
    onBackPress: goBack,
    isSubmitting,
  };
};
