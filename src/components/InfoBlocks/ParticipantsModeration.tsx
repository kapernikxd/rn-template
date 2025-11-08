import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Spacer } from 'rn-vs-lb';
import { useTheme } from 'rn-vs-lb/theme';

export const ParticipantsModerationTooltip: React.FC = () => {
  const { typography } = useTheme();
  const { t } = useTranslation();

  return (
    <View>
      <Text style={typography.body}>
        {t('components.infoBlocks.participantsModeration.description')}
      </Text>
      <Spacer size="xs" />
    </View>
  );
};
