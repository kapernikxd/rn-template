import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'rn-vs-lb/theme';
import { Spacer } from 'rn-vs-lb';

export const ParticipantLimitTooltip: React.FC = () => {
  const { typography } = useTheme();
  const { t } = useTranslation();

  return (
    <View>
      <Text style={typography.body}>
        {t('components.infoBlocks.participantLimit.description')}
      </Text>
      <Spacer size="xs" />
    </View>
  );
};
