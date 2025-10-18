import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from 'rn-vs-lb/theme';
import { Spacer } from 'rn-vs-lb';

export const AccessTypeTooltip: React.FC = () => {
    const { typography } = useTheme();

    return (
        <View>
            <Text style={typography.titleH5}>
                What does each access type mean?
            </Text>
            <Spacer size='xs' />
            <View>
                <Text style={typography.titleH6}>• Common</Text>
                <Text style={typography.body}>
                    Anyone in the app can view and join your event.
                </Text>
            </View>
            <Spacer size='xs' />
            <View>
                <Text style={typography.titleH6}>• For subscribers</Text>
                <Text style={typography.body}>
                    Only users who follow you will be able to see and join the event.
                </Text>
            </View>
            <Spacer size='xs' />
            <View>
                <Text style={typography.titleH6}>• Private</Text>
                <Text style={typography.body}>
                    The event is hidden from everyone. Only invited users can participate.
                </Text>
            </View>
        </View>
    )
}