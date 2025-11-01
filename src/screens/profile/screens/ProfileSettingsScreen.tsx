import { FC, Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View, Switch, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import {
    CardContainer,
    DeleteAccountButton,
    HeaderDefault,
    TelegramFeedbackLink,
    ListItem,
    Spacer,
} from 'rn-vs-lb';
import { useTheme, ThemeType, SizesType, TypographytType, GlobalStyleSheetType } from 'rn-vs-lb/theme';
import { MaterialIcons } from '@expo/vector-icons';
import Clipboard from 'expo-clipboard';
import { ADS_ENABLED, RATE_US_URL, TERMS_OF_USE_URL, appVersion, TELEGRAM_URL } from '../../../constants/links';
import { useRootStore } from '../../../store/StoreProvider';
import { useActions, usePortalNavigation } from '../../../helpers/hooks';
import { ProfileNav, ROUTES } from '../../../navigation/types';
import { useSafeAreaColors } from '../../../store/SafeAreaColorProvider';
import { RewardedAdSettingsCard } from '../../../components/ads/components/RewardedAdSettingsCard';

type SettingsRoute =
    | typeof ROUTES.ProfileEdit
    | typeof ROUTES.ProfileAccountSettings
    | typeof ROUTES.ProfileChangePassword
    | typeof ROUTES.ProfileSocialProfiles
    | typeof ROUTES.ProfileNotificationSettings;

type ValueTone = 'default' | 'primary' | 'muted' | 'success';

type ValueItem = {
    type: 'value';
    id: string;
    label: string;
    value: string;
    valueTone?: ValueTone;
    description?: string;
    showChevron?: boolean;
    onPress?: () => void;
    disabled?: boolean;
};

type ToggleItem = {
    type: 'toggle';
    id: string;
    label: string;
    description?: string;
    value?: boolean;
    defaultValue?: boolean;
    onValueChange?: (value: boolean) => void;
    disabled?: boolean;
    toggleOnPress?: boolean;
};

type LinkItem = {
    type: 'link';
    id: string;
    label: string;
    description?: string;
    showChevron?: boolean;
    onPress?: () => void;
    disabled?: boolean;
};

type AppSettingsItem = ValueItem | ToggleItem | LinkItem;

export interface AppSettingsSectionData {
    id: string;
    title: string;
    items: AppSettingsItem[];
}

export const ProfileSettingsScreen: FC = () => {
    const { globalStyleSheet, theme, sizes, typography, isDark, toggleTheme } = useTheme();
    const { setColors } = useSafeAreaColors();
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
        uiStore.showSnackbar("Ваш запрос отправлен. Аккаунт будет удалён в течение 24 часов.", "success");
    }, [profileStore, uiStore]);

    const navigateTo = useCallback(
        (screen: SettingsRoute) => () => navigation.navigate(screen),
        [navigation],
    );

    const SETTING_LIST = useMemo(
        () => [
            { icon: 'user-o', label: 'Редактировать профиль', action: navigateTo(ROUTES.ProfileEdit) },
            // { icon: 'gear', label: 'Настройки аккаунта', action: navigateTo(ROUTES.ProfileAccountSettings) },
            { icon: 'key', label: 'Смена пароля', action: navigateTo(ROUTES.ProfileChangePassword) },
            // { icon: 'group', label: 'Социальные профили', action: navigateTo(ROUTES.ProfileSocialProfiles) },
            { icon: 'bell', label: 'Уведомления', action: navigateTo(ROUTES.ProfileNotificationSettings) },
        ],
        [navigateTo],
    );

    const COPY_LINK = useMemo(
        () => [
            { icon: 'copy', label: 'Скопировать ссылку', action: () => handleShareUserLink(myId) },
        ],
        [handleShareUserLink, myId],
    );

    const LOGOUT = useMemo(
        () => ({ icon: 'sign-out', label: 'Выйти', action: () => handleLogOut() }),
        [handleLogOut],
    );

    const handleToggleTheme = useCallback(
        (next: boolean) => {
            if (next !== isDark) {
                toggleTheme();
            }
        },
        [isDark, toggleTheme],
    );

    const handleLanguagePress = useCallback(() => {
        uiStore.showSnackbar('Функция скоро будет доступна', 'info');
    }, [uiStore]);

    const handleRateUs = useCallback(async () => {
        try {
            await Linking.openURL(RATE_US_URL);
        } catch (error) {
            uiStore.showSnackbar('Не удалось открыть ссылку', 'error');
        }
    }, [uiStore]);

    const handleTermsPress = useCallback(async () => {
        try {
            await Linking.openURL(TERMS_OF_USE_URL);
        } catch (error) {
            uiStore.showSnackbar('Не удалось открыть ссылку', 'error');
        }
    }, [uiStore]);

    const handleCopyUserId = useCallback(async () => {
        if (!myId) {
            return;
        }

        try {
            await Clipboard.setStringAsync(myId);
            uiStore.showSnackbar('User ID скопирован', 'success');
        } catch (error) {
            uiStore.showSnackbar('Не удалось скопировать User ID', 'error');
        }
    }, [myId, uiStore]);

    const APP_SETTINGS_SECTIONS = useMemo<AppSettingsSectionData[]>(
        () => [
            {
                id: 'application-preferences',
                title: 'Приложение',
                items: [
                    {
                        type: 'toggle',
                        id: 'dark-mode',
                        label: 'Тёмная тема',
                        description: 'Переключить оформление приложения',
                        value: isDark,
                        onValueChange: handleToggleTheme,
                        toggleOnPress: true,
                    },
                    {
                        type: 'value',
                        id: 'language',
                        label: 'Язык',
                        value: 'Системный',
                        valueTone: 'muted',
                        showChevron: true,
                        onPress: handleLanguagePress,
                    },
                    {
                        type: 'link',
                        id: 'rate-us',
                        label: 'Оценить приложение',
                        onPress: handleRateUs,
                    },
                    {
                        type: 'link',
                        id: 'terms-of-use',
                        label: 'Пользовательское соглашение',
                        onPress: handleTermsPress,
                    },
                    {
                        type: 'value',
                        id: 'user-id',
                        label: 'User ID',
                        value: myId ?? 'Неизвестно',
                        valueTone: myId ? 'muted' : 'primary',
                        showChevron: Boolean(myId),
                        onPress: myId ? handleCopyUserId : undefined,
                    },
                ],
            },
        ],
        [handleCopyUserId, handleLanguagePress, handleRateUs, handleTermsPress, handleToggleTheme, isDark, myId],
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
            <HeaderDefault title={'Настройки'} onBackPress={goBack} />
            <ScrollView contentContainerStyle={styles.body}>
                <View style={styles.list}>
                    <CardContainer style={styles.card}>
                        <View><Text style={styles.title}>Управление аккаунтом</Text></View>
                        {SETTING_LIST.map((item, index) => (
                            <ListItem big iconColor={theme.text} key={index} {...item} hideBottomLine />
                        ))}
                    </CardContainer>
                    <AppSettingsList style={styles.settingsList} sections={APP_SETTINGS_SECTIONS} />
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
                <Spacer size='xl'/>
                <Spacer size='xl'/>
                <View>
                    <CardContainer style={styles.card}>
                        <TelegramFeedbackLink link={TELEGRAM_URL} />
                    </CardContainer>
                    <CardContainer style={styles.card}>
                        <DeleteAccountButton deleteAccount={handleDeleteAccount} />
                    </CardContainer>
                    <View style={styles.version}>
                        <Text style={typography.body}>Версия {appVersion}</Text>
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
    settingsList: {
        marginHorizontal: 8,
        marginVertical: 4,
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

type SettingsListStyles = ReturnType<typeof getAppSettingsListStyles>;

type SettingsListTypography = TypographytType;

type SettingsLinkRowProps = {
    item: ValueItem | LinkItem;
    isLast: boolean;
    styles: SettingsListStyles;
    theme: ThemeType;
    typography: SettingsListTypography;
};

type SettingsToggleRowProps = {
    item: ToggleItem;
    isLast: boolean;
    styles: SettingsListStyles;
    theme: ThemeType;
    typography: SettingsListTypography;
};

type AppSettingsListProps = {
    sections: AppSettingsSectionData[];
    style?: StyleProp<ViewStyle>;
};

const AppSettingsList = ({ sections, style }: AppSettingsListProps) => {
    const { theme, typography, sizes } = useTheme();
    const styles = useMemo(() => getAppSettingsListStyles(theme, sizes), [sizes, theme]);

    return (
        <View style={style}>
            {sections.map((section, sectionIndex) => (
                <View
                    key={section.id}
                    style={[
                        styles.section,
                        sectionIndex !== sections.length - 1 && styles.sectionSpacing,
                    ]}
                >
                    <Text style={[typography.titleH6Regular, styles.sectionTitle]}>
                        {section.title}
                    </Text>
                    <View style={styles.sectionCard}>
                        {section.items.map((item, index) => (
                            <Fragment key={item.id}>
                                {renderSettingsItem({
                                    item,
                                    isLast: index === section.items.length - 1,
                                    styles,
                                    theme,
                                    typography,
                                })}
                            </Fragment>
                        ))}
                    </View>
                </View>
            ))}
        </View>
    );
};

const renderSettingsItem = ({ item, isLast, styles, theme, typography }: {
    item: AppSettingsItem;
    isLast: boolean;
    styles: SettingsListStyles;
    theme: ThemeType;
    typography: SettingsListTypography;
}) => {
    switch (item.type) {
        case 'toggle':
            return (
                <SettingsToggleRow
                    key={item.id}
                    item={item}
                    isLast={isLast}
                    styles={styles}
                    theme={theme}
                    typography={typography}
                />
            );
        case 'link':
        case 'value':
        default:
            return (
                <SettingsLinkRow
                    key={item.id}
                    item={item as ValueItem | LinkItem}
                    isLast={isLast}
                    styles={styles}
                    theme={theme}
                    typography={typography}
                />
            );
    }
};

const SettingsLinkRow = ({ item, isLast, styles, theme, typography }: SettingsLinkRowProps) => {
    const { disabled } = item;
    const isPressable = !disabled && typeof item.onPress === 'function';
    const showChevron = item.type === 'link'
        ? item.showChevron !== false
        : Boolean(item.showChevron);

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={item.onPress}
            disabled={!isPressable}
            style={[
                styles.item,
                !isLast && styles.itemBorder,
                disabled && styles.itemDisabled,
            ]}
        >
            <View style={styles.itemContent}>
                <Text
                    style={[
                        typography.titleH6Regular,
                        styles.label,
                        disabled && styles.disabledText,
                    ]}
                    numberOfLines={2}
                >
                    {item.label}
                </Text>
                {item.description ? (
                    <Text style={[typography.body, styles.description]} numberOfLines={2}>
                        {item.description}
                    </Text>
                ) : null}
            </View>
            <View style={styles.rightContent}>
                {'value' in item ? (
                    <Text
                        style={[
                            typography.body,
                            styles.value,
                            getValueToneStyle(item.valueTone, styles),
                            disabled && styles.disabledText,
                        ]}
                        numberOfLines={1}
                    >
                        {item.value}
                    </Text>
                ) : null}
                {showChevron ? (
                    <MaterialIcons
                        name="chevron-right"
                        size={22}
                        color={theme.placeholder}
                        style={styles.chevron}
                    />
                ) : null}
            </View>
        </TouchableOpacity>
    );
};

const SettingsToggleRow = ({ item, isLast, styles, theme, typography }: SettingsToggleRowProps) => {
    const [internalValue, setInternalValue] = useState<boolean>(item.defaultValue ?? false);
    const { disabled, toggleOnPress } = item;

    const controlledValue = item.value;
    const value = controlledValue ?? internalValue;

    useEffect(() => {
        if (typeof controlledValue === 'boolean') {
            setInternalValue(controlledValue);
        }
    }, [controlledValue]);

    const handleChange = useCallback(
        (next: boolean) => {
            if (disabled) {
                return;
            }

            if (controlledValue === undefined) {
                setInternalValue(next);
            }

            item.onValueChange?.(next);
        },
        [controlledValue, disabled, item],
    );

    return (
        <TouchableOpacity
            activeOpacity={toggleOnPress && !disabled ? 0.7 : 1}
            onPress={toggleOnPress && !disabled ? () => handleChange(!value) : undefined}
            style={[
                styles.item,
                !isLast && styles.itemBorder,
                disabled && styles.itemDisabled,
            ]}
        >
            <View style={styles.itemContent}>
                <Text
                    style={[
                        typography.titleH6Regular,
                        styles.label,
                        disabled && styles.disabledText,
                    ]}
                    numberOfLines={2}
                >
                    {item.label}
                </Text>
                {item.description ? (
                    <Text style={[typography.body, styles.description]} numberOfLines={2}>
                        {item.description}
                    </Text>
                ) : null}
            </View>
            <Switch
                value={value}
                onValueChange={handleChange}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={theme.white}
                ios_backgroundColor={theme.border}
                disabled={disabled}
            />
        </TouchableOpacity>
    );
};

const getValueToneStyle = (tone: ValueTone | undefined, styles: SettingsListStyles) => {
    switch (tone) {
        case 'primary':
            return styles.valuePrimary;
        case 'muted':
            return styles.valueMuted;
        case 'success':
            return styles.valueSuccess;
        default:
            return null;
    }
};

const getAppSettingsListStyles = (theme: ThemeType, sizes: SizesType) =>
    StyleSheet.create({
        section: {
            marginBottom: sizes.lg,
        },
        sectionSpacing: {
            marginBottom: sizes.xl,
        },
        sectionTitle: {
            marginBottom: sizes.sm,
            color: theme.text,
        },
        sectionCard: {
            borderRadius: 16,
            backgroundColor: theme.card,
            overflow: 'hidden',
        },
        item: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: sizes.md,
            paddingVertical: sizes.sm,
        },
        itemBorder: {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.border,
        },
        itemDisabled: {
            opacity: 0.5,
        },
        itemContent: {
            flex: 1,
            marginRight: sizes.sm,
        },
        rightContent: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        label: {
            color: theme.text,
        },
        description: {
            marginTop: 4,
            color: theme.placeholder,
        },
        value: {
            color: theme.text,
            maxWidth: 160,
        },
        valuePrimary: {
            color: theme.primary,
        },
        valueMuted: {
            color: theme.placeholder,
        },
        valueSuccess: {
            color: theme.success,
        },
        chevron: {
            marginLeft: 4,
        },
        disabledText: {
            color: theme.placeholder,
        },
    });
