import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Directory, File, Paths } from 'expo-file-system';
import uuid from 'react-native-uuid';
import { launchImageLibrary } from 'react-native-image-picker';

import { useRootStore } from '../../../store/StoreProvider';
import { useImageCompressor, usePortalNavigation } from '../../../helpers/hooks';
import { UpdateProfileProps } from '../../../types/profile';
import { getUserAvatar } from '../../../helpers/utils/user';
import { LARGE_FILE_ERROR } from '../../../constants';

type EditProfileFormValues = Pick<
  UpdateProfileProps,
  'name' | 'lastname' | 'profession' | 'phone' | 'userBio'
>;

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

  const [refreshing, setRefreshing] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = useMemo(
    () => ({
      name: profileStore.myProfile?.name,
      lastname: profileStore.myProfile?.lastname,
      profession: profileStore.myProfile?.profession,
      phone: profileStore.myProfile?.phone,
      userBio: profileStore.myProfile?.userBio,
    }),
    [profileStore.myProfile?.name, profileStore.myProfile?.lastname, profileStore.myProfile?.profession, profileStore.myProfile?.phone, profileStore.myProfile?.userBio],
  );

  const methods = useForm<EditProfileFormValues>({ defaultValues: initialValues });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await profileStore.fetchMyProfile();
    setRefreshing(false);
  }, [profileStore]);

  const submit = useCallback(
    methods.handleSubmit(async data => {
      setIsSubmitting(true);
      try {
        const changedFields = Object.fromEntries(
          Object.entries(data).filter(
            ([key, value]) => value !== initialValues[key as keyof typeof initialValues],
          ),
        ) as Partial<EditProfileFormValues>;

        if (Object.keys(changedFields).length === 0) {
          uiStore.showSnackbar('Nothing changed', 'info');
          return;
        }

        await profileStore.updateProfile(changedFields as UpdateProfileProps);
        uiStore.showSnackbar('Updated', 'success');
      } catch (e) {
        uiStore.showSnackbar('Failed', 'error');
      } finally {
        setIsSubmitting(false);
      }
    }),
    [methods, initialValues, profileStore, uiStore],
  );

  const reset = useCallback(() => {
    methods.reset({
      name: profileStore.myProfile?.name,
      lastname: profileStore.myProfile?.lastname,
      profession: profileStore.myProfile?.profession,
      phone: profileStore.myProfile?.phone,
      userBio: profileStore.myProfile?.userBio,
    });
  }, [methods, profileStore.myProfile?.name, profileStore.myProfile?.lastname, profileStore.myProfile?.profession, profileStore.myProfile?.phone, profileStore.myProfile?.userBio]);

  const imageUriFromStore = useMemo(
    () => (profileStore.myProfile?.avatarFile ? getUserAvatar(profileStore.myProfile) : null),
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
        uiStore.showSnackbar(LARGE_FILE_ERROR, 'warning');
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
          src = new File({ uri: compressedUri, name: fileName, type: asset.type || 'image/jpeg' } as any);
        } catch (error) {
          console.warn('compressImage failed, fallback to original', error);
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
      uiStore.showSnackbar('Photo uploaded successfully', 'success');
    } catch (error) {
      console.error('onPressSelect error:', error);
      uiStore.showSnackbar('Upload failed', 'error');
    }
  }, [compressImage, profileStore, uiStore]);

  const onPressRemove = useCallback(async () => {
    try {
      const fullPath = profileStore?.myProfile?.avatarFile;
      if (!fullPath) {
        uiStore.showSnackbar('No photo to delete', 'warning');
        return;
      }
      const fileName = fullPath.split('/').pop();
      if (!fileName) {
        uiStore.showSnackbar('Invalid file path', 'error');
        return;
      }

      setLocalImageUri(null);
      setPreviewVisible(false);

      await profileStore.deleteProfilePhoto(fileName);
      await profileStore.fetchMyProfile();

      uiStore.showSnackbar('Photo deleted successfully', 'success');
    } catch (error) {
      console.error('onPressRemove error:', error);
      uiStore.showSnackbar('Failed to delete photo', 'error');
    }
  }, [profileStore, uiStore]);

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

