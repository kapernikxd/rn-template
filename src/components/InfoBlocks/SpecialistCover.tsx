import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'rn-vs-lb/theme';
import { Spacer } from 'rn-vs-lb';

export const SpecialistCoverTooltip: React.FC = () => {
  const { typography } = useTheme();
  const { t } = useTranslation();

  return (
    <View>
      <Text style={typography.titleH5}>{t('components.infoBlocks.specialistCover.title')}</Text>
      <Spacer size='xs' />
      <Text style={typography.body}>
        {t('components.infoBlocks.specialistCover.description1')}
      </Text>
      <Spacer size='xs' />
      <Text style={typography.body}>
        {t('components.infoBlocks.specialistCover.description2')}
      </Text>
    </View>
  );
};

export default SpecialistCoverTooltip;
