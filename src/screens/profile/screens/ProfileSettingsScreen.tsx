import { FC, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    CardContainer,
    DeleteAccountButton,
    HeaderDefault,
    TelegramFeedbackLink,
    ListItem,
    ThemeSwitcher,
} from 'rn-vs-lb';
import { useTheme, ThemeType, SizesType, GlobalStyleSheetType } from 'rn-vs-lb/theme';
import { appVersion, TELEGRAM_URL } from '../../../constants/links';
import { useRootStore } from '../../../store/StoreProvider';
import { useActions, usePortalNavigation } from '../../../helpers/hooks';
import { ProfileNav, ROUTES } from '../../../navigation/types';

type SettingsRoute =
    | typeof ROUTES.ProfileEdit
    | typeof ROUTES.ProfileAccountSettings
    | typeof ROUTES.ProfileChangePassword
    | typeof ROUTES.ProfileSocialProfiles
    | typeof ROUTES.ProfileNotificationSettings;

export const ProfileSettingsScreen: FC = () => {
    const { globalStyleSheet, theme, sizes, typography } = useTheme();
    const styles = getStyles({ globalStyleSheet, theme, sizes });

    const { authStore, profileStore, uiStore } = useRootStore();
    const { goBack, goToLogin } = usePortalNavigation();
    const { handleShareUserLink, myId } = useActions();
    const navigation = useNavigation<ProfileNav>();

    const handleLogOut = useCallback(async () => {
        await authStore.logout();
        goToLogin();
    }, [authStore, goToLogin]);

    const handleDeleteAccount = useCallback(async () => {
        await profileStore.deleteAccount();
        uiStore.showSnackbar("Your request has been sent. Your account will be deleted within 24 hours.", "success");
    }, [profileStore, uiStore]);

    const navigateTo = useCallback(
        (screen: SettingsRoute) => () => navigation.navigate(screen),
        [navigation],
    );

    const SETTING_LIST = useMemo(
        () => [
            { icon: 'user-o', label: 'Edit Profile', action: navigateTo(ROUTES.ProfileEdit) },
            { icon: 'gear', label: 'Account Settings', action: navigateTo(ROUTES.ProfileAccountSettings) },
            { icon: 'key', label: 'Change Password', action: navigateTo(ROUTES.ProfileChangePassword) },
            { icon: 'group', label: 'Social Profiles', action: navigateTo(ROUTES.ProfileSocialProfiles) },
            { icon: 'bell', label: 'Notifications', action: navigateTo(ROUTES.ProfileNotificationSettings) },
        ],
        [navigateTo],
    );

    const COPY_LINK = useMemo(
        () => [
            { icon: 'copy', label: 'Copy link', action: () => handleShareUserLink(myId) },
        ],
        [handleShareUserLink, myId],
    );

    const LOGOUT = useMemo(
        () => ({ icon: 'sign-out', label: 'Logout', action: () => handleLogOut() }),
        [handleLogOut],
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <HeaderDefault title={'Settings'} onBackPress={goBack} />
                <View style={styles.body}>
                    <View style={styles.list}>
                        <CardContainer style={styles.card}>
                            <View><Text style={styles.title}>Update Account</Text></View>
                            {SETTING_LIST.map((item, index) => (
                                <ListItem iconColor={theme.text} key={index} {...item} hideBottomLine />
                            ))}
                        </CardContainer>
                        <CardContainer style={styles.card}>
                            <View><Text style={styles.title}>Theme</Text></View>
                            <ThemeSwitcher />
                        </CardContainer>
                        <CardContainer style={styles.card}>
                            {COPY_LINK.map((item, index) => (
                                <ListItem iconColor={theme.text} key={index} {...item} hideBottomLine hideArrow />
                            ))}
                        </CardContainer>
                        <View style={styles.logoutContainer}>
                            <CardContainer style={styles.card}>
                                <ListItem iconColor={theme.text} {...LOGOUT} hideBottomLine />
                            </CardContainer>
                        </View>
                    </View>
                    <View>
                        <CardContainer style={styles.card}>
                            <TelegramFeedbackLink link={TELEGRAM_URL} />
                        </CardContainer>
                        <CardContainer style={styles.card}>
                            <DeleteAccountButton deleteAccount={handleDeleteAccount} />
                        </CardContainer>
                        <View style={styles.version}>
                            <Text style={typography.body}>Ver {appVersion}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const getStyles = ({ sizes, globalStyleSheet, theme }: { theme: ThemeType, sizes: SizesType, globalStyleSheet: GlobalStyleSheetType }) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.white
    },
    content: {
        backgroundColor: theme.background,
        height: '100%'
    },
    body: {
        flex: 1,
        justifyContent: 'space-between',
    },
    list: {
        marginTop: 4,
    },
    card: {
        marginHorizontal: 8,
        marginVertical: 4,
        borderRadius: 16,
        borderBottomWidth: 0,
    },
    title: {
        marginLeft: sizes.xxs,
        paddingVertical: sizes.xxs,
        ...globalStyleSheet.descriptionCard,
        color: theme.placeholder,
    },
    logoutContainer: {},
    version: {
        alignItems: 'center',
        padding: sizes.xs,
    },
});
