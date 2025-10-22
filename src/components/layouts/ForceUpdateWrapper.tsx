import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { useTheme } from 'rn-vs-lb/theme';
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

export const ForceUpdateWrapper: FC<ForceUpdateWrapperProps> = ({ children }) => {
  const { theme, commonStyles, typography } = useTheme() as any;

  // унифицируем доступ к стилям темы (подстрой под свою реализацию useTheme)
  const ui = useMemo(() => {
    return {
      bg: theme?.background ?? '#fff',
      primary: theme?.primary ?? '#6f2da8',
      container: commonStyles?.container ?? { flex: 1, padding: 16 },
      titleH2: typography?.titleH2 ?? { fontSize: 24, fontWeight: '700' },
      body: typography?.body ?? { fontSize: 16 },
    };
  }, [theme, commonStyles, typography]);

  const [shouldBlock, setShouldBlock] = useState(false);
  const [storeUrl, setStoreUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isMountedRef = useRef(true);

  const anim = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  const startAnimation = useCallback(() => {
    if (loopRef.current) return;
    anim.setValue(0);
    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: -10, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 10, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loopRef.current.start();
  }, [anim]);

  const stopAnimation = useCallback(() => {
    loopRef.current?.stop();
    loopRef.current = null;
  }, []);

  const safeUpdate = useCallback(<T,>(updater: () => T) => {
    if (!isMountedRef.current) return;
    return updater();
  }, []);

  const checkVersion = useCallback(async () => {
    try {
      const resp = await axios.get<VersionResponse>(`${API_URL}auth/app-version`);
      const { minVersion, iosStoreUrl, androidStoreUrl } = resp.data;
      const outdated = compareVersions(appVersion, minVersion);

      safeUpdate(() => {
        if (outdated) {
          setShouldBlock(true);
          setStoreUrl(Platform.OS === 'ios' ? iosStoreUrl : androidStoreUrl);
        } else {
          setShouldBlock(false);
          setStoreUrl(null);
        }
      });
    } catch (e) {
      console.error('Version check failed', e);
      // В случае ошибки не блокируем пользователя
      safeUpdate(() => {
        setShouldBlock(false);
        setStoreUrl(null);
      });
    }
  }, [safeUpdate]);

  const init = useCallback(async () => {
    safeUpdate(() => setLoading(true));
    await checkVersion();
    safeUpdate(() => setLoading(false));
  }, [checkVersion, safeUpdate]);

  useEffect(() => {
    isMountedRef.current = true;
    init();
    return () => {
      isMountedRef.current = false;
      stopAnimation();
    };
  }, [init, stopAnimation]);

  useEffect(() => {
    if (shouldBlock) startAnimation();
    else stopAnimation();
  }, [shouldBlock, startAnimation, stopAnimation]);

  const onRefresh = useCallback(async () => {
    safeUpdate(() => setRefreshing(true));
    await checkVersion();
    safeUpdate(() => setRefreshing(false));
  }, [checkVersion, safeUpdate]);

  const onPressUpdate = useCallback(() => {
    if (storeUrl) Linking.openURL(storeUrl);
  }, [storeUrl]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (shouldBlock) {
    return (
      <ScrollView
        contentContainerStyle={[ui.container, { backgroundColor: ui.bg, flexGrow: 1, justifyContent: 'center' }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Animated.View style={[styles.iconContainer, { transform: [{ translateY: anim }] }]}>
          <MaterialCommunityIcons name="update" size={64} color={ui.primary} />
        </Animated.View>

        <Spacer size="xl" />
        <Text style={[ui.titleH2, styles.title]}>Update Required</Text>

        <Spacer size="sm" />
        <Text style={[ui.body, styles.description]}>
          A new version of the app is available. Please update to continue.
        </Text>

        <Spacer size="xl" />
        <View style={styles.button}>
          <Button title="Update" onPress={onPressUpdate} />
        </View>
      </ScrollView>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  button: { width: '70%' },
  iconContainer: { alignItems: 'center' },
  title: { textAlign: 'center' },
  description: { textAlign: 'center', paddingHorizontal: 20 },
});
