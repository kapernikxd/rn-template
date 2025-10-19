import { FC, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CardContainer, HeaderDefault, ProfilePhotoUpload, Spacer, Button } from 'rn-vs-lb';
import { ThemeType, useTheme } from 'rn-vs-lb/theme';
import { FormProvider, useForm } from 'react-hook-form';
import { observer } from 'mobx-react-lite';

import { TextArea, TextInput } from '../../../components/form';
import { useRootStore } from '../../../store/StoreProvider';
import { IOScrollView } from 'react-native-intersection-observer';
import { usePortalNavigation } from '../../../helpers/hooks';
import { UpdateProfileProps } from '../../../types/profile';
import { getUserAvatar } from '../../../helpers/utils/user';

export const EditProfilesScreen: FC = observer(() => {
    const { theme } = useTheme();
    const styles = getStyles({ theme });
    const { profileStore, uiStore } = useRootStore();
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
            // получаем только измененные поля
            const changedFields = Object.fromEntries(
                Object.entries(data).filter(([key, value]) => value !== initialValues[key as keyof typeof initialValues])
            );

            if (Object.keys(changedFields).length === 0) {
                uiStore.showSnackbar('Nothing changed', 'info');
                return;
            }

            await profileStore.updateProfile(changedFields);
            uiStore.showSnackbar('Updated', 'success');
        }
        catch (e) {
            uiStore.showSnackbar('Failed', 'error')
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

    const imageUri = profileStore.myProfile?.avatarFile ? getUserAvatar(profileStore.myProfile) : null

    useEffect(() => {
        onRefresh()
    }, [])

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
                                <ProfilePhotoUpload imageUri={imageUri} />
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