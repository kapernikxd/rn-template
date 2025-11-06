import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from 'rn-vs-lb/theme';
import { Spacer } from 'rn-vs-lb';

export const SpecialistCoverTooltip: React.FC = () => {
  const { typography } = useTheme();

  return (
    <View>
      <Text style={typography.titleH5}>Зачем нужна обложка?</Text>
      <Spacer size='xs' />
      <Text style={typography.body}>
        Обложка — это большой баннер для страницы специалиста. Она отображается в верхней части публичного профиля и помогает рассказать о ваших услугах.
      </Text>
      <Spacer size='xs' />
      <Text style={typography.body}>
        Выберите изображение, которое отражает вас: посетители будут видеть его каждый раз, когда открывают ваш профиль специалиста.
      </Text>
    </View>
  );
};

export default SpecialistCoverTooltip;
