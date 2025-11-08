import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'rn-vs-lb/theme';
import { Spacer } from 'rn-vs-lb';

const DELETE_DURATION = 14;
const CHAT_DURATION = 5;

export const CompletedEventTooltip: React.FC = () => {
  const { typography } = useTheme();
  const { t } = useTranslation();

  return (
    <View>
      <Text style={typography.titleH5}>
        {t('components.infoBlocks.completedEvent.title')}
      </Text>

      <Spacer size="xs" />

      <Text style={typography.body}>
        {t('components.infoBlocks.completedEvent.description1.prefix')}{' '}
        <Text style={{ fontWeight: '600' }}>
          {t('components.infoBlocks.completedEvent.description1.highlight', { count: DELETE_DURATION })}
        </Text>{' '}
        {t('components.infoBlocks.completedEvent.description1.suffix')}
      </Text>

      <Spacer size="xs" />

      <Text style={typography.body}>
        {t('components.infoBlocks.completedEvent.description2.prefix')}{' '}
        <Text style={{ fontWeight: '600' }}>
          {t('components.infoBlocks.completedEvent.description2.highlight', { count: CHAT_DURATION })}
        </Text>{' '}
        {t('components.infoBlocks.completedEvent.description2.suffix')}
      </Text>
    </View>
  );
};
