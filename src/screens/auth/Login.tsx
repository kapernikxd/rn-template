import React, { FC, useCallback, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { FormProvider, useForm } from 'react-hook-form';
import { useRootStore } from '../../store/StoreProvider';
import { TermsCheckbox, TextInput } from '../../components/form';
import { Spacer, Button } from 'rn-vs-lb';
import { useTheme } from 'rn-vs-lb/theme';
import { observer } from 'mobx-react-lite';

import { usePortalNavigation, usePushNotifications } from '../../helpers/hooks';
import { RouteProp, useRoute } from '@react-navigation/native';

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { LoginParams } from '../../types/auth';
import { Logo } from '../../components';

import { IMAGES } from '../../constants/theme';
import { ROUTES, type AuthStackParamList } from '../../navigation';


const Login: FC = observer(() => {
  const { globalStyleSheet, theme, isDark, typography } = useTheme();
  const methods = useForm();
  const { authStore } = useRootStore();
  const { goToOtp, goToForgotPassword, goToMain, goToRegister } = usePortalNavigation();
  const { expoPushToken } = usePushNotifications();
  const route = useRoute<RouteProp<AuthStackParamList, typeof ROUTES.Login>>();

  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [showTermsError, setShowTermsError] = React.useState(false);

  const [loading, setLoading] = React.useState(false);
  const [loadingGoogle, setloadingGoogle] = React.useState(false);
  const [loadingApple, setloadingApple] = React.useState(false);

  const redirectTo = route.params?.redirectTo;

  const navigateToMain = useCallback(() => {
    if (redirectTo) {
      goToMain(redirectTo.tab, redirectTo.params);
    } else {
      goToMain();
    }
  }, [goToMain, redirectTo]);

  const refreshAccessToken = async () => {
    await authStore.refreshAccessToken();
    if (authStore.isAuth) navigateToMain();
  }

  const handleSubmit = methods.handleSubmit(async (data: any) => {
    if (!termsAccepted) {
      setShowTermsError(true);
      return;
    }
    setShowTermsError(false);

    try {
      setLoading(true);
      const response = await authStore.login(data as LoginParams, expoPushToken);
      if (!response.user.isActivated) goToOtp(response.user.email, { redirect: redirectTo })
      else navigateToMain();
    } catch (errors: any) {
      // Устанавливаем ошибки для полей
      Object.entries(errors).forEach(([field, message]) => {
        methods.setError(field, { type: 'server', message: message as string });
      });
    } finally {
      setLoading(false);
    }
  });

  const signInWithGoogle = async () => {
    if (!termsAccepted) {
      setShowTermsError(true);
      return;
    }
    setShowTermsError(false);

    try {
      setloadingGoogle(true);
      await GoogleSignin.hasPlayServices(); // проверка на наличие Google Play Services
      const userInfo = await GoogleSignin.signIn(); // авторизация

      const idToken = userInfo.data ? userInfo.data.idToken : "";

      if (!idToken) throw new Error('No idToken from Google');

      const response = await authStore.loginByGoogle(idToken, expoPushToken); // отправка idToken на бэкенд
      if (!response.user.isActivated) goToOtp(response.user.email, { redirect: redirectTo })
      else navigateToMain();

    } catch (error) {
      console.error('Google Sign-In error:', error);
    }
    finally {
      setloadingGoogle(false);
    }
  };

  const signInWithApple = async () => {
    if (!termsAccepted) {
      setShowTermsError(true);
      return;
    }
    setShowTermsError(false);

    try {
      setloadingApple(true);

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const identityToken = credential.identityToken;

      if (!identityToken) throw new Error('No identityToken from Apple');

      await authStore.loginByApple(identityToken, expoPushToken);
      navigateToMain();

    } catch (error) {
      console.error('Apple Sign-In error:', error);
    } finally {
      setloadingApple(false);
    }
  };


  useEffect(() => {
    if (!authStore.accessToken) {
      refreshAccessToken()
    }
  }, [authStore.accessToken])

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '728122372039-p3a7ldhulc7t8c4c5vj0m17t61a1luu8.apps.googleusercontent.com', // из Google Cloud Console
      iosClientId: '728122372039-a6jj9godm62p3o7vov8f7q5psjfppiu7.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  return (
    <>
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
                    <TouchableOpacity onPress={() => goToMain()} style={{ marginTop: Platform.OS === 'ios' ? '10%' : '20%', marginLeft: 18 }}>
                      <Logo width={205} height={55} isDark={isDark} />
                    </TouchableOpacity>
                  </View>
                  <Text style={typography.titleH2Regular}>Login Account</Text>
                  <Spacer size='xxs' />
                  <Text style={[typography.bodyXs, globalStyleSheet.formDescription]}>Please enter your credentials to access your account and detail</Text>
                </View>
                <View style={[globalStyleSheet.loginarea, { backgroundColor: theme.card }]}>
                  <TextInput
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

                  <TextInput
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

                  <Spacer size='md' />

                  <TermsCheckbox
                    accepted={termsAccepted}
                    onToggle={() => setTermsAccepted(!termsAccepted)}
                    showError={showTermsError}
                    color={theme.primary}
                  />

                  <View style={{ alignItems: 'flex-end' }}>
                    <TouchableOpacity
                      onPress={goToForgotPassword}
                    >
                      <Text style={globalStyleSheet.btnlink}>Forgot Password?</Text>
                    </TouchableOpacity>
                  </View>

                  <Button
                    loading={loading}
                    title="Login"
                    onPress={handleSubmit}
                  />

                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 0, flex: 1 }}>
                    <View style={{ flex: 1, width: 0, backgroundColor: theme.border, height: 1 }}></View>
                    <View>
                      <Text style={[typography.body, { paddingHorizontal: 10, paddingVertical: Platform.OS === 'ios' ? 30 : 20 }]}>or login with</Text>
                    </View>
                    <View style={{ flex: 1, width: 0, backgroundColor: theme.border, height: 1 }}></View>
                  </View>

                  <View style={{ flex: 1 }}>
                    {Platform.OS === 'ios' && (
                      <AppleAuthentication.AppleAuthenticationButton
                        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                        cornerRadius={8}
                        style={{ width: '100%', height: 46, marginBottom: 12 }}
                        onPress={signInWithApple}
                      />
                    )}
                    <TouchableOpacity onPress={signInWithGoogle} style={[globalStyleSheet.mediabtn, { backgroundColor: theme.backgroundBtn }]}>
                      {loadingGoogle
                        ? <ActivityIndicator color={theme.primary} size={26} />
                        : <>
                          <Image
                            style={{ position: 'absolute', left: 25, width: 20, height: 20 }}
                            source={IMAGES.google}
                          />
                          <Text style={typography.titleH6}>Login with Google</Text></>
                      }
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
                      <Text style={typography.body}>Don't have an account?
                      </Text>
                      <TouchableOpacity
                        onPress={goToRegister}
                      >
                        <Text style={[typography.textLink, { textDecorationLine: 'underline', marginLeft: 5 }]}>Sign Up</Text>
                      </TouchableOpacity>
                    </View>

                  </View>
                </View>
              </View>
            </FormProvider>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
});

export default Login;