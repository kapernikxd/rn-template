import React, { FC } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput as VSTextInput } from '../../components/form';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useRootStore } from '../../store/StoreProvider';
import { LogoAiPair }from '../../components';
import { usePortalNavigation, usePushNotifications } from '../../helpers/hooks';
import { useTheme } from 'rn-vs-lb/theme';
import { RegistrationParams } from '../../types/auth';
import { Button, Spacer } from 'rn-vs-lb';


const Register: FC = () => {
    const { globalStyleSheet, theme, isDark, typography } = useTheme();
    const { t } = useTranslation();
    const methods = useForm();
    const { authStore } = useRootStore();
    const { goToLogin, goToOtp, goToMain } = usePortalNavigation();
    const { expoPushToken } = usePushNotifications();

    const handleSubmit = methods.handleSubmit(async (data: any) => {
        try {
            await authStore.registration(data as RegistrationParams, expoPushToken);
            goToOtp(data.email)
        } catch (errors: any) {
            // Устанавливаем ошибки для полей
            Object.entries(errors).forEach(([field, message]) => {
                methods.setError(field, { type: 'server', message: message as string });
            });
        }
    });

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <FormProvider {...methods}>
                        <View style={{ backgroundColor: theme.background, flex: 1 }}>
                            <View style={{ alignItems: 'center' }}>
                                <View
                                    style={{
                                        paddingTop: 30,
                                        paddingBottom: 0
                                    }}
                                >
                                    <TouchableOpacity onPress={() => goToMain()} style={{ marginTop: '5%', marginLeft: 18 }}>
                                        <LogoAiPair isDark={isDark} />
                                    </TouchableOpacity>
                                </View>
                                <Text style={typography.titleH2Regular}>{t('auth.register.title')}</Text>
                                <Spacer size='xxs'/>
                                <Text style={[typography.bodyXs, globalStyleSheet.formDescription]}>
                                    {t('auth.register.subtitle')}
                                </Text>
                            </View>
                            <View style={[globalStyleSheet.loginarea, { backgroundColor: theme.card }]}>
                                <VSTextInput
                                    name='name'
                                    label={t('auth.fields.name.label')}
                                    placeholder={t('auth.fields.name.placeholder')}
                                    control={methods.control}
                                    keyboardType='default'
                                    iconType='person-outline'
                                    rules={{
                                        required: t('auth.fields.name.validation.required'),
                                    }}
                                />
                                <Spacer />

                                <VSTextInput
                                    name='lastname'
                                    label={t('auth.fields.lastname.label')}
                                    placeholder={t('auth.fields.lastname.placeholder')}
                                    control={methods.control}
                                    keyboardType='default'
                                    iconType='person-outline'
                                    rules={{
                                        required: t('auth.fields.lastname.validation.required'),
                                    }}
                                />
                                <Spacer />

                                <VSTextInput
                                    name='email'
                                    label={t('auth.fields.email.label')}
                                    placeholder={t('auth.fields.email.placeholder')}
                                    control={methods.control}
                                    keyboardType='email-address'
                                    iconType='alternate-email'
                                    rules={{
                                        required: t('auth.fields.email.validation.required'),
                                        pattern: {
                                            value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
                                            message: t('auth.fields.email.validation.invalid'),
                                        }
                                    }}
                                />
                                <Spacer />

                                <VSTextInput
                                    name='password'
                                    label={t('auth.fields.password.label')}
                                    placeholder={t('auth.fields.password.placeholder')}
                                    iconType='lock'
                                    secureTextEntry={true}
                                    control={methods.control}
                                    rules={{
                                        required: t('auth.fields.password.validation.required'),
                                        minLength: {
                                            value: 6,
                                            message: t('auth.fields.password.validation.minLength', { min: 6 }),
                                        }
                                    }
                                    } />
                                <Spacer />

                                <VSTextInput
                                    name='rePassword'
                                    label={t('auth.fields.confirmPassword.label')}
                                    placeholder={t('auth.fields.confirmPassword.placeholder')}
                                    iconType='lock'
                                    secureTextEntry={true}
                                    control={methods.control}
                                    rules={{
                                        required: t('auth.fields.confirmPassword.validation.required'),
                                        minLength: {
                                            value: 6,
                                            message: t('auth.fields.confirmPassword.validation.minLength', { min: 6 }),
                                        },
                                        validate: (value: string) =>
                                            value === methods.getValues('password') || t('auth.fields.confirmPassword.validation.mismatch'),
                                    }}
                                />

                                <Spacer size='lg' />

                                <View style={{ marginTop: 10 }}>
                                    <Button
                                        title={t('auth.register.submit')}
                                        onPress={handleSubmit}
                                    />
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
                                    <Text style={typography.body}>{t('auth.register.haveAccount')}</Text>
                                    <TouchableOpacity onPress={goToLogin}>
                                        <Text style={[typography.textLink, {textDecorationLine: 'underline', marginLeft: 5 }]}>
                                            {t('auth.register.loginLink')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </FormProvider>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Register;