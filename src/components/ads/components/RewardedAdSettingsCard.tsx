import { FC } from 'react';
import { ViewStyle } from 'react-native';

import { CardContainer, ListItem } from 'rn-vs-lb';
import { useTheme } from 'rn-vs-lb/theme';
import { useTranslation } from 'react-i18next';

import { useRewardedAdTokensBySource } from '../../../helpers/hooks/useRewardedAdTokensBySource';
import { resolveAdSource, type AdSource } from '../../../types/ads';
import { useRootStore, useStoreData } from '../../../store/StoreProvider';

type RewardedAdSettingsCardProps = {
    style?: ViewStyle;
    adSource?: AdSource;
};

export const RewardedAdSettingsCard: FC<RewardedAdSettingsCardProps> = ({ style, adSource }) => {
    const { theme } = useTheme();
    const { configStore } = useRootStore();
    const adsSourceFromConfig = useStoreData(configStore, (store) => store.adsConfig.ADS_SOURCE);
    const resolvedAdSource = resolveAdSource(adSource ?? adsSourceFromConfig);
    const { balance: tokenBalance, isAdLoaded, showRewardedAd } = useRewardedAdTokensBySource(undefined, resolvedAdSource);
    const { t } = useTranslation();

    return (
        <CardContainer style={style}>
            <ListItem
                iconColor={theme.text}
                icon="diamond"
                label={t('ads.rewardedCard.title')}
                subLabel={t('ads.rewardedCard.balance', { count: tokenBalance })}
                hideArrow
                action={() => undefined}
            />
            <ListItem
                iconColor={theme.text}
                icon="gift"
                label={t('ads.rewardedCard.reward')}
                subLabel={t(isAdLoaded ? 'ads.rewardedCard.adReady' : 'ads.rewardedCard.adLoading')}
                action={showRewardedAd}
                hideArrow
                hideBottomLine
            />
        </CardContainer>
    );
};
