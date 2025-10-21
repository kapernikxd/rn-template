import React, { FC, ReactNode, useCallback } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import type { SwipeableProps } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

export type SwipeableActionRenderArgs = {
  progress: Animated.AnimatedInterpolation<string | number>;
  dragX: Animated.AnimatedInterpolation<string | number>;
  onDelete: () => void;
};

export interface SwipeableChatItemProps {
  children: ReactNode;
  onDelete: () => void;
  renderRightAction?: (args: SwipeableActionRenderArgs) => ReactNode;
  actionBackgroundColor?: string;
  actionWidth?: number;
  iconColor?: string;
  iconSize?: number;
  deleteIcon?: ReactNode;
  swipeableProps?: Omit<SwipeableProps, 'renderRightActions'>;
}

export const SwipeableChatItem: FC<SwipeableChatItemProps> = ({
  children,
  onDelete,
  renderRightAction,
  actionBackgroundColor = '#ff3b30',
  actionWidth = 72,
  iconColor = '#fff',
  iconSize = 24,
  deleteIcon,
  swipeableProps,
}) => {
  const renderActions = useCallback(
    (
      progress: Animated.AnimatedInterpolation<string | number>,
      dragX: Animated.AnimatedInterpolation<string | number>,
    ) => {
      if (renderRightAction) {
        return renderRightAction({ progress, dragX, onDelete });
      }

      const scale = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0.85, 1],
        extrapolate: 'clamp',
      });

      return (
        <Animated.View style={[styles.actionContainer, { transform: [{ scale }] }]}>
          <Pressable
            onPress={onDelete}
            style={[
              styles.deleteButton,
              { backgroundColor: actionBackgroundColor, width: actionWidth },
            ]}
            android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
            accessibilityRole="button"
            accessibilityLabel="Delete chat"
            testID="chat-item-delete-action"
          >
            {deleteIcon ?? (
              <Ionicons name="trash-outline" size={iconSize} color={iconColor} />
            )}
          </Pressable>
        </Animated.View>
      );
    },
    [actionBackgroundColor, actionWidth, deleteIcon, iconColor, iconSize, onDelete, renderRightAction],
  );

  return (
    <Swipeable
      {...swipeableProps}
      overshootRight={swipeableProps?.overshootRight ?? false}
      renderRightActions={renderActions}
    >
      {children}
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  actionContainer: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SwipeableChatItem;
