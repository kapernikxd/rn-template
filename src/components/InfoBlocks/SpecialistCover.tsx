import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from 'rn-vs-lb/theme';
import { Spacer } from 'rn-vs-lb';

export const SpecialistCoverTooltip: React.FC = () => {
  const { typography } = useTheme();

  return (
    <View>
      <Text style={typography.titleH5}>What is the cover for?</Text>
      <Spacer size='xs' />
      <Text style={typography.body}>
        The cover is a large banner for your specialist page. It appears at the top of your public profile and helps showcase your services.
      </Text>
      <Spacer size='xs' />
      <Text style={typography.body}>
        Choose an image that represents you—visitors will see it whenever they open your specialist profile.
      </Text>
    </View>
  );
};

export default SpecialistCoverTooltip;
