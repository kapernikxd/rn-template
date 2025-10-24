import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from 'rn-vs-lb/theme';
import { Spacer } from 'rn-vs-lb';

type ModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface PostModerationInfoProps {
  currentStatus?: string;
  reason?: "image" | "content"
}

export const PostModerationInfo: React.FC<PostModerationInfoProps> = ({ currentStatus, reason }) => {
  const { typography, theme } = useTheme();

  return (
    <View>
      <Text style={typography.titleH5}>Что означает каждый статус?</Text>
      <Spacer size="xs" />

      <View>
        <Text style={typography.titleH6}>• PENDING (на рассмотрении)</Text>
        <Text style={typography.body}>
          Публикация ожидает проверки модератором. Она пока не видна другим пользователям (кроме автора).
        </Text>
      </View>
      <Spacer size="xs" />

      <View>
        <Text style={typography.titleH6}>• APPROVED (одобрено)</Text>
        <Text style={typography.body}>
          Публикация прошла проверку модератора и одобрена. Она доступна всем пользователям.
        </Text>
      </View>
      <Spacer size="xs" />

      <View>
        <Text style={typography.titleH6}>• REJECTED (отклонено)</Text>
        <Text style={typography.body}>
          Публикация проверена и отклонена из-за нарушения правил, неподобающего содержания или несоответствия стандартам качества.
        </Text>
      </View>

      {currentStatus && (
        <>
          <Spacer size="sm" />
          <Text style={typography.titleH6}>Ваш текущий статус — <Text style={{color: currentStatus === 'REJECTED' ? theme.danger : currentStatus === 'PENDING' ? theme.warning : theme.success}}>{currentStatus}</Text></Text>
          {reason && <Text style={[typography.body, {textDecorationLine: "underline"}]}>{reason === 'image' ? 'Одно из изображений нарушает правила. Пожалуйста, загрузите другое.' : 'Описание события нарушает правила. Пожалуйста, обновите текст.'}</Text>}
        </>
      )}
    </View>
  );
};
