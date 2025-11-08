import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'rn-vs-lb/theme';
import { Spacer } from 'rn-vs-lb';

type ModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface UserModerationInfoProps {
  currentStatus?: ModerationStatus;
  reason?: "image" | "content"
}

export const UserModerationInfo: React.FC<UserModerationInfoProps> = ({ currentStatus, reason }) => {
  const { typography, theme } = useTheme();
  const { t } = useTranslation();
  const statusItems: ModerationStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];

  return (
    <View>
      <Text style={typography.titleH5}>{t('components.infoBlocks.userModeration.title')}</Text>
      <Spacer size="xs" />

      {statusItems.map((status, index) => {
        const statusKey = status.toLowerCase();
        return (
          <View key={status}>
            <Text style={typography.titleH6}>
              {t(`components.infoBlocks.userModeration.statuses.${statusKey}.title`)}
            </Text>
            <Text style={typography.body}>
              {t(`components.infoBlocks.userModeration.statuses.${statusKey}.description`)}
            </Text>
            {index < statusItems.length - 1 && <Spacer size="xs" />}
          </View>
        );
      })}

      {currentStatus && (
        <>
          <Spacer size="sm" />
          <Text style={typography.titleH6}>
            {t('components.infoBlocks.userModeration.currentStatusPrefix')}{' '}
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
              {t(`components.infoBlocks.userModeration.statuses.${currentStatus.toLowerCase()}.name`)}
            </Text>
          </Text>
          {reason && (
            <Text style={[typography.body, { textDecorationLine: 'underline' }]}>
              {t(`components.infoBlocks.userModeration.reasons.${reason}`)}
            </Text>
          )}
        </>
      )}
    </View>
  );
};
