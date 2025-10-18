import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { MaterialIcons as IconAwesome } from '@expo/vector-icons';
import { ThemeType, useTheme } from 'rn-vs-lb/theme';
import PasswordInput from './PasswordInput';

import { inputHeight } from '../../constants/theme/styles/commonFormStyles';

export interface InputWithValidationProps {
  name: string;
  control: any;
  label?: string;
  placeholder: string;
  icon?: React.ReactNode;
  iconType?: 'alternate-email' | 'lock' | 'person-outline',
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric' | 'decimal-pad' | 'number-pad' | 'url' | 'web-search';
  secureTextEntry?: boolean;
  required?: boolean;
  rules?: { required?: boolean | string;[key: string]: any };
  defaultValue?: string;
  editable?: boolean;
}

const InputWithValidation: React.FC<InputWithValidationProps> = ({
  name,
  control,
  label = '',
  placeholder,
  iconType,
  icon,
  keyboardType = 'default',
  secureTextEntry = false,
  required = false,
  rules = {},
  defaultValue = '',
  editable = true
}) => {
  const { theme, formStyles, typography } = useTheme();
  const styles = getStyles({ theme });
  const { formState: { errors } } = useForm<{ [key: string]: string }>();

  return (
    <View style={styles.container}>
      {label && (
        <Text style={formStyles.label}>
          {required && <Text style={formStyles.required}>* </Text>}
          {label}
        </Text>
      )}
      <Controller
        control={control}
        rules={rules}
        name={name}
        defaultValue={defaultValue}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          secureTextEntry ? (
            <>
              <PasswordInput
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                error={!!errors[name]}
                iconType={iconType}
              />
              {error && <Text style={[formStyles.errorText]}>{error.message}</Text>}
            </>
          ) : (
            <>
              <View style={(iconType || icon) && [styles.inputWrapper, errors[name] && styles.inputError]}>
                {iconType && (
                  <IconAwesome
                    name={iconType}
                    size={20}
                    color={errors[name] ? 'red' : theme.greyText}
                    style={styles.icon}
                  />
                )}
                {icon}
                <TextInput
                  style={(iconType || icon) ? formStyles.inputWithIcon : [formStyles.inputBorder, typography.body, formStyles.inputContainer, styles.textInput]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value || defaultValue}
                  placeholder={placeholder}
                  placeholderTextColor={theme.placeholder}
                  keyboardType={keyboardType}
                  editable={editable}
                />
              </View>
              {error && <Text style={[formStyles.errorText]}>{error.message}</Text>}
            </>
          )
        )}
      />
      {errors[name] && <Text style={formStyles.errorText}>{(errors[name] as any)?.message}</Text>}
    </View>
  );
};

const getStyles = ({ theme }: { theme: ThemeType }) => StyleSheet.create({
  container: {
    padding: 0,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 5,
    paddingHorizontal: 12,
    backgroundColor: theme.background,
  },
  textInput: {
    flex: 1,
    height: inputHeight,
  },
  icon: {
    marginRight: 10,
  },
  inputError: {
    borderColor: 'red',
  },
});

export default InputWithValidation;