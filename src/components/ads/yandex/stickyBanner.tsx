import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { BannerView, BannerAdSize, AdRequest } from "yandex-mobile-ads";

// 👉 сюда поставь свой ID баннера из кабинета Яндекса
const YANDEX_BANNER_AD_UNIT_ID = 'demo-banner-yandex' // "R-M-17968689-1";

const YandexStickyBanner = () => {
  const [adSize, setAdSize] = useState<BannerAdSize | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const prepareBannerSize = async () => {
      try {
        // фиксированный maxWidth, например 320
        const size = await BannerAdSize.stickySize(320);
        setAdSize(size);
        setShowBanner(true);
      } catch (error) {
        console.warn("Failed to get banner size", error);
        setShowBanner(false);
      }
    };

    prepareBannerSize();
  }, []);

  const adRequest = new AdRequest({}); // можно передавать параметры, но для простоты оставим пустым

  return (
      <View style={styles.bannerWrapper}>
        {showBanner && adSize ? (
          <BannerView
            size={adSize}
            adUnitId={YANDEX_BANNER_AD_UNIT_ID}
            adRequest={adRequest}
            onAdLoaded={() => console.log("Yandex banner loaded")}
            onAdFailedToLoad={(event: any) => {
              console.warn("Yandex banner failed", event.nativeEvent);
              setShowBanner(false);
            }}
          />
        ) : (
          <ActivityIndicator />
        )}
      </View>
  );
};

export default YandexStickyBanner;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
});
