import React, { FC } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { FormProvider, useForm } from 'react-hook-form';
import { RouteProp, useRoute } from '@react-navigation/native';
import { usePortalNavigation } from '../../helpers/hooks';
import { TextInput as VSTextInput } from '../../components/form';
import { useRootStore } from '../../store/StoreProvider';
import { useTheme } from 'rn-vs-lb/theme';
import { Spacer, Button } from 'rn-vs-lb';
import { Logo } from '../../components';
import { ROUTES, type AuthStackParamList } from '../../navigation/types';

type AuthScreenNavigationProp = RouteProp<AuthStackParamList, typeof ROUTES.ChangePassword>;

const ChangePassword: FC = () => {
    const { globalStyleSheet, theme, isDark, typography } = useTheme();
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
                                        <Logo width={210} height={95} isDark={isDark}/>
                                    </TouchableOpacity>
                                </View>
                                <Text style={typography.titleH2Regular}>Смена пароля</Text>
                                <Spacer size='xxs'/>
                                <Text style={[typography.bodyXs, globalStyleSheet.formDescription]}>Введите новый пароль для доступа к аккаунту</Text>
                            </View>
                            <View style={[globalStyleSheet.loginarea, { backgroundColor: theme.card }]}>
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

                                <View style={{}}>
                                    <Button
                                        title="Подтвердить"
                                        onPress={handleSubmit}
                                    />
                                </View>

                                <View style={{ flex: 1 }}></View>
                                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 15 }}>
                                    <Text style={typography.body}>Уже есть аккаунт
                                    </Text>
                                    <TouchableOpacity
                                        onPress={goToLogin}
                                    >
                                        <Text style={[typography.textLink, { textDecorationLine: 'underline', marginLeft: 5 }]}>Войти</Text>
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