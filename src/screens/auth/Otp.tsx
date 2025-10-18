import React, { FC } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { FormProvider, useForm } from 'react-hook-form';
import { useRootStore } from '../../store/StoreProvider';
import { OtpInput } from '../../components/form';
import { usePortalNavigation } from '../../helpers/hooks';
import { useTheme } from 'rn-vs-lb/theme';
import { Logo } from '../../components';
import { ROUTES, type AuthStackParamList } from '../../navigation';
import { Button, Spacer } from 'rn-vs-lb';

type AuthScreenNavigationProp = RouteProp<AuthStackParamList, typeof ROUTES.Otp>;

type OtpFormData = {
    code: string[]; // ['abc', 'xyz', '123'] → итого 9 символов
};

const INPUT_CODE_NAME = "code"

const Otp: FC = () => {
    const { globalStyleSheet, theme, isDark, typography } = useTheme();
    const route = useRoute<AuthScreenNavigationProp>();
    const { goToLogin, goToMain, goToChangePassword } = usePortalNavigation();
    const { email, reset, redirectTo } = route.params;

    const { authStore } = useRootStore();
    const methods = useForm<OtpFormData>({
        defaultValues: {
            code: ['', '', ''],
        },
    });

    if (!email) goToLogin()

    const navigateToMain = React.useCallback(() => {
        if (redirectTo) {
            goToMain(redirectTo.tab, redirectTo.params);
        } else {
            goToMain();
        }
    }, [goToMain, redirectTo]);

    const handleSubmit = methods.handleSubmit(async (data) => {
        const fullOtp = data.code.join('');

        if (fullOtp.length !== 9) {
            methods.setError(`${INPUT_CODE_NAME}`, {
                message: 'Please enter a valid 9-character code!',
            });
            return;
        }

        try {
            if (reset) {
                const data = await authStore.resetPassword({ verificationCode: fullOtp, email });
                goToChangePassword(data.link)
            }
            else {
                await authStore.otp({ verificationCode: fullOtp, email });
                navigateToMain();
            }
        } catch (errors: any) {
            // Устанавливаем ошибки для полей
            Object.entries(errors).forEach(([field, message]) => {
                methods.setError(INPUT_CODE_NAME, { type: 'server', message: message as string });
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
                                <Text style={typography.titleH2Regular}>Enter Code</Text>
                                <Spacer size='xxs'/>
                                <Text style={[typography.bodyXs, globalStyleSheet.formDescription]}>Enter the 9-digit code sent to your email</Text>
                            </View>
                            <View style={[globalStyleSheet.loginarea, { backgroundColor: theme.card }]}>

                                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                                    <OtpInput
                                        name={INPUT_CODE_NAME}
                                        numberOfSections={3}
                                        sectionLength={3}
                                        methods={methods}
                                        rules={{
                                            required: 'Please fill this part',
                                        }}
                                    />
                                </View>

                                <View style={{ marginTop: 10 }}>
                                    <Button title="Next"
                                        onPress={handleSubmit}
                                    />
                                </View>

                                <View style={{ flex: 1 }}></View>
                                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 15 }}>
                                    <Text style={typography.body}>Already have an account
                                    </Text>
                                    <TouchableOpacity
                                        onPress={goToLogin}
                                    >
                                        <Text style={[typography.textLink, { textDecorationLine: 'underline', marginLeft: 5 }]}>Sign In</Text>
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

export default Otp;