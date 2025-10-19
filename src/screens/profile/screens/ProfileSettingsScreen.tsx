import { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { CardContainer, DeleteAccountButton, HeaderDefault, TelegramFeedbackLink, ListItem, ThemeSwitcher } from 'rn-vs-lb';
import { useTheme, ThemeType, SizesType, GlobalStyleSheetType } from 'rn-vs-lb/theme';
import { appVersion, TELEGRAM_URL } from '../../../constants/links';
import { useRootStore } from '../../../store/StoreProvider';
import { useActions, usePortalNavigation } from '../../../helpers/hooks';

export const ProfileSettingsScreen: FC = () => {
    const { globalStyleSheet, theme, sizes, typography } = useTheme();
    const styles = getStyles({ globalStyleSheet, theme, sizes });

    const { authStore, profileStore, uiStore } = useRootStore();
    const { goBack, goToLogin } = usePortalNavigation();
    const { handleShareUserLink, myId } = useActions();
    const navigation = useNavigation<any>();

    const handleLogOut = async () => {
        await authStore.logout();
        goToLogin();
    }

    const handleDeleteAccount = async () => {
        await profileStore.deleteAccount();
        uiStore.showSnackbar("Your request has been sent. Your account will be deleted within 24 hours.", "success");
    };

    const SETTING_LIST = [
        { icon: 'user-o', label: 'Edit Profile', action: () => navigation.navigate('editProfileSetting') },
        { icon: 'gear', label: 'Account Settings', action: () => navigation.navigate('accountSetting') },
        { icon: 'key', label: 'Change Password', action: () => navigation.navigate('changePasswordSetting') },
        { icon: 'group', label: 'Social Profiles', action: () => navigation.navigate('socialProfilesSetting') },
        { icon: 'bell', label: 'Notifications', action: () => navigation.navigate('notificationSetting') },
    ];

    const COPY_LINK = [
        { icon: 'copy', label: 'Copy link', action: () => handleShareUserLink(myId) },
    ];

    const LOGOUT = { icon: 'sign-out', label: 'Logout', action: () => handleLogOut() }

    return (
        // <SafeAreaView style={styles.container}>
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
        // </SafeAreaView>
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
