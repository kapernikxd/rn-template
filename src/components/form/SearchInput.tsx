import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { MaterialIcons as IconAwesome } from '@expo/vector-icons';
import { inputHeight } from '../../constants/theme/styles/commonFormStyles';
import { ThemeType, useTheme } from 'rn-vs-lb/theme';

export interface SearchInputProps {
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    icon?: React.ReactNode;
    iconType?: 'search' | 'close';
    editable?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
    placeholder = 'Search...',
    value,
    onChangeText,
    icon,
    iconType,
    editable = true,
}) => {
    const { theme, formStyles } = useTheme();
    const styles = getStyles({ theme });

    return (
        <View style={styles.container}>
            <View style={[styles.inputWrapper]}>
                {iconType && (
                    <IconAwesome
                        name={iconType}
                        size={22}
                        color={theme.greyText}
                        style={styles.icon}
                    />
                )}
                {icon}
                <TextInput
                    style={(iconType || icon) ? [formStyles.inputWithIcon, styles.searchWithIcon] : [formStyles.inputBorder, formStyles.inputContainer, styles.textInput]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={theme.placeholder}
                    editable={editable}
                />
            </View>
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
        backgroundColor: theme.background,
    },
    textInput: {
        flex: 1,
        height: inputHeight,
        borderWidth: 0,
        borderRadius: 5,
    },
    searchWithIcon: {
        backgroundColor: theme.white,
        flex: 1,
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
        paddingLeft: 8,
    },
    icon: {
        paddingHorizontal: 10
    },
});

export default SearchInput;
