import React, { FC } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { FormProvider, useForm } from 'react-hook-form';
import { useRootStore } from '../../store/StoreProvider';
import { TextInput } from '../../components/form';
import { LogoAiPair }from '../../components';
import { usePortalNavigation } from '../../helpers/hooks';
import { useTheme } from 'rn-vs-lb/theme';
import { Button, Spacer } from 'rn-vs-lb';


const Forgot: FC = () => {
    const { globalStyleSheet, theme, isDark, typography } = useTheme();
    const methods = useForm();
    const { authStore } = useRootStore();
    const { goToLogin, goToOtp, goToMain } = usePortalNavigation();

    const handleSubmit = methods.handleSubmit(async (data: any) => {
        const email = data.email
        try {
            await authStore.activateEmail(email);
            goToOtp(data.email, { reset: true })

        } catch (errors: any) {
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
                                        paddingTop: "60%",
                                    }}
                                >
                                    <TouchableOpacity onPress={() => goToMain()} style={{ marginLeft: 18 }}>
                                        <LogoAiPair isDark={isDark}/>
                                    </TouchableOpacity>
                                </View>
                                <Text style={typography.titleH2Regular}>Восстановление пароля</Text>
                                <Spacer size='xxs'/>
                                <Text style={[typography.bodyXs, globalStyleSheet.formDescription]}>Введите электронную почту, чтобы получить доступ к восстановлению</Text>
                            </View>
                            <View style={[globalStyleSheet.loginarea, { backgroundColor: theme.card }]}>
                                <TextInput
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

                                <View style={{ marginTop: 10 }}>
                                    <Button
                                        title="Далее"
                                        onPress={handleSubmit}
                                    />
                                </View>

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

export default Forgot;