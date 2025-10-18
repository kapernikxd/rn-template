import { StyleSheet } from 'react-native';
import { FONTS, ThemeType } from 'rn-vs-lb/theme';

export const inputHeight = 46;

export const getFormStyles = (theme: ThemeType) => StyleSheet.create({
    required: {
        color: theme.danger,
    },
    label: {
        ...FONTS.font,
        color: theme.text,
        fontSize: 13,
        marginBottom: 5,
    },
    inputBorder: {
        borderColor: theme.border,
        borderWidth: 1,
        borderRadius: 5,
    },
    inputContainer: {
        height: inputHeight,
        paddingHorizontal: 15,
        backgroundColor: theme.white,
        justifyContent: "center",
    },
    inputWithIcon: {
        height: inputHeight,
        color: theme.text,
    },
    errorText: {
        color: theme.danger,
        marginTop: 5,
        fontSize: 12,
    },
    inputError: {
        borderColor: theme.danger,
    },
});

export type FormStylesType = ReturnType<typeof getFormStyles>;