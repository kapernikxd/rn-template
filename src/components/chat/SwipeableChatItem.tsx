import React, { FC, ReactNode, useCallback, forwardRef, useImperativeHandle, useRef } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SwipeableProps } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, interpolate, Extrapolation, type SharedValue } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

type SwipeableActionRenderArgs = {
  progress: SharedValue<number>;
  dragX: SharedValue<number>;
  onDelete: () => void;
  close: () => void;
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
  autoCloseOnDelete?: boolean;
}

export type SwipeableChatItemRef = { close: () => void } | null;

const RightAction: FC<{
  progress: SharedValue<number>;
  onPress: () => void;
  width: number;
  backgroundColor: string;
  icon?: ReactNode;
}> = ({ progress, onPress, width, backgroundColor, icon }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [0.85, 1], Extrapolation.CLAMP);
    return { transform: [{ scale }] };
  });

  return (
    <Animated.View style={[styles.actionContainer, animatedStyle]}>
      <Pressable
        onPress={onPress}
        style={[styles.deleteButton, { width, backgroundColor }]}
        android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
        accessibilityRole="button"
        accessibilityLabel="Delete chat"
        testID="chat-item-delete-action"
      >
        {icon}
      </Pressable>
    </Animated.View>
  );
};

export const SwipeableChatItem = forwardRef<SwipeableChatItemRef, SwipeableChatItemProps>(
  (
    {
      children,
      onDelete,
      renderRightAction,
      actionBackgroundColor = '#ff3b30',
      actionWidth = 72,
      iconColor = '#fff',
      iconSize = 24,
      deleteIcon,
      swipeableProps,
      autoCloseOnDelete = true,
    },
    ref
  ) => {
    const swipeRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      close: () => swipeRef.current?.close(),
    }));

    const handleDelete = useCallback(() => {
      onDelete();
      if (autoCloseOnDelete) swipeRef.current?.close();
    }, [onDelete, autoCloseOnDelete]);

    const renderActions = useCallback(
      (progress: SharedValue<number>, dragX: SharedValue<number>) => {
        if (renderRightAction) {
          return renderRightAction({
            progress,
            dragX,
            onDelete: handleDelete,
            close: () => swipeRef.current?.close(),
          });
        }

        return (
          <RightAction
            progress={progress}
            onPress={handleDelete}
            width={actionWidth}
            backgroundColor={actionBackgroundColor}
            icon={deleteIcon ?? <Ionicons name="trash-outline" size={iconSize} color={iconColor} />}
          />
        );
      },
      [
        actionBackgroundColor,
        actionWidth,
        deleteIcon,
        iconColor,
        iconSize,
        handleDelete,
        renderRightAction,
      ]
    );

    return (
      <Swipeable
        ref={swipeRef}
        {...swipeableProps}
        overshootRight={swipeableProps?.overshootRight ?? false}
        rightThreshold={swipeableProps?.rightThreshold ?? actionWidth / 2}
        renderRightActions={renderActions}
      >
        {children}
      </Swipeable>
    );
  }
);

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
