import React, { FC, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AdRequest, BannerAdSize, BannerView } from "yandex-mobile-ads";
import { useTheme } from "rn-vs-lb/theme";

const isMobilePlatform = Platform.OS === "ios" || Platform.OS === "android";

interface YandexBottomAdBannerProps {
  adUnitId?: string;
}

export const YandexBottomAdBanner: FC<YandexBottomAdBannerProps> = ({ adUnitId }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [adSize, setAdSize] = useState<BannerAdSize | null>(null);
  const [isAdVisible, setIsAdVisible] = useState(false);

  const resolvedAdUnitId = useMemo(
    () => adUnitId ?? (__DEV__ ? "demo-banner-yandex" : undefined),
    [adUnitId],
  );
  const adRequest = useMemo(() => new AdRequest({}), []);

  useEffect(() => {
    if (!isMobilePlatform || !resolvedAdUnitId) return;

    let isMounted = true;
    const prepareBannerSize = async () => {
      try {
        const size = await BannerAdSize.stickySize(320);
        if (!isMounted) return;

        setAdSize(size);
        setIsAdVisible(true);
      } catch (error) {
        console.warn("Failed to get Yandex banner size", error);
        if (!isMounted) return;
        setIsAdVisible(false);
      }
    };

    void prepareBannerSize();

    return () => {
      isMounted = false;
    };
  }, [resolvedAdUnitId]);

  if (!isMobilePlatform || !resolvedAdUnitId) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingBottom: isAdVisible ? 0 : insets.bottom,
        },
      ]}
    >
      {isAdVisible && adSize ? (
        <BannerView
          size={adSize}
          adUnitId={resolvedAdUnitId}
          adRequest={adRequest}
          onAdLoaded={() => setIsAdVisible(true)}
          onAdFailedToLoad={(event) => {
            console.warn("Yandex banner failed", event?.nativeEvent ?? event);
            setIsAdVisible(false);
          }}
        />
      ) : (
        <ActivityIndicator color={theme.primary} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
