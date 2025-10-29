import { FC } from 'react';
import { ViewStyle } from 'react-native';

import { CardContainer, ListItem } from 'rn-vs-lb';
import { useTheme } from 'rn-vs-lb/theme';

import { useRewardedAdTokens } from '../../../helpers/hooks/useRewardedAdTokens';

type RewardedAdSettingsCardProps = {
    style?: ViewStyle;
};

export const RewardedAdSettingsCard: FC<RewardedAdSettingsCardProps> = ({ style }) => {
    const { theme } = useTheme();
    const { balance: tokenBalance, isAdLoaded, showRewardedAd } = useRewardedAdTokens();

    return (
        <CardContainer style={style}>
            <ListItem
                iconColor={theme.text}
                icon="diamond"
                label="Мои токены"
                subLabel={`${tokenBalance} токенов`}
                hideArrow
                action={() => undefined}
            />
            <ListItem
                iconColor={theme.text}
                icon="gift"
                label="Получить награду"
                subLabel={isAdLoaded ? 'Реклама готова к показу' : 'Реклама загружается...'}
                action={showRewardedAd}
                hideArrow
                hideBottomLine
            />
        </CardContainer>
    );
};
