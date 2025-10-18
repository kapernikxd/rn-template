import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, InteractionManager } from 'react-native';
import { Controller } from 'react-hook-form';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { ThemeType, useTheme } from 'rn-vs-lb/theme';

export interface DatePickerProps {
  name: string;
  control: any;
  label?: string;
  style?: object;
  containerStyle?: object;
  rules?: object;
  defaultValue?: Date | string;
  errorTextStyle?: object;
  required?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({
  name,
  control,
  label,
  style,
  containerStyle,
  rules = {},
  defaultValue = new Date(),
  errorTextStyle,
  required,
}) => {
  const { theme, formStyles } = useTheme();
  const styles = getStyles({ theme });

  const [isDateVisible, setDateVisible] = React.useState(false);
  const [isTimeVisible, setTimeVisible] = React.useState(false);

  // Флаг: после выбора даты хотим открыть выбор времени
  const wantOpenTime = React.useRef(false);

  const parseDate = React.useCallback((value: Date | string | undefined, fallback: Date): Date => {
    if (!value) return fallback;
    if (value instanceof Date) return value;
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? fallback : parsed;
  }, []);

  const handleDateConfirm = React.useCallback(
    (selectedDate: Date, onChange: any, currentValue: Date | string | undefined) => {
      // Берем текущие часы/минуты (если уже были выбраны ранее)
      const currentDate = parseDate(currentValue, new Date());

      // Не мутируем аргументы: создаем новый объект
      const next = new Date(selectedDate.getTime());
      next.setHours(currentDate.getHours(), currentDate.getMinutes(), 0, 0);

      onChange(next);

      // Закрываем date-picker и планируем открыть time-picker ПОСЛЕ анимаций
      wantOpenTime.current = true;
      setDateVisible(false);
    },
    [parseDate]
  );

  const handleTimeConfirm = React.useCallback(
    (selectedTime: Date, onChange: any, currentValue: Date | string | undefined) => {
      const currentDate = parseDate(currentValue, new Date());

      const next = new Date(currentDate.getTime());
      next.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);

      onChange(next);
      setTimeVisible(false);
    },
    [parseDate]
  );

  // Когда date-picker реально закрылся, дождемся окончания всех анимаций и только потом откроем time-picker
  React.useEffect(() => {
    if (!isDateVisible && wantOpenTime.current) {
      InteractionManager.runAfterInteractions(() => {
        // Небольшой дополнительный буфер (по желанию) на iOS
        setTimeout(() => {
          wantOpenTime.current = false;
          setTimeVisible(true);
        }, 0);
      });
    }
  }, [isDateVisible]);

  // Утилита форматирования времени без секунд
  const formatTime = (d: Date) => {
    try {
      return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch {
      return d.toTimeString().slice(0, 5);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={formStyles.label}>
          {required && <Text style={formStyles.required}>* </Text>}
          {label}
        </Text>
      )}

      <Controller
        control={control}
        name={name}
        rules={rules}
        defaultValue={parseDate(defaultValue, new Date())}
        render={({ field: { onChange, value }, fieldState: { error } }) => {
          const selectedDate = parseDate(value, new Date());

          return (
            <>
              <View style={[styles.row, formStyles.inputBorder, formStyles.inputContainer, style]}>
                <TouchableOpacity
                  style={[styles.buttonContainer, styles.dateButtonContainer]}
                  onPress={() => setDateVisible(true)}
                >
                  <Text style={value ? styles.buttonText : styles.buttonTextPlaceholder}>
                    {selectedDate.toDateString()}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.buttonContainer, styles.timeButtonContainer]}
                  onPress={() => setTimeVisible(true)}
                >
                  <Text style={value ? styles.buttonText : styles.buttonTextPlaceholder}>
                    {formatTime(selectedDate)}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Date modal */}
              <DateTimePickerModal
                isVisible={isDateVisible}
                mode="date"
                date={selectedDate}
                onConfirm={(date) => handleDateConfirm(date, onChange, value)}
                onCancel={() => {
                  wantOpenTime.current = false;
                  setDateVisible(false);
                }}
              />

              {/* Time modal */}
              <DateTimePickerModal
                isVisible={isTimeVisible}
                mode="time"
                date={selectedDate}
                onConfirm={(time) => handleTimeConfirm(time, onChange, value)}
                onCancel={() => setTimeVisible(false)}
              />

              {error && <Text style={[formStyles.errorText, errorTextStyle]}>{error.message}</Text>}
            </>
          );
        }}
      />
    </View>
  );
};

const getStyles = ({ theme }: { theme: ThemeType }) =>
  StyleSheet.create({
    container: {
      margin: 0,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      overflow: 'hidden',
    },
    buttonContainer: {
      justifyContent: 'center',
      backgroundColor: theme.white,
    },
    placeholder: {
      color: theme.placeholder,
      fontSize: 14,
    },
    buttonText: {
      color: theme.text,
      fontSize: 14,
    },
    buttonTextPlaceholder: {
      color: theme.placeholder,
      fontSize: 14,
    },
    dateButtonContainer: {
      flex: 0.6,
    },
    timeButtonContainer: {
      flex: 0.4,
      alignItems: 'flex-end',
    },
  });

export default DatePicker;
