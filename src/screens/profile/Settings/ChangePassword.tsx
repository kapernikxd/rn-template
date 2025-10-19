import React, { FC } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CardContainer, HeaderDefault, Spacer, Button } from 'rn-vs-lb';
import { ThemeType, useTheme } from 'rn-vs-lb/theme';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';

import { TextInput } from '../../../components/form';
import { useRootStore } from '../../../store/StoreProvider';
import { usePortalNavigation } from '../../../helpers/hooks';



export const ChangePasswordScreen: FC = () => {
    const { theme } = useTheme();
    const styles = getStyles({ theme });
    const { profileStore, uiStore } = useRootStore();
    const methods = useForm();
    const { goBack } = usePortalNavigation();

    const handleSubmit = methods.handleSubmit(async (data: FieldValues) => {
        try {
            await profileStore.changePassword({ oldPassword: data.oldPassword, password: data.password })
            uiStore.showSnackbar('Udpated', 'success')
        }
        catch (errors: any) {
            // Устанавливаем ошибки для полей
            Object.entries(errors).forEach(([field, message]) => {
                methods.setError(field, { type: 'server', message: message as string });
            });

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
                    <HeaderDefault title="Change Password" onBackPress={goBack} />

                    {/* Прокручиваемая часть с полями ввода */}
                    <ScrollView
                        style={{ flex: 1 }}
                    >
                        <CardContainer
                            style={styles.card}
                            styleTitleContainer={styles.cardTitleContainer}
                            subTitle="Change your account password"
                        >
                            <View style={styles.cardContent}>

                                <TextInput
                                    name='oldPassword'
                                    label='Old Password'
                                    placeholder='Enter password'
                                    secureTextEntry={true}
                                    control={methods.control}
                                    rules={{
                                        required: 'Password is required!',
                                        minLength: {
                                            value: 6,
                                            message: 'Password must be at least 6 characters!',
                                        }
                                    }
                                    } />
                                <Spacer />

                                <TextInput
                                    name='password'
                                    label='New Password'
                                    placeholder='Enter new password'
                                    secureTextEntry={true}
                                    control={methods.control}
                                    rules={{
                                        required: 'Password is required!',
                                        minLength: {
                                            value: 6,
                                            message: 'Password must be at least 6 characters!',
                                        }
                                    }
                                    } />
                                <Spacer />

                                <TextInput
                                    name='rePassword'
                                    label='Confirm Password'
                                    placeholder='Confirm new password'
                                    secureTextEntry={true}
                                    control={methods.control}
                                    rules={{
                                        required: 'Confirm Password is required!',
                                        minLength: {
                                            value: 6,
                                            message: 'Password must be at least 6 characters!',
                                        },
                                        validate: (value: string) =>
                                            value === methods.getValues('password') || 'Passwords do not match!',
                                    }}
                                />
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
}

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