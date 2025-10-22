import React, { Component } from 'react';
import {
    View,
    Text,
    Linking,
    Platform,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
    RefreshControl,
    Animated,
    Easing,
} from 'react-native';
import axios from 'axios';
import { Button, Spacer } from 'rn-vs-lb';
import { ThemeContext } from 'rn-vs-lb/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API_URL, appVersion } from '../../constants/links';

type VersionResponse = {
    minVersion: string;
    latestVersion: string;
    iosStoreUrl: string;
    androidStoreUrl: string;
};

const compareVersions = (current: string, required: string): boolean => {
    const cur = current.split('.').map(Number);
    const req = required.split('.').map(Number);
    for (let i = 0; i < req.length; i++) {
        if ((cur[i] ?? 0) < req[i]) return true;
        if ((cur[i] ?? 0) > req[i]) return false;
    }
    return false;
};

type ForceUpdateWrapperProps = { children: React.ReactNode };

type ForceUpdateWrapperState = {
    shouldBlock: boolean;
    storeUrl: string | null;
    loading: boolean;
    refreshing: boolean;
};

export class ForceUpdateWrapper extends Component<ForceUpdateWrapperProps, ForceUpdateWrapperState> {
    static contextType = ThemeContext;
    declare context: React.ContextType<typeof ThemeContext>;

    state: ForceUpdateWrapperState = {
        shouldBlock: false,
        storeUrl: null,
        loading: true,
        refreshing: false,
    };

    private isMountedFlag = false;

    private animation = new Animated.Value(0);

    private animationLoop: Animated.CompositeAnimation | null = null;

    componentDidMount() {
        this.isMountedFlag = true;
        this.init();
    }

    componentDidUpdate(_: ForceUpdateWrapperProps, prevState: ForceUpdateWrapperState) {
        if (!prevState.shouldBlock && this.state.shouldBlock) {
            this.startAnimation();
        }

        if (prevState.shouldBlock && !this.state.shouldBlock) {
            this.stopAnimation();
        }
    }

    componentWillUnmount() {
        this.isMountedFlag = false;
        this.stopAnimation();
    }

    private startAnimation() {
        if (this.animationLoop) return;

        this.animation.setValue(0);
        this.animationLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(this.animation, {
                    toValue: -10,
                    duration: 500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(this.animation, {
                    toValue: 10,
                    duration: 500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(this.animation, {
                    toValue: 0,
                    duration: 500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );

        this.animationLoop.start();
    }

    private stopAnimation() {
        if (!this.animationLoop) return;
        this.animationLoop.stop();
        this.animationLoop = null;
    }

    private async init() {
        this.safeSetState({ loading: true });
        await this.checkVersion();
        this.safeSetState({ loading: false });
    }

    private async checkVersion() {
        try {
            const response = await axios.get<VersionResponse>(`${API_URL}auth/app-version`);
            const { minVersion, iosStoreUrl, androidStoreUrl } = response.data;

            const outdated = compareVersions(appVersion, minVersion);

            if (outdated) {
                this.safeSetState({
                    shouldBlock: true,
                    storeUrl: Platform.OS === 'ios' ? iosStoreUrl : androidStoreUrl,
                });
            } else {
                this.safeSetState({ shouldBlock: false, storeUrl: null });
            }
        } catch (error) {
            console.error('Version check failed', error);
        }
    }

    private onRefresh = async () => {
        this.safeSetState({ refreshing: true });
        await this.checkVersion();
        this.safeSetState({ refreshing: false });
    };

    private safeSetState(state: Partial<ForceUpdateWrapperState>) {
        if (!this.isMountedFlag) return;
        this.setState(state as Pick<ForceUpdateWrapperState, keyof ForceUpdateWrapperState>);
    }

    private onPressUpdate = () => {
        const { storeUrl } = this.state;
        if (storeUrl) {
            Linking.openURL(storeUrl);
        }
    };

    render() {
        const { children } = this.props;
        const { shouldBlock, loading, refreshing } = this.state;

        if (loading) {
            return (
                <View style={styles.center}>
                    <ActivityIndicator size="large" />
                </View>
            );
        }

        if (shouldBlock) {
            const { commonStyles, typography, theme } = this.context;

            return (
                <ScrollView
                    contentContainerStyle={[commonStyles.container, { backgroundColor: theme.background, flexGrow: 1, justifyContent: 'center' }]}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={this.onRefresh} />}
                >
                    <Animated.View style={[styles.iconContainer, { transform: [{ translateY: this.animation }] }]}>
                        <MaterialCommunityIcons name="update" size={64} color={theme.primary} />
                    </Animated.View>
                    <Spacer size="xl" />
                    <Text style={[typography.titleH2, styles.title]}>Update Required</Text>
                    <Spacer size="sm" />
                    <Text style={[typography.body, styles.description]}>
                        A new version of the app is available. Please update to continue.
                    </Text>
                    <Spacer size="xl" />
                    <View style={styles.button}>
                        <Button title="Update" onPress={this.onPressUpdate} />
                    </View>
                </ScrollView>
            );
        }

        return <>{children}</>;
    }
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    button: { width: '70%' },
    iconContainer: { alignItems: 'center' },
    title: { textAlign: 'center' },
    description: { textAlign: 'center', paddingHorizontal: 20 },
});
