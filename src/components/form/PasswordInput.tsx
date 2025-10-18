import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemeType, useTheme } from 'rn-vs-lb/theme';


interface PasswordInputProps {
  value: string;
  onChange: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: boolean;
  iconType?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ value, onChange, onBlur, placeholder, error, iconType }) => {
  const { theme, formStyles } = useTheme();
  const styles = getStyles({ theme });
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={iconType ? [formStyles.inputWithIcon, styles.inputWrapper] : [styles.inputContainer, formStyles.inputBorder, formStyles.inputContainer]}>
      {iconType && (
        <MaterialIcons
          name={iconType as any}
          size={20}
          color={theme.greyText}
          style={styles.icon}
        />
      )}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        onBlur={onBlur}
        onChangeText={onChange}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={theme.placeholder}
        secureTextEntry={!isPasswordVisible}
      />
      <TouchableOpacity style={styles.icon} onPress={togglePasswordVisibility}>
        <Icon
          name={isPasswordVisible ? "eye-off" : "eye"}
          size={24}
          color="gray"
        />
      </TouchableOpacity>
    </View>
  );
};

const getStyles = ({ theme }: { theme: ThemeType }) => StyleSheet.create({
   inputContainer: {
    position: 'relative',
    display: "flex",
    flexDirection: 'row',
    justifyContent: "space-between",
    alignItems: "center",
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
  input: {
    flex: 1,
    paddingRight: 30, // Место для иконки
    color: theme.text,
  },
  icon: {
    marginRight: 10,
  },
  inputError: {
    borderColor: theme.danger,
  },
});

export default PasswordInput;