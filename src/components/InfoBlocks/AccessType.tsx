import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from 'rn-vs-lb/theme';
import { Spacer } from 'rn-vs-lb';

export const AccessTypeTooltip: React.FC = () => {
    const { typography } = useTheme();

    return (
        <View>
            <Text style={typography.titleH5}>
                Что означает каждый тип доступа?
            </Text>
            <Spacer size='xs' />
            <View>
                <Text style={typography.titleH6}>• Открытый доступ</Text>
                <Text style={typography.body}>
                    Любой пользователь приложения сможет увидеть событие и присоединиться к нему.
                </Text>
            </View>
            <Spacer size='xs' />
            <View>
                <Text style={typography.titleH6}>• Для подписчиков</Text>
                <Text style={typography.body}>
                    Событие увидят только пользователи, которые подписаны на вас, и только они смогут присоединиться.
                </Text>
            </View>
            <Spacer size='xs' />
            <View>
                <Text style={typography.titleH6}>• Приватный</Text>
                <Text style={typography.body}>
                    Событие скрыто от всех. Принять участие смогут только приглашённые пользователи.
                </Text>
            </View>
        </View>
    )
}