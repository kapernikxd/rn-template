import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'rn-vs-lb/theme';
import { Spacer } from 'rn-vs-lb';

export const InvitationTooltip: React.FC = () => {
  const { typography } = useTheme();
  const { t } = useTranslation();

  return (
    <View>
      <Text style={typography.titleH5}>
        {t('components.infoBlocks.invitation.title')}
      </Text>

      <Spacer size="xs" />

      <Text style={typography.body}>
        {t('components.infoBlocks.invitation.description1')}
      </Text>

      <Spacer size="xs" />

      <Text style={typography.body}>
        {t('components.infoBlocks.invitation.description2.part1')}{' '}
        <Text style={{ fontWeight: '600' }}>{t('components.infoBlocks.invitation.description2.accept')}</Text>
        {' '}
        {t('components.infoBlocks.invitation.description2.connector')}{' '}
        <Text style={{ fontWeight: '600' }}>{t('components.infoBlocks.invitation.description2.decline')}</Text>
        {' '}
        {t('components.infoBlocks.invitation.description2.part2')}
      </Text>

      <Spacer size="xs" />

      <Text style={typography.body}>
        {t('components.infoBlocks.invitation.description3')}
      </Text>
    </View>
  );
};
