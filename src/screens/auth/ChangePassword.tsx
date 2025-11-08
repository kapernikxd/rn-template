import React, { FC } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { FormProvider, useForm } from 'react-hook-form';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { usePortalNavigation } from '../../helpers/hooks';
import { TextInput as VSTextInput } from '../../components/form';
import { useRootStore } from '../../store/StoreProvider';
import { useTheme } from 'rn-vs-lb/theme';
import { Spacer, Button } from 'rn-vs-lb';
import { LogoAiPair } from '../../components';
import { ROUTES, type AuthStackParamList } from '../../navigation/types';

type AuthScreenNavigationProp = RouteProp<AuthStackParamList, typeof ROUTES.ChangePassword>;

const ChangePassword: FC = () => {
    const { globalStyleSheet, theme, isDark, typography } = useTheme();
    const { t } = useTranslation();
    const route = useRoute<AuthScreenNavigationProp>();
    const { link } = route.params;

    const methods = useForm();
    const { authStore } = useRootStore();
    const { goToLogin, goToMain } = usePortalNavigation();

    if (!link) goToLogin()

    const handleSubmit = methods.handleSubmit(async (data: any) => {
        try {
            await authStore.newPassword({ activatedLink: link, password: data.password })
            goToLogin()
        } catch (errors: any) {
            // Устанавливаем ошибки для полей
            Object.entries(errors).forEach(([field, message]) => {
                methods.setError('password', { type: 'server', message: message as string });
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
                                        paddingTop: 40,
                                        paddingBottom: 20
                                    }}
                                >
                                    <TouchableOpacity onPress={() => goToMain()} style={{ marginTop: '35%', marginLeft: 18 }}>
                                        <LogoAiPair isDark={isDark}/>
                                    </TouchableOpacity>
                                </View>
                                <Text style={typography.titleH2Regular}>{t('auth.changePassword.title')}</Text>
                                <Spacer size='xxs'/>
                                <Text style={[typography.bodyXs, globalStyleSheet.formDescription]}>
                                    {t('auth.changePassword.subtitle')}
                                </Text>
                            </View>
                            <View style={[globalStyleSheet.loginarea, { backgroundColor: theme.card }]}>
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

                                <View>
                                    <Button
                                        title={t('auth.changePassword.submit')}
                                        onPress={handleSubmit}
                                    />
                                </View>

                                <View style={{ flex: 1 }}></View>
                                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 15 }}>
                                    <Text style={typography.body}>{t('auth.changePassword.haveAccount')}</Text>
                                    <TouchableOpacity onPress={goToLogin}>
                                        <Text style={[typography.textLink, { textDecorationLine: 'underline', marginLeft: 5 }]}>
                                            {t('auth.changePassword.loginLink')}
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

export default ChangePassword;