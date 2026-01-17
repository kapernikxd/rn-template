import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Directory, File, Paths } from 'expo-file-system';
import uuid from 'react-native-uuid';
import { launchImageLibrary } from 'react-native-image-picker';
import { useTranslation } from 'react-i18next';

import { useRootStore } from '../../../store/StoreProvider';
import { useImageCompressor, usePortalNavigation } from '../../../helpers/hooks';
import { UpdateProfileProps } from '../../../types/profile';
import { getUserAvatar } from '../../../helpers/utils/user';
import { getProfileInfo, mergeProfileInfo } from '../../profile/profileInfoStorage';

type EditProfileFormValues = Pick<
  UpdateProfileProps,
  'name' | 'lastname' | 'profession' | 'phone' | 'userBio' | 'gender'
> & { zodiacSign: string };

function safeCreateDirectory(dir: Directory) {
  try {
    dir.create({ intermediates: true });
  } catch (e: any) {
    const msg = String(e?.message ?? e);
    if (!/already exists/i.test(msg)) {
      throw e;
    }
  }
}

export const useEditProfile = () => {
  const { profileStore, uiStore } = useRootStore();
  const { compressImage } = useImageCompressor();
  const { goBack } = usePortalNavigation();
  const { t } = useTranslation();

  const [refreshing, setRefreshing] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storedZodiacSign, setStoredZodiacSign] = useState('');
  const zodiacInitializedRef = useRef(false);

  const profileDefaultValues = useMemo(
    () => ({
      name: profileStore.myProfile?.name,
      lastname: profileStore.myProfile?.lastname,
      profession: profileStore.myProfile?.profession,
      phone: profileStore.myProfile?.phone,
      userBio: profileStore.myProfile?.userBio,
      gender: profileStore.myProfile?.gender,
    }),
    [
      profileStore.myProfile?.name,
      profileStore.myProfile?.lastname,
      profileStore.myProfile?.profession,
      profileStore.myProfile?.phone,
      profileStore.myProfile?.userBio,
      profileStore.myProfile?.gender,
    ],
  );

  const initialValues = useMemo(
    () => ({
      ...profileDefaultValues,
      zodiacSign: '',
    }),
    [profileDefaultValues],
  );

  const methods = useForm<EditProfileFormValues>({ defaultValues: initialValues });
  const zodiacSignValue = useWatch({ control: methods.control, name: 'zodiacSign' });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await profileStore.fetchMyProfile();
    setRefreshing(false);
  }, [profileStore]);

  const submit = useCallback(
    methods.handleSubmit(async data => {
      setIsSubmitting(true);
      try {
        const { zodiacSign, ...profileData } = data;
        const changedFields = Object.fromEntries(
          Object.entries(profileData).filter(
            ([key, value]) =>
              value !== profileDefaultValues[key as keyof typeof profileDefaultValues],
          ),
        ) as Partial<EditProfileFormValues>;

        if (Object.keys(changedFields).length === 0) {
          uiStore.showSnackbar(
            t('components.profile.edit.snackbar.noChanges'),
            'info',
          );
          return;
        }

        await profileStore.updateProfile(changedFields as UpdateProfileProps);
        uiStore.showSnackbar(
          t('components.profile.edit.snackbar.updated'),
          'success',
        );
      } catch (e) {
        uiStore.showSnackbar(
          t('components.profile.edit.snackbar.error'),
          'error',
        );
      } finally {
        setIsSubmitting(false);
      }
    }),
    [methods, profileDefaultValues, profileStore, uiStore, t],
  );

  const reset = useCallback(() => {
    methods.reset({
      ...profileDefaultValues,
      zodiacSign: storedZodiacSign,
    });
  }, [methods, profileDefaultValues, storedZodiacSign]);

  useEffect(() => {
    if (methods.formState.isDirty) {
      return;
    }

    methods.reset({
      ...profileDefaultValues,
      zodiacSign: storedZodiacSign,
    });
  }, [methods, profileDefaultValues, storedZodiacSign]);

  useEffect(() => {
    let isActive = true;

    const loadZodiacSign = async () => {
      const profileInfo = await getProfileInfo();
      if (!isActive) {
        return;
      }
      const zodiacSign = profileInfo.zodiacSign ?? '';
      setStoredZodiacSign(zodiacSign);
      methods.setValue('zodiacSign', zodiacSign, { shouldDirty: false });
      zodiacInitializedRef.current = true;
    };

    loadZodiacSign();

    return () => {
      isActive = false;
    };
  }, [methods]);

  useEffect(() => {
    if (!zodiacInitializedRef.current) {
      return;
    }
    if (zodiacSignValue === storedZodiacSign) {
      return;
    }

    const nextValue = zodiacSignValue ?? '';
    const saveZodiacSign = async () => {
      try {
        await mergeProfileInfo({ zodiacSign: nextValue });
        setStoredZodiacSign(nextValue);
      } catch (error) {
        console.warn('Failed to save zodiac sign', error);
      }
    };

    saveZodiacSign();
  }, [storedZodiacSign, zodiacSignValue]);

  const imageUriFromStore = useMemo(
    () =>
      profileStore.myProfile?.avatarFile
        ? getUserAvatar(profileStore.myProfile)
        : null,
    [profileStore.myProfile],
  );

  useEffect(() => {
    setLocalImageUri(imageUriFromStore);
  }, [imageUriFromStore]);

  const onRequestOpenPreview = useCallback(() => setPreviewVisible(true), []);
  const onRequestClosePreview = useCallback(() => setPreviewVisible(false), []);
  const onPressEye = useCallback(() => setPreviewVisible(true), []);

  const onPressSelect = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
        maxHeight: 1024,
        maxWidth: 1024,
        includeBase64: false,
        selectionLimit: 1,
      });

      if (result.didCancel) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) return;

      const MAX = 40 * 1024 * 1024;
      if (asset.fileSize && asset.fileSize > MAX) {
        uiStore.showSnackbar(t('components.form.imageUploader.errors.largeFile'), 'warning');
        return;
      }

      const ext = asset.fileName?.includes('.') ? asset.fileName.split('.').pop() : 'jpg';
      const fileName = `avatar-${uuid.v4()}.${ext}`;

      const avatarsDir = new Directory(Paths.document, 'avatars');
      safeCreateDirectory(avatarsDir);

      let src = new File({
        uri: asset.uri,
        name: asset.fileName ?? fileName,
        type: asset.type || 'image/jpeg',
      } as any);

      if (asset.width && asset.height) {
        try {
          const compressedUri = await compressImage(asset.uri, asset.width, asset.height);
          src = new File({
            uri: compressedUri,
            name: fileName,
            type: asset.type || 'image/jpeg',
          } as any);
        } catch (error) {
          console.warn(
            t('components.profile.edit.debug.compressImageFailed'),
            error,
          );
        }
      }

      const dst = new File(avatarsDir, fileName);
      src.copy(dst);

      setLocalImageUri(dst.uri);

      const formData = new FormData();
      formData.append('file', {
        uri: dst.uri,
        name: fileName,
        type: asset.type || 'image/jpeg',
      } as any);

      await profileStore.uploadProfilePhoto(formData);
      await profileStore.fetchMyProfile();
      uiStore.showSnackbar(
        t('components.profile.edit.snackbar.photoUploadSuccess'),
        'success',
      );
    } catch (error) {
      console.error(
        t('components.profile.edit.debug.onPressSelectError'),
        error,
      );
      uiStore.showSnackbar(
        t('components.profile.edit.snackbar.photoUploadError'),
        'error',
      );
    }
  }, [compressImage, profileStore, uiStore, t]);

  const onPressRemove = useCallback(async () => {
    try {
      const fullPath = profileStore?.myProfile?.avatarFile;
      if (!fullPath) {
        uiStore.showSnackbar(
          t('components.profile.edit.snackbar.noPhotoToRemove'),
          'warning',
        );
        return;
      }
      const fileName = fullPath.split('/').pop();
      if (!fileName) {
        uiStore.showSnackbar(
          t('components.profile.edit.snackbar.invalidFilePath'),
          'error',
        );
        return;
      }

      setLocalImageUri(null);
      setPreviewVisible(false);

      await profileStore.deleteProfilePhoto(fileName);
      await profileStore.fetchMyProfile();

      uiStore.showSnackbar(
        t('components.profile.edit.snackbar.photoRemoveSuccess'),
        'success',
      );
    } catch (error) {
      console.error(
        t('components.profile.edit.debug.onPressRemoveError'),
        error,
      );
      uiStore.showSnackbar(
        t('components.profile.edit.snackbar.photoRemoveError'),
        'error',
      );
    }
  }, [profileStore, uiStore, t]);

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  return {
    methods,
    refreshing,
    onRefresh,
    onSubmit: submit,
    onReset: reset,
    onBackPress: goBack,
    previewVisible,
    onRequestOpenPreview,
    onRequestClosePreview,
    onPressSelect,
    onPressRemove,
    onPressEye,
    localImageUri,
    isSubmitting,
  };
};
