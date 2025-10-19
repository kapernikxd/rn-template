import { FC, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CardContainer, HeaderDefault, ProfilePhotoUpload, Spacer, Button } from 'rn-vs-lb';
import { ThemeType, useTheme } from 'rn-vs-lb/theme';
import { FormProvider, useForm } from 'react-hook-form';
import { observer } from 'mobx-react-lite';

import { File, Directory, Paths } from 'expo-file-system';
import uuid from 'react-native-uuid';
import { launchImageLibrary } from 'react-native-image-picker';

import { TextArea, TextInput } from '../../../components/form';
import { useRootStore } from '../../../store/StoreProvider';
import { IOScrollView } from 'react-native-intersection-observer';
import { useImageCompressor, usePortalNavigation } from '../../../helpers/hooks';
import { UpdateProfileProps } from '../../../types/profile';
import { getUserAvatar } from '../../../helpers/utils/user';
import { LARGE_FILE_ERROR } from '../../../constants';

function safeCreateDirectory(dir: Directory) {
  try {
    dir.create({ intermediates: true });
  } catch (e: any) {
    const msg = String(e?.message ?? e);
    if (!/already exists/i.test(msg)) {
      throw e; // какие-то другие ошибки не скрываем
    }
  }
}

export const EditProfilesScreen: FC = observer(() => {
    const { theme } = useTheme();
    const styles = getStyles({ theme });
    const { profileStore, uiStore } = useRootStore();
    const { compressImage } = useImageCompressor();
    const { goBack } = usePortalNavigation();

    const initialValues = {
        name: profileStore.myProfile?.name,
        lastname: profileStore.myProfile?.lastname,
        profession: profileStore.myProfile?.profession,
        phone: profileStore.myProfile?.phone,
        userBio: profileStore.myProfile?.userBio,
    };

    const methods = useForm({ defaultValues: initialValues });

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await profileStore.fetchMyProfile();
        setRefreshing(false);
    };

    const handleSubmit = methods.handleSubmit(async (data: UpdateProfileProps) => {
        try {
            const changedFields = Object.fromEntries(
                Object.entries(data).filter(([key, value]) => value !== initialValues[key as keyof typeof initialValues])
            );

            if (Object.keys(changedFields).length === 0) {
                uiStore.showSnackbar('Nothing changed', 'info');
                return;
            }

            await profileStore.updateProfile(changedFields);
            uiStore.showSnackbar('Updated', 'success');
        } catch (e) {
            uiStore.showSnackbar('Failed', 'error');
        }
    });

    const handleReset = () => {
        methods.reset({
            name: profileStore.myProfile.name,
            lastname: profileStore.myProfile.lastname,
            profession: profileStore.myProfile.profession,
            phone: profileStore.myProfile.phone,
            userBio: profileStore.myProfile.userBio,
        });
    };

    const imageUriFromStore = profileStore.myProfile?.avatarFile
        ? getUserAvatar(profileStore.myProfile)
        : null;

    // локальное управление фоткой и превью для «чистого» компонента
    const [previewVisible, setPreviewVisible] = useState(false);
    const [localImageUri, setLocalImageUri] = useState<string | null>(imageUriFromStore);

    // синхронизуем локальное с тем, что пришло из стора
    useEffect(() => {
        setLocalImageUri(imageUriFromStore);
    }, [imageUriFromStore]);

    // === ХЭНДЛЕРЫ ДЛЯ ProfilePhotoUpload (чистого) ===

    const onRequestOpenPreview = () => setPreviewVisible(true);
    const onRequestClosePreview = () => setPreviewVisible(false);
    const onPressEye = () => setPreviewVisible(true);

    const onPressSelect = async () => {
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

            // ✅ безопасно создаём папку, не падаем если уже есть
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
                } catch (e) {
                    console.warn('compressImage failed, fallback to original', e);
                }
            }

            const dst = new File(avatarsDir, fileName);
            src.copy(dst); // если когда-нибудь вдруг попадёшь на коллизию — можно предварительно dst.delete()

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
        } catch (e) {
            console.error('onPressSelect error:', e);
            uiStore.showSnackbar('Upload failed', 'error');
        }
    };



    const onPressRemove = async () => {
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

            // сразу скрываем локально
            setLocalImageUri(null);
            setPreviewVisible(false);

            await profileStore.deleteProfilePhoto(fileName);
            await profileStore.fetchMyProfile();

            uiStore.showSnackbar('Photo deleted successfully', 'success');
        } catch (e) {
            console.error('onPressRemove error:', e);
            uiStore.showSnackbar('Failed to delete photo', 'error');
        }
    };

    useEffect(() => {
        onRefresh();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <FormProvider {...methods}>
                    <HeaderDefault title={'Edit Profile'} onBackPress={goBack} />
                    <IOScrollView style={{ flex: 1 }}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[theme.primary]} // Android
                                tintColor={theme.primary} // iOS
                            />
                        }>
                        <CardContainer style={styles.card} styleTitleContainer={styles.cardTitleContainer} subTitle='Set Up Your Personal Information'>
                            <View>
                                <ProfilePhotoUpload
                                    imageUri={localImageUri}
                                    previewVisible={previewVisible}
                                    onRequestOpenPreview={onRequestOpenPreview}
                                    onRequestClosePreview={onRequestClosePreview}
                                    onPressSelect={onPressSelect}
                                    onPressRemove={onPressRemove}
                                    onPressEye={onPressEye}
                                // при желании можно прокинуть кастомные цвета/размер:
                                // size={180}
                                // enableOverlay
                                // autoHideMs={1000}
                                // colors={{ primary: theme.primary, white: theme.white }}
                                />
                            </View>
                            <View style={styles.cardContent}>
                                <TextInput
                                    name='name'
                                    label='First Name'
                                    placeholder='First Name'
                                    control={methods.control}
                                    keyboardType='default'
                                    rules={{
                                        required: 'First Name is required!',
                                    }}
                                />
                                <Spacer />

                                <TextInput
                                    name='lastname'
                                    label='Last name'
                                    placeholder='Last Name'
                                    control={methods.control}
                                    keyboardType='default'
                                    rules={{
                                        required: 'Last Name is required!',
                                    }}
                                />
                                <Spacer />

                                <TextInput
                                    name='profession'
                                    label='Profession'
                                    placeholder='Your proffession'
                                    control={methods.control}
                                    keyboardType='default'
                                />
                                <Spacer />


                                <TextInput
                                    name='phone'
                                    label='Phone Number'
                                    placeholder='Enter your phone number '
                                    control={methods.control}
                                    keyboardType='numeric'
                                />
                                <Spacer />

                                <TextArea
                                    name='userBio'
                                    label='User Bio'
                                    placeholder='Short information about you'
                                    control={methods.control}
                                />
                            </View>

                            {/* Футер с кнопками внизу экрана */}
                            <View style={styles.footer}>
                                <Button title="Update" onPress={handleSubmit} />
                                <Spacer size="xs" />
                                <Button
                                    title="Reset"
                                    type="gray-outline"
                                    onPress={handleReset}
                                />
                            </View>

                        </CardContainer>
                    </IOScrollView>
                </FormProvider>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
})

const getStyles = ({ theme }: { theme: ThemeType }) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.white },
    card: {
        padding: 0,
        marginVertical: 4,
        borderBottomWidth: 0,
    },
    cardTitleContainer: {
        paddingTop: 0,
    },
    cardContent: {
        marginHorizontal: 16,
        marginVertical: 16,
    },
    footer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
});