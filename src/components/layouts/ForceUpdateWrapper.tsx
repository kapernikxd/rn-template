import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Linking,
  Animated,
  Easing,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { appVersion } from '../../constants/links';
import { UpdateRequiredView } from 'rn-vs-lb';
import { useRootStore, useStoreData } from '../../store/StoreProvider';
import type { AppVersionConfig } from '../../types/config';

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
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation();

  const isMountedRef = useRef(true);
  const { configStore } = useRootStore();
  const { versionConfig, isInitialized, isLoading } = useStoreData(configStore, (store) => ({
    versionConfig: store.appVersionConfig,
    isInitialized: store.isInitialized,
    isLoading: store.loading,
  }));

  // наружная анимация передаётся в чистый компонент
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

  const safe = useCallback((fn: () => void) => {
    if (isMountedRef.current) fn();
  }, []);

  const updateVersionState = useCallback(
    (config: AppVersionConfig | null) => {
      if (!config) {
        safe(() => {
          setShouldBlock(false);
          setStoreUrl(null);
        });
        return;
      }

      const { minVersion, iosStoreUrl, androidStoreUrl } = config;
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
    },
    [safe],
  );

  useEffect(() => {
    isMountedRef.current = true;
    updateVersionState(versionConfig ?? null);
    return () => {
      isMountedRef.current = false;
      stopAnimation();
    };
  }, [stopAnimation, updateVersionState, versionConfig]);

  useEffect(() => {
    if (shouldBlock) startAnimation();
    else stopAnimation();
  }, [shouldBlock, startAnimation, stopAnimation]);

  const onRefresh = useCallback(async () => {
    safe(() => setRefreshing(true));
    await configStore.fetchConfig();
    safe(() => setRefreshing(false));
  }, [configStore, safe]);

  const onPressUpdate = useCallback(() => {
    if (storeUrl) Linking.openURL(storeUrl);
  }, [storeUrl]);

  useEffect(() => {
    if (versionConfig) {
      updateVersionState(versionConfig);
    }
  }, [updateVersionState, versionConfig]);

  useEffect(() => {
    if (!isInitialized && !isLoading) {
      void configStore.ensureConfigLoaded();
    }
  }, [configStore, isInitialized, isLoading]);

  const isInitialLoading = useMemo(() => !isInitialized || (isLoading && !versionConfig), [isInitialized, isLoading, versionConfig]);

  if (isInitialLoading) {
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
        title={t('components.forceUpdate.title')}
        description={t('components.forceUpdate.description')}
        updateButtonText={t('components.forceUpdate.button')}
      />
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
});
