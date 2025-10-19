import React, { FC, useEffect } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CardContainer, HeaderDefault, Spacer, Button } from 'rn-vs-lb';
import { ThemeType, useTheme } from 'rn-vs-lb/theme';
import { FormProvider, useForm } from 'react-hook-form';
import { observer } from 'mobx-react-lite';

import { TextInput } from '../../../components/form';
import { useRootStore } from '../../../store/StoreProvider';
import { usePortalNavigation } from '../../../helpers/hooks';

type SocialMediaForm = {
    facebook?: string,
    instagram?: string,
    vk?: string,
    tg?: string,
}

export const SocialProfilesScreen: FC = observer(() => {
    const { theme } = useTheme();
    const styles = getStyles({ theme });
    const { profileStore, uiStore } = useRootStore();
    const { goBack } = usePortalNavigation();

    const methods = useForm({
        defaultValues: {
            facebook: profileStore.myProfile?.socialMediaLinks?.facebook,
            instagram: profileStore.myProfile?.socialMediaLinks?.instagram,
            vk: profileStore.myProfile?.socialMediaLinks?.vk,
            tg: profileStore.myProfile?.socialMediaLinks?.tg,
        },
    });

    useEffect(() => {
        methods.reset({
            facebook: profileStore.myProfile?.socialMediaLinks?.facebook ?? '',
            instagram: profileStore.myProfile?.socialMediaLinks?.instagram ?? '',
            vk: profileStore.myProfile?.socialMediaLinks?.vk ?? '',
            tg: profileStore.myProfile?.socialMediaLinks?.tg ?? '',
        });
    }, [
        profileStore.myProfile?.socialMediaLinks?.facebook,
        profileStore.myProfile?.socialMediaLinks?.instagram,
        profileStore.myProfile?.socialMediaLinks?.vk,
        profileStore.myProfile?.socialMediaLinks?.tg,
        methods,
    ]);

    const handleSubmit = methods.handleSubmit(async (data: SocialMediaForm) => {
        try {
            await profileStore.updateProfile({
                socialMediaLinks: {
                    ...data,
                },
            })
            uiStore.showSnackbar('Updated', 'success')
        }
        catch {
            uiStore.showSnackbar('Failed', 'error')
        }
    });

    const handleReset = () => {
        methods.reset();
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <FormProvider {...methods}>
                    <HeaderDefault title="Social Profiles" onBackPress={goBack} />

                    {/* Прокручиваемая часть с полями ввода */}
                    <ScrollView
                        style={{ flex: 1 }}
                    >
                        <CardContainer
                            style={styles.card}
                            styleTitleContainer={styles.cardTitleContainer}
                            subTitle="Add elsewhere links to your profile"
                        >
                            <View style={styles.cardContent}>
                                <TextInput
                                    name="facebook"
                                    label="Facebook"
                                    icon={<FontAwesome name={'facebook-official'}
                                        size={20}
                                        color={theme.greyText}
                                        style={{ marginRight: 10 }} />}
                                    placeholder="Enter username"
                                    control={methods.control}
                                    keyboardType="default"
                                />
                                <Spacer />
                                <TextInput
                                    name="instagram"
                                    label="Instagram"
                                    icon={<FontAwesome name={'instagram'}
                                        size={20}
                                        color={theme.greyText}
                                        style={{ marginRight: 10 }} />}
                                    placeholder="Enter username"
                                    control={methods.control}
                                    keyboardType="default"
                                />
                                <Spacer />
                                <TextInput
                                    name="vk"
                                    label="VK"
                                    icon={<FontAwesome name={'vk'}
                                        size={20}
                                        color={theme.greyText}
                                        style={{ marginRight: 10 }} />}
                                    placeholder="Enter username"
                                    control={methods.control}
                                    keyboardType="default"
                                />
                                <Spacer />
                                <TextInput
                                    name="tg"
                                    label="Telegram"
                                    icon={<FontAwesome name={'telegram'}
                                        size={20}
                                        color={theme.greyText}
                                        style={{ marginRight: 10 }} />}
                                    placeholder="Enter username"
                                    control={methods.control}
                                    keyboardType="default"
                                />
                                <Spacer />
                            </View>
                        </CardContainer>
                    </ScrollView>

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
                </FormProvider>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
});

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
