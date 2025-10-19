import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';  // <-- иконки
import { useRootStore } from '../store/StoreProvider';
import { useTheme, ThemeType } from 'rn-vs-lb/theme';

const HIDE_DURATION = 1500;

const CustomSnackbar = observer(() => {
  const { theme, globalStyleSheet } = useTheme();
  const styles = getStyles(theme);
  const { uiStore } = useRootStore();
  const { visible, message, type } = uiStore.snackBar;

  const [height, setHeight] = useState(0);
  const translateY = useRef(new Animated.Value(100)).current; // Начальное смещение

  // Цвет фона зависит от типа
  let backgroundColor = theme.dark;
  switch (type) {
    case 'success':
      backgroundColor = theme.success;
      break;
    case 'warning':
      backgroundColor = theme.warning;
      break;
    case 'error':
      backgroundColor = theme.danger;
      break;
    case 'info':
      backgroundColor = theme.info;
      break;
  }

  // Функция закрытия (уход вниз) + вызов hideSnackbar из стора
  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: height, // двигаем на высоту Snackbar
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      uiStore.hideSnackbar();
      // Сбрасываем положение для будущего показа
      translateY.setValue(100);
    });
  };

  // При появлении visible анимируем "подъём" + автоскрытие
  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0, // сдвигаем в 0, т.е. на экран
        useNativeDriver: true,
      }).start();

      // Таймер автоскрытия
      const timer = setTimeout(() => {
        handleClose();
      }, HIDE_DURATION);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  // Если Snackbar скрыт, рендерим null
  if (!visible) {
    return null;
  }

  // Рендерим Animated.View для анимации translateY
  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor, transform: [{ translateY }] },
      ]}
      // Узнаём высоту Snackbar, чтобы потом увести его ровно на высоту
      onLayout={(event) => {
        setHeight(event.nativeEvent.layout.height);
      }}
    >
      <View style={globalStyleSheet.flexRowCenterBetween}>
        <Text style={styles.text}>{message}</Text>
        {/* Кнопка закрытия с иконкой (крестиком) */}
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={theme.white} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
});

export default CustomSnackbar;

const getStyles = (theme:ThemeType) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    // При желании, можно тень/скругления
    elevation: 5, // для Android
    shadowColor: theme.black, // для iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  text: {
    color: theme.white,
    fontSize: 16,
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    padding: 4,
  },
});
