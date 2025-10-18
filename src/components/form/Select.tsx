import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Controller } from 'react-hook-form';
import { useTheme, ThemeType } from 'rn-vs-lb/theme';
import { inputHeight } from '../../constants/theme/styles/commonFormStyles';
import { InfoTooltip } from 'rn-vs-lb';


export interface SelectProps {
  name: string;
  control: any;
  label?: string;
  options: { label: string; value: string | number }[];
  placeholder?: string;
  style?: object;
  containerStyle?: object;
  rules?: object;
  defaultValue?: string | number | null;
  required?: boolean;
  errorTextStyle?: object;
  zIndex?: number;
  dropdownPosition?: 'auto' | 'top' | 'bottom';
  infoTooltip?: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({
  name,
  control,
  label,
  options,
  placeholder = 'Select an option...',
  style,
  containerStyle,
  rules = {},
  required,
  defaultValue = null,
  errorTextStyle,
  zIndex = 1000,
  dropdownPosition = 'auto',
  infoTooltip
}) => {
  const { theme, formStyles, globalStyleSheet } = useTheme();
  const styles = getStyles({ theme });

  return (
    <View style={[{ zIndex }, containerStyle]}>
      {label && (
        <View style={globalStyleSheet.flexRowCenterStart}>
          <Text style={formStyles.label}>
            {required && <Text style={formStyles.required}>* </Text>}
            {label}
          </Text>
          {infoTooltip && <InfoTooltip style={{marginLeft: 2, top: -2}} content={infoTooltip} />}
        </View>
      )}

      <Controller
        control={control}
        name={name}
        rules={rules}
        defaultValue={defaultValue}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <Dropdown
              style={[styles.dropdown, style]}
              data={options}
              labelField="label"
              valueField="value"
              placeholder={placeholder}
              value={value}
              onChange={(val) => onChange(val?.value)}
              dropdownPosition={dropdownPosition}
              activeColor={theme.background4}
              itemTextStyle={{ color: theme.text, fontSize: 14 }}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedText}
              inputSearchStyle={styles.searchInput}
              containerStyle={styles.dropdownContainer}
            />
            {error && <Text style={[formStyles.errorText, errorTextStyle]}>{error.message}</Text>}
          </>
        )}
      />
    </View>
  );
};

const getStyles = ({ theme }: { theme: ThemeType }) =>
  StyleSheet.create({
    // сам инпут форма 
    dropdown: {
      height: inputHeight,
      borderColor: theme.border,
      backgroundColor: theme.white,
      borderWidth: 1,
      borderRadius: 4,
      paddingHorizontal: 12,
      justifyContent: 'center',
    },
    dropdownContainer: {
      borderColor: theme.border,
      backgroundColor: theme.white,
      borderRadius: 8,
    },
    placeholderStyle: {
      color: theme.placeholder,
      fontSize: 14,
    },
    selectedText: {
      color: theme.text,
      fontSize: 14,
    },
    searchInput: {
      height: 40,
      borderRadius: 8,
      borderColor: theme.border,
      paddingHorizontal: 12,
    },
  });

export default Select;
