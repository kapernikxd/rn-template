import { FC, useCallback, useEffect } from 'react';
import { ViewStyle } from 'react-native';

import { CardContainer, ListItem } from 'rn-vs-lb';
import { useTheme } from 'rn-vs-lb/theme';
import { TestIds, useRewardedAd } from 'react-native-google-mobile-ads';

import { useRootStore } from '../../../store/StoreProvider';

const REWARDED_AD_UNIT_ID = __DEV__
    ? TestIds.REWARDED
    : 'ca-app-pub-8636022279548301/8567360540';

type RewardedAdSettingsCardProps = {
    style?: ViewStyle;
};

export const RewardedAdSettingsCard: FC<RewardedAdSettingsCardProps> = ({ style }) => {
    const { theme } = useTheme();
    const { uiStore } = useRootStore();
    const { isLoaded, isClosed, isEarnedReward, reward, load, show, error } = useRewardedAd(REWARDED_AD_UNIT_ID, {
        requestNonPersonalizedAdsOnly: true,
    });

    const handleShowRewardedAd = useCallback(() => {
        if (isLoaded) {
            show();
        } else {
            uiStore.showSnackbar('Реклама загружается, попробуйте чуть позже.', 'info');
            load();
        }
    }, [isLoaded, load, show, uiStore]);

    useEffect(() => {
        if (!isLoaded) {
            load();
        }
    }, [isLoaded, load]);

    useEffect(() => {
        if (isClosed && !isLoaded) {
            load();
        }
    }, [isClosed, isLoaded, load]);

    useEffect(() => {
        if (isEarnedReward) {
            const rewardMessage = reward?.amount
                ? `Награда получена! +${reward.amount} ${reward.type ?? ''}`.trim()
                : 'Награда получена! Спасибо за просмотр рекламы.';
            uiStore.showSnackbar(rewardMessage, 'success');
        }
    }, [isEarnedReward, reward, uiStore]);

    useEffect(() => {
        if (error) {
            uiStore.showSnackbar('Не удалось загрузить рекламу. Попробуйте позже.', 'error');
        }
    }, [error, uiStore]);

    return (
        <CardContainer style={style}>
            <ListItem
                iconColor={theme.text}
                icon="gift"
                label="Получить награду"
                subLabel={isLoaded ? 'Реклама готова к показу' : 'Реклама загружается...'}
                action={handleShowRewardedAd}
                hideBottomLine
                hideArrow
            />
        </CardContainer>
    );
};
