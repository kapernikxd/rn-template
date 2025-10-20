import React, { FC } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput as VSTextInput } from '../../components/form';
import { FormProvider, useForm } from 'react-hook-form';
import { useRootStore } from '../../store/StoreProvider';
import { Logo, MainLayout } from '../../components';
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
        <MainLayout
            bottomBackgroundColor={theme.card}
            backgroundSplit={0.35}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <FormProvider {...methods}>
                        <View style={{ flex: 1 }}>
                            <View style={{ alignItems: 'center' }}>
                                <View
                                    style={{
                                        paddingTop: 30,
                                        paddingBottom: 0
                                    }}
                                >
                                    <TouchableOpacity onPress={() => goToMain()} style={{ marginTop: '5%', marginLeft: 18 }}>
                                        <Logo width={210} height={95} isDark={isDark} />
                                    </TouchableOpacity>
                                </View>
                                <Text style={typography.titleH2Regular}>Create an Account</Text>
                                <Spacer size='xxs'/>
                                <Text style={[typography.bodyXs, globalStyleSheet.formDescription]}>Please enter your credentials to access your account and detail</Text>
                            </View>
                            <View style={[globalStyleSheet.loginarea, { backgroundColor: theme.card }]}>
                                <VSTextInput
                                    name='name'
                                    label='First Name'
                                    placeholder='First Name'
                                    control={methods.control}
                                    keyboardType='default'
                                    iconType='person-outline'
                                    rules={{
                                        required: 'Name is required!',
                                    }}
                                />
                                <Spacer />

                                <VSTextInput
                                    name='lastname'
                                    label='Last name'
                                    placeholder='Last Name'
                                    control={methods.control}
                                    keyboardType='default'
                                    iconType='person-outline'
                                    rules={{
                                        required: 'Last Name is required!',
                                    }}
                                />
                                <Spacer />

                                <VSTextInput
                                    name='email'
                                    label='Email'
                                    placeholder='Enter your email'
                                    control={methods.control}
                                    keyboardType='email-address'
                                    iconType='alternate-email'
                                    rules={{
                                        required: 'Email is required!',
                                        pattern: {
                                            value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
                                            message: 'Invalid email address!',
                                        }
                                    }}
                                />
                                <Spacer />

                                <VSTextInput
                                    name='password'
                                    label='Password'
                                    placeholder='Enter password'
                                    iconType='lock'
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

                                <VSTextInput
                                    name='rePassword'
                                    label='Confirm Password'
                                    placeholder='Confirm password'
                                    iconType='lock'
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

                                <Spacer size='lg' />

                                <View style={{ marginTop: 10 }}>
                                    <Button title="Register"
                                        onPress={handleSubmit}
                                    />
                                </View>
                                
                                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
                                    <Text style={typography.body}>Already have an account
                                    </Text>
                                    <TouchableOpacity
                                        onPress={goToLogin}
                                    >
                                        <Text style={[typography.textLink, {textDecorationLine: 'underline', marginLeft: 5 }]}>Sign In</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </FormProvider>
                </ScrollView>
            </KeyboardAvoidingView>
        </MainLayout>
    );
};

export default Register;