import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from 'rn-vs-lb/theme';
import { Spacer } from 'rn-vs-lb';

type ModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface UserModerationInfoProps {
  currentStatus?: ModerationStatus;
  reason?: "image" | "content"
}

export const UserModerationInfo: React.FC<UserModerationInfoProps> = ({ currentStatus, reason }) => {
  const { typography, theme } = useTheme();

  return (
    <View>
      <Text style={typography.titleH5}>Что означают статусы профиля?</Text>
      <Spacer size="xs" />

      <View>
        <Text style={typography.titleH6}>• PENDING (на рассмотрении)</Text>
        <Text style={typography.body}>
          Ваш профиль проходит модерацию. Вы можете пользоваться приложением, но не сможете публиковать контент, создавать события или взаимодействовать с другими пользователями, пока профиль не будет одобрен.
        </Text>
      </View>
      <Spacer size="xs" />

      <View>
        <Text style={typography.titleH6}>• APPROVED (одобрен)</Text>
        <Text style={typography.body}>
          Ваш профиль одобрен. У вас есть полный доступ ко всем функциям: публикациям, чатам, созданию и участию в событиях.
        </Text>
      </View>
      <Spacer size="xs" />

      <View>
        <Text style={typography.titleH6}>• REJECTED (отклонён)</Text>
        <Text style={typography.body}>
          Ваш профиль отклонён из-за нарушения правил сообщества или недостаточной/неподходящей информации. Возможно, потребуется внести правки и отправить профиль на повторную модерацию.
        </Text>
      </View>

      {currentStatus && (
        <>
          <Spacer size="sm" />
          <Text style={typography.titleH6}>
            Ваш текущий статус —{' '}
            <Text
              style={{
                color:
                  currentStatus === 'REJECTED'
                    ? theme.danger
                    : currentStatus === 'PENDING'
                    ? theme.warning
                    : theme.success,
              }}
            >
              {currentStatus}
            </Text>
          </Text>
          {reason && <Text style={[typography.body, {textDecorationLine: "underline"}]}>{reason === 'image' ? 'Фото нарушает правила. Пожалуйста, загрузите другое изображение.' : 'Информация в профиле нарушает правила. Обновите данные, чтобы соответствовать стандартам сообщества.'}</Text>}
        </>
      )}
    </View>
  );
};
