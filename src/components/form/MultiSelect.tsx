import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MultiSelect as RNEMultiSelect } from 'react-native-element-dropdown';
import { Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeType } from 'rn-vs-lb/theme';
import { InfoTooltip } from 'rn-vs-lb';

export interface MultiSelectProps {
  name: string;
  control: any;
  options: { label: string; value: string }[];
  label?: string;
  style?: object;
  containerStyle?: object;
  rules?: object;
  placeholder?: string;
  errorTextStyle?: object;
  required?: boolean;
  zIndex?: number;
  infoTooltip?: React.ReactNode;
  dropdownPosition?: "top" | "bottom";
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  name,
  control,
  options,
  label,
  style,
  containerStyle,
  rules = {},
  placeholder = 'Select...',
  errorTextStyle,
  required,
  zIndex = 1000,
  infoTooltip,
  dropdownPosition = "top",
}) => {
  const { theme, formStyles } = useTheme();
  const styles = getStyles({ theme });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<any>(null);

  return (
    <View style={[{ zIndex }, containerStyle]}>
      {label && (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={formStyles.label}>
            {required && <Text style={formStyles.required}>* </Text>}
            {label}
          </Text>
          {infoTooltip && (
            <InfoTooltip style={{ top: -2, marginLeft: 4 }} content={infoTooltip} />
          )}
        </View>
      )}

      <Controller
        control={control}
        name={name}
        rules={rules}
        defaultValue={[]}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <View style={{ position: 'relative', zIndex }}>
              <RNEMultiSelect
                ref={dropdownRef}
                style={[styles.dropdown, style]}
                data={options}
                labelField="label"
                valueField="value"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                dropdownPosition={dropdownPosition}
                selectedStyle={styles.selectedItem}
                activeColor={theme.background4}
                itemTextStyle={{ color: theme.text }}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedText}
                inputSearchStyle={styles.searchInput}
                containerStyle={styles.dropdownContainer}
                renderItem={(item, selected) => (
                  <View style={styles.item}>
                    <Text style={{ color: theme.text }}>{item.label}</Text>
                    {selected && <Ionicons name="checkmark" size={18} color={theme.primary} />}
                  </View>
                )}
                onFocus={() => setIsDropdownOpen(true)}
                onBlur={() => setIsDropdownOpen(false)}
              />
              {isDropdownOpen && (
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={() => {
                    dropdownRef.current?.close?.();
                    setIsDropdownOpen(false);
                  }}
                >
                  <Text style={styles.doneButtonText}>SELECT</Text>
                </TouchableOpacity>
              )}
            </View>
            {error && <Text style={[formStyles.errorText, errorTextStyle]}>{error.message}</Text>}
          </>
        )}
      />
    </View>
  );
};

const getStyles = ({ theme }: { theme: ThemeType }) =>
  StyleSheet.create({
    dropdown: {
      minHeight: 46,
      borderColor: theme.border,
      backgroundColor: theme.white,
      borderWidth: 1,
      borderRadius: 4,
      paddingHorizontal: 12,
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
    selectedItem: {
      borderRadius: 12,
      backgroundColor: theme.background4,
      color: theme.text,
      padding: 6,
      margin: 4,
    },
    searchInput: {
      height: 40,
      borderRadius: 8,
      borderColor: theme.border,
      paddingHorizontal: 12,
    },
    item: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 12,
    },
    doneButton: {
      backgroundColor: theme.white,
      paddingVertical: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderTopWidth: 0,
      borderColor: theme.border,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
    },
    doneButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.primary,
    },
  });

export default MultiSelect;
