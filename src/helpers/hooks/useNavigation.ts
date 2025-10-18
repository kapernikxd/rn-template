import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList, ROUTES } from "../../navigation";

export const usePortalNavigation = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
   
    return {
        goToLogin: () => navigation.navigate(ROUTES.Login),
        goToOtp: (email: string, reset?: boolean) => navigation.navigate(ROUTES.Otp, { email, reset }),
        goToForgotPassword: () => navigation.navigate(ROUTES.ForgotPassword),
        goToRegister: () => navigation.navigate(ROUTES.Register),
        goToChangePassword: (link: string) => navigation.navigate(ROUTES.ChangePassword, { link }),

        goToMain: () => navigation.navigate(ROUTES.Auth),

        goToTermOfUse: () => navigation.navigate(ROUTES.TermsOfUse),
    };
}