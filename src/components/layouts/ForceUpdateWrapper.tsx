import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Linking,
  Animated,
  Easing,
} from 'react-native';
import axios from 'axios';
import { API_URL, appVersion } from '../../constants/links';
import { UpdateRequiredView } from '../../components/UpdateRequiredView';

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

type Props = { children: React.ReactNode };

export const ForceUpdateWrapper: FC<Props> = ({ children }) => {
  const [shouldBlock, setShouldBlock] = useState(false);
  const [storeUrl, setStoreUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isMountedRef = useRef(true);

  // наружная анимация передаётся в чистый компонент
  const anim = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  const startAnimation = useCallback(() => {
    if (loopRef.current) return;
    anim.setValue(0);
    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: -10, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 10,  duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0,   duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loopRef.current.start();
  }, [anim]);

  const stopAnimation = useCallback(() => {
    loopRef.current?.stop();
    loopRef.current = null;
  }, []);

  const safe = useCallback((fn: () => void) => {
    if (isMountedRef.current) fn();
  }, []);

  const checkVersion = useCallback(async () => {
    try {
      const resp = await axios.get<VersionResponse>(`${API_URL}auth/app-version`);
      const { minVersion, iosStoreUrl, androidStoreUrl } = resp.data;
      const outdated = compareVersions(appVersion, minVersion);
      safe(() => {
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
      safe(() => {
        setShouldBlock(false);
        setStoreUrl(null);
      });
    }
  }, [safe]);

  const init = useCallback(async () => {
    safe(() => setLoading(true));
    await checkVersion();
    safe(() => setLoading(false));
  }, [checkVersion, safe]);

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
    safe(() => setRefreshing(true));
    await checkVersion();
    safe(() => setRefreshing(false));
  }, [checkVersion, safe]);

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
      <UpdateRequiredView
        anim={anim}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onPressUpdate={onPressUpdate}
      />
    );
    }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
});
