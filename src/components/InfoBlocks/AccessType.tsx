import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'rn-vs-lb/theme';
import { Spacer } from 'rn-vs-lb';

export const AccessTypeTooltip: React.FC = () => {
    const { typography } = useTheme();
    const { t } = useTranslation();

    return (
        <View>
            <Text style={typography.titleH5}>
                {t('components.infoBlocks.accessType.title')}
            </Text>
            <Spacer size='xs' />
            <View>
                <Text style={typography.titleH6}>{t('components.infoBlocks.accessType.open.title')}</Text>
                <Text style={typography.body}>
                    {t('components.infoBlocks.accessType.open.description')}
                </Text>
            </View>
            <Spacer size='xs' />
            <View>
                <Text style={typography.titleH6}>{t('components.infoBlocks.accessType.followers.title')}</Text>
                <Text style={typography.body}>
                    {t('components.infoBlocks.accessType.followers.description')}
                </Text>
            </View>
            <Spacer size='xs' />
            <View>
                <Text style={typography.titleH6}>{t('components.infoBlocks.accessType.private.title')}</Text>
                <Text style={typography.body}>
                    {t('components.infoBlocks.accessType.private.description')}
                </Text>
            </View>
        </View>
    )
}