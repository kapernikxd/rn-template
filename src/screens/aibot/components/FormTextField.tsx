import React, { useMemo } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { ThemeType, TypographytType, SizesType, useTheme } from "rn-vs-lb/theme";

interface FormTextFieldProps extends Omit<TextInputProps, "style"> {
  label: string;
  labelRight?: string;
  hint?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export const FormTextField = React.forwardRef<TextInput, FormTextFieldProps>(
  ({ label, labelRight, hint, containerStyle, inputStyle, multiline, ...textInputProps }, ref) => {
    const { theme, typography, sizes, formStyles } = useTheme();

    const styles = useMemo(
      () => createStyles({ theme, typography, sizes }),
      [theme, typography, sizes],
    );

    return (
      <View style={[styles.container, containerStyle]}>
        <View style={styles.labelRow}>
          <Text style={formStyles.label}>{label}</Text>
          {labelRight ? <Text style={styles.labelRight}>{labelRight}</Text> : null}
        </View>
        <TextInput
          ref={ref}
          style={[
            formStyles.inputBorder,
            styles.input,
            multiline ? styles.multilineInput : undefined,
            inputStyle,
          ]}
          placeholderTextColor={theme.placeholder}
          multiline={multiline}
          {...textInputProps}
        />
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
    );
  },
);

FormTextField.displayName = "FormTextField";

const createStyles = ({
  theme,
  typography,
  sizes,
}: {
  theme: ThemeType;
  typography: TypographytType;
  sizes: SizesType;
}) =>
  StyleSheet.create({
    container: {
      marginBottom: sizes.lg as number,
    },
    labelRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: sizes.xs as number,
    },
    labelRight: {
      ...typography.bodyXs,
      color: theme.greyText,
    },
    input: {
      paddingVertical: (sizes.sm as number) + 2,
      paddingHorizontal: sizes.md as number,
      ...typography.body,
      color: theme.text,
      backgroundColor: theme.white,
    },
    multilineInput: {
      minHeight: 112,
      textAlignVertical: "top",
    },
    hint: {
      marginTop: 6,
      ...typography.bodyXs,
      color: theme.greyText,
    },
  });

