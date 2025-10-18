import React from 'react';
import { TextInput, StyleSheet, View, Text, TextInputProps } from 'react-native';
import { Controller } from 'react-hook-form';
import { useTheme } from 'rn-vs-lb/theme';

export interface TextAreaProps extends TextInputProps {
    name: string;
    control: any;
    label?: string;
    placeholder?: string;
    numberOfLines?: number;
    style?: object;
    containerStyle?: object;
    rules?: object;
    defaultValue?: string;
    required?: boolean;
    errorTextStyle?: object;
}

const TextArea: React.FC<TextAreaProps> = ({
    name,
    control,
    label,
    placeholder = 'Enter text...',
    numberOfLines = 4,
    style,
    containerStyle,
    rules = {},
    defaultValue = '',
    required,
    errorTextStyle,
    ...rest
}) => {
    const { theme, formStyles, typography } = useTheme();

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={formStyles.label}>
                {required && <Text style={formStyles.required}>* </Text>}
                {label}
            </Text>}
            <Controller
                control={control}
                name={name}
                rules={rules}
                defaultValue={defaultValue}
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                    <>
                        <TextInput
                            style={[formStyles.inputBorder, typography.body, formStyles.inputContainer, styles.textArea, style]}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            placeholder={placeholder}
                            multiline={true}
                            numberOfLines={numberOfLines}
                            placeholderTextColor={theme.placeholder}
                            {...rest}
                        />
                        {error && <Text style={[formStyles.errorText, errorTextStyle]}>{error.message}</Text>}
                    </>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: 0,
    },
    textArea: {
        height: 150,
        padding: 12,
        textAlignVertical: 'top',
    },
});

export default TextArea;