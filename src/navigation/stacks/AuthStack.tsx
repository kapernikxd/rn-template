import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ROUTES, type AuthStackParamList } from '../types';
import { ChangePassword, Forgot, Login, Otp, Register } from '../../screens/auth';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name={ROUTES.Login} component={Login} />
    <Stack.Screen name={ROUTES.Register} component={Register} />
    <Stack.Screen name={ROUTES.ForgotPassword} component={Forgot} />
    <Stack.Screen name={ROUTES.Otp} component={Otp} />
    <Stack.Screen name={ROUTES.ChangePassword} component={ChangePassword} />
  </Stack.Navigator>
);

export default AuthStack;
