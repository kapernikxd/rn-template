import { FC, useCallback, useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
    CardContainer,
    DeleteAccountButton,
    HeaderDefault,
    TelegramFeedbackLink,
    ListItem,
    ThemeSwitcher,
    Spacer,
} from 'rn-vs-lb';
import { useTheme, ThemeType, SizesType, GlobalStyleSheetType } from 'rn-vs-lb/theme';
import { ADS_ENABLED, appVersion, TELEGRAM_URL } from '../../constants/links';
import { useRootStore } from '../../store/StoreProvider';
import { useActions, usePortalNavigation } from '../../helpers/hooks';
import { ProfileNav, ROUTES } from '../../navigation/types';
import { useSafeAreaColors } from '../../store/SafeAreaColorProvider';
import { RewardedAdSettingsCard } from '../../components/ads/components/RewardedAdSettingsCard';
import SettingsListItem from '../../components/SettingsListItem';
import LanguageSelector from '../../components/settings/LanguageSelector';
import { FontAwesome } from '@expo/vector-icons';

type SettingsRoute =
    | typeof ROUTES.ProfileEdit
    | typeof ROUTES.ProfileAccountSettings
    | typeof ROUTES.ProfileChangePassword
    | typeof ROUTES.ProfileSocialProfiles
    | typeof ROUTES.ProfileNotificationSettings;

export const SettingsScreen: FC = () => {
    const { globalStyleSheet, theme, sizes, typography } = useTheme();
    const { setColors } = useSafeAreaColors();
    const styles = getStyles({ globalStyleSheet, theme, sizes });
    const { t } = useTranslation();

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
        uiStore.showSnackbar(t('settings.deleteAccount.requestSent'), "success");
    }, [profileStore, t, uiStore]);

    const navigateTo = useCallback(
        (screen: SettingsRoute) => () => navigation.navigate(screen),
        [navigation],
    );

    const SETTING_LIST = useMemo(
        () => [
            { icon: 'user-o', label: t('settings.section.accountManagement.editProfile'), action: navigateTo(ROUTES.ProfileEdit) },
            // { icon: 'gear', label: t('settings.account.accountSettings'), action: navigateTo(ROUTES.ProfileAccountSettings) },
            { icon: 'key', label: t('settings.section.accountManagement.changePassword'), action: navigateTo(ROUTES.ProfileChangePassword) },
            // { icon: 'group', label: t('settings.account.socialProfiles'), action: navigateTo(ROUTES.ProfileSocialProfiles) },
            { icon: 'bell', label: t('settings.section.accountManagement.notifications'), action: navigateTo(ROUTES.ProfileNotificationSettings) },
        ],
        [navigateTo, t],
    );

    const COPY_LINK = useMemo(
        () => [
            { icon: 'copy', label: t('settings.section.copyAppLink'), action: () => handleShareUserLink(myId) },
        ],
        [handleShareUserLink, myId, t],
    );

    const LOGOUT = useMemo(
        () => ({ icon: 'sign-out', label: t('logout'), action: () => handleLogOut() }),
        [handleLogOut, t],
    );

    useEffect(() => {
        if (!profileStore.myProfile?._id) {
            profileStore.fetchMyProfile();
        }
    }, [profileStore, profileStore.myProfile?._id]);

    useEffect(() => {
        setColors({
            topColor: theme.white,
            bottomColor: theme.white,
        });
    }, [theme, setColors]);

    return (
        <View style={styles.content}>
            <HeaderDefault title={t('settings.title')} onBackPress={goBack} />
            <ScrollView contentContainerStyle={styles.body}>
                <View style={styles.list}>
                    <CardContainer style={styles.card}>
                        <View><Text style={styles.title}>{t('settings.section.accountManagement.title')}</Text></View>
                        {SETTING_LIST.map((item, index) => (
                            <ListItem big iconColor={theme.text} key={index} {...item} hideBottomLine />
                        ))}
                    </CardContainer>
                    <CardContainer style={styles.card}>
                        <View><Text style={styles.title}>{t('settings.component.theme.title')}</Text></View>
                        <ThemeSwitcher lightModeLabel={t('settings.component.theme.light')} darkModeLabel={t('settings.component.theme.dark')} />
                        <Spacer size='xs' />
                        <SettingsListItem
                            label={t('settings.component.language.title')}
                            laberColor={theme.text}
                            accessory={<LanguageSelector />}
                            labelIcon={<FontAwesome color={theme.text} name="language" size={21} />}
                            labelIconColor={theme.text}
                        />
                    </CardContainer>
                    {ADS_ENABLED ? <RewardedAdSettingsCard style={styles.card} /> : null}
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
                <Spacer size='xl' />
                <Spacer size='xl' />
                <View>
                    <CardContainer style={styles.card}>
                        <TelegramFeedbackLink
                            title={t('settings.component.feedback.title')}
                            subtitle={t('settings.component.feedback.subtitle')}
                            unsupportedLinkMessage={t('settings.component.feedback.unsupported')}
                            link={TELEGRAM_URL}
                        />
                    </CardContainer>
                    <CardContainer style={styles.card}>
                        <DeleteAccountButton
                            cancelButtonLabel={t('common.cancel')}
                            confirmButtonLabel={t('common.confirm')}
                            triggerLabel={t('settings.component.deleteAccount.title')}
                            modalTitle={t('settings.component.deleteAccount.modalTitle')}
                            modalDescription={t('settings.component.deleteAccount.modalDescription')}
                            deleteAccount={handleDeleteAccount}
                        />
                    </CardContainer>
                    <View style={styles.version}>
                        <Text style={typography.body}>{t('settings.section.version', { version: appVersion })}</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
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
        flexGrow: 1,
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
        backgroundColor: theme.card,
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
