import { FC } from 'react';
import { ViewStyle } from 'react-native';

import { CardContainer, ListItem } from 'rn-vs-lb';
import { useTheme } from 'rn-vs-lb/theme';
import { useTranslation } from 'react-i18next';

import { useRewardedAdTokens } from '../../../helpers/hooks/useRewardedAdTokens';

type RewardedAdSettingsCardProps = {
    style?: ViewStyle;
};

export const RewardedAdSettingsCard: FC<RewardedAdSettingsCardProps> = ({ style }) => {
    const { theme } = useTheme();
    const { balance: tokenBalance, isAdLoaded, showRewardedAd } = useRewardedAdTokens();
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
