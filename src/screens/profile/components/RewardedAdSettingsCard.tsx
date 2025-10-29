import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { ViewStyle } from 'react-native';

import { CardContainer, ListItem } from 'rn-vs-lb';
import { useTheme } from 'rn-vs-lb/theme';
import { TestIds, useRewardedAd } from 'react-native-google-mobile-ads';

import { useRootStore } from '../../../store/StoreProvider';
import {
    DEFAULT_TOKEN_BALANCE,
    addTokens as addTokensToStorage,
    getTokenBalance,
} from '../../../helpers/tokenStorage';

const TOKEN_REWARD_AMOUNT = 10;

const REWARDED_AD_UNIT_ID = __DEV__
    ? TestIds.REWARDED
    : 'ca-app-pub-8636022279548301/8567360540';

type RewardedAdSettingsCardProps = {
    style?: ViewStyle;
};

export const RewardedAdSettingsCard: FC<RewardedAdSettingsCardProps> = ({ style }) => {
    const { theme } = useTheme();
    const { uiStore } = useRootStore();
    const [tokenBalance, setTokenBalance] = useState<number>(DEFAULT_TOKEN_BALANCE);
    const isMountedRef = useRef(false);
    const { isLoaded, isClosed, isEarnedReward, load, show, error } = useRewardedAd(REWARDED_AD_UNIT_ID, {
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
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        const loadBalance = async () => {
            try {
                const storedBalance = await getTokenBalance();
                if (isMountedRef.current) {
                    setTokenBalance(storedBalance);
                }
            } catch (storageError) {
                if (isMountedRef.current) {
                    uiStore.showSnackbar('Не удалось получить баланс токенов.', 'error');
                }
            }
        };

        void loadBalance();

        if (!isLoaded) {
            load();
        }
    }, [isLoaded, load, uiStore]);

    useEffect(() => {
        if (isClosed && !isLoaded) {
            load();
        }
    }, [isClosed, isLoaded, load]);

    useEffect(() => {
        if (isEarnedReward) {
            const updateBalance = async () => {
                try {
                    const updatedBalance = await addTokensToStorage(TOKEN_REWARD_AMOUNT);
                    if (isMountedRef.current) {
                        setTokenBalance(updatedBalance);
                    }

                    const rewardMessage = `Награда получена! +${TOKEN_REWARD_AMOUNT} токенов.`;
                    uiStore.showSnackbar(rewardMessage, 'success');
                } catch (storageError) {
                    if (isMountedRef.current) {
                        uiStore.showSnackbar('Не удалось обновить баланс токенов.', 'error');
                    }
                }
            };

            void updateBalance();
        }
    }, [isEarnedReward, uiStore]);

    useEffect(() => {
        if (error) {
            uiStore.showSnackbar('Не удалось загрузить рекламу. Попробуйте позже.', 'error');
        }
    }, [error, uiStore]);

    return (
        <CardContainer style={style}>
            <ListItem
                iconColor={theme.text}
                icon="coins"
                label="Мои токены"
                subLabel={`${tokenBalance} токенов`}
                hideArrow
            />
            <ListItem
                iconColor={theme.text}
                icon="gift"
                label="Получить награду"
                subLabel={isLoaded ? 'Реклама готова к показу' : 'Реклама загружается...'}
                action={handleShowRewardedAd}
                hideArrow
                hideBottomLine
            />
        </CardContainer>
    );
};
