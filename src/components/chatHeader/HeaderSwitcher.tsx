import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

interface HeaderSwitcherProps {
  isFirst: boolean;
  componentA: React.ReactElement;
  componentB: React.ReactElement;
}

export const HeaderSwitcher: React.FC<HeaderSwitcherProps> = ({ isFirst, componentA, componentB }) => {
  const [currentComponent, setCurrentComponent] = useState<React.ReactElement>(isFirst ? componentA : componentB);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      setCurrentComponent(isFirst ? componentA : componentB);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    });
  }, [isFirst]);

  return (
    <Animated.View
      style={[
        styles.animatedContainer,
        { opacity }
      ]}
      pointerEvents="box-none" // ⚠️ пропускает касания дальше
    >
      {currentComponent}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animatedContainer: {
    zIndex: 20, // 🟢 Важно: выше оверлея
    position: 'relative',
  },
});
