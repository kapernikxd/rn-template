import React, { FC } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput as VSTextInput } from '../../components/form';
import { FormProvider, useForm } from 'react-hook-form';
import { useRootStore } from '../../store/StoreProvider';
import { LogoAiPair }from '../../components';
import { usePortalNavigation, usePushNotifications } from '../../helpers/hooks';
import { useTheme } from 'rn-vs-lb/theme';
import { RegistrationParams } from '../../types/auth';
import { Button, Spacer } from 'rn-vs-lb';


const Register: FC = () => {
    const { globalStyleSheet, theme, isDark, typography } = useTheme();
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
                                <Text style={typography.titleH2Regular}>Создать аккаунт</Text>
                                <Spacer size='xxs'/>
                                <Text style={[typography.bodyXs, globalStyleSheet.formDescription]}>Введите свои данные, чтобы получить доступ к аккаунту и возможностям</Text>
                            </View>
                            <View style={[globalStyleSheet.loginarea, { backgroundColor: theme.card }]}>
                                <VSTextInput
                                    name='name'
                                    label='Имя'
                                    placeholder='Имя'
                                    control={methods.control}
                                    keyboardType='default'
                                    iconType='person-outline'
                                    rules={{
                                        required: 'Введите имя!',
                                    }}
                                />
                                <Spacer />

                                <VSTextInput
                                    name='lastname'
                                    label='Фамилия'
                                    placeholder='Фамилия'
                                    control={methods.control}
                                    keyboardType='default'
                                    iconType='person-outline'
                                    rules={{
                                        required: 'Введите фамилию!',
                                    }}
                                />
                                <Spacer />

                                <VSTextInput
                                    name='email'
                                    label='Электронная почта'
                                    placeholder='Введите электронную почту'
                                    control={methods.control}
                                    keyboardType='email-address'
                                    iconType='alternate-email'
                                    rules={{
                                        required: 'Введите электронную почту!',
                                        pattern: {
                                            value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
                                            message: 'Неверный адрес электронной почты!',
                                        }
                                    }}
                                />
                                <Spacer />

                                <VSTextInput
                                    name='password'
                                    label='Пароль'
                                    placeholder='Введите пароль'
                                    iconType='lock'
                                    secureTextEntry={true}
                                    control={methods.control}
                                    rules={{
                                        required: 'Введите пароль!',
                                        minLength: {
                                            value: 6,
                                            message: 'Пароль должен содержать не менее 6 символов!',
                                        }
                                    }
                                    } />
                                <Spacer />

                                <VSTextInput
                                    name='rePassword'
                                    label='Подтвердите пароль'
                                    placeholder='Повторите пароль'
                                    iconType='lock'
                                    secureTextEntry={true}
                                    control={methods.control}
                                    rules={{
                                        required: 'Подтвердите пароль!',
                                        minLength: {
                                            value: 6,
                                            message: 'Пароль должен содержать не менее 6 символов!',
                                        },
                                        validate: (value: string) =>
                                            value === methods.getValues('password') || 'Пароли не совпадают!',
                                    }}
                                />

                                <Spacer size='lg' />

                                <View style={{ marginTop: 10 }}>
                                    <Button title="Зарегистрироваться"
                                        onPress={handleSubmit}
                                    />
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
                                    <Text style={typography.body}>Уже есть аккаунт
                                    </Text>
                                    <TouchableOpacity
                                        onPress={goToLogin}
                                    >
                                        <Text style={[typography.textLink, {textDecorationLine: 'underline', marginLeft: 5 }]}>Войти</Text>
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