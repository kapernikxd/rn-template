import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { Controller } from 'react-hook-form';
import { inputHeight } from '../../constants/theme/styles/commonFormStyles';
import { useTheme } from 'rn-vs-lb/theme';

interface OtpInputProps {
  name: string;             // "verificationCode"
  rules?: object;           // правила валидации react-hook-form
  numberOfSections: number; // количество отдельных инпутов (3)
  sectionLength: number;    // сколько символов в каждом инпуте (3)
  methods: any;             // из useForm()
}

const OtpInput: React.FC<OtpInputProps> = ({
  name,
  methods,
  rules,
  numberOfSections,
  sectionLength,
}) => {
  const { theme, formStyles } = useTheme();
  // Создадим массив, чтобы в цикле нарисовать нужное количество инпутов
  const sections = Array.from({ length: numberOfSections }, (_, index) => index);

  const error = methods.formState.errors.code?.message

  return (
    <View style={styles.container}>
      <View style={styles.otpBox}>
        {sections.map((sectionIndex) => (
          <Controller
            key={sectionIndex}
            // Каждое поле будет иметь имя вида:
            // "verificationCode.0", "verificationCode.1", "verificationCode.2"
            name={`${name}.${sectionIndex}`}
            control={methods.control}
            rules={rules}
            render={({ field: { onChange, onBlur, value }, fieldState: { error: controllerError } }) => (
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    formStyles.inputBorder,
                    formStyles.inputContainer,
                    styles.textInput,
                    error ? formStyles.inputError : controllerError ? formStyles.inputError : null,
                  ]}
                  onChangeText={(text) => {
                    onChange(text); // обновляем значение в форме
                    // если есть ошибка, то очищаем её
                    if (methods.formState.errors.code) {
                      methods.clearErrors('code');
                    }
                  }}
                  onBlur={onBlur}
                  value={value}
                  maxLength={sectionLength} // 3 символа на инпут
                  placeholderTextColor={theme.placeholder}
                  keyboardType="default"
                />
                {/* Если поле не валидно, покажем ошибку под ним */}
                {controllerError && <Text style={formStyles.errorText}>{controllerError.message}</Text>}
              </View>
            )}
          />
        ))}
      </View>
      {error && (
        <Text style={[formStyles.errorText]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  otpBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputWrapper: {
    flex: 1,
    marginHorizontal: 3,
  },
  textInput: {
    height: inputHeight,
    textAlign: 'center', // чтобы символы шли по центру
    fontSize: 16,
  },
});

export default OtpInput;