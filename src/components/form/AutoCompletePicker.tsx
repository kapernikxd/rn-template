import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, findNodeHandle, UIManager, Dimensions } from 'react-native';
import { inputHeight } from '../../constants/theme/styles/commonFormStyles';
import { ThemeType, useTheme } from 'rn-vs-lb/theme';
import { Portal } from 'react-native-portalize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_HEIGHT = Dimensions.get('window').height;

type AutoCompletePickerProps = {
    items: string[];
    placeholder?: string;
    onSelect?: (city: string) => void;
    defaultValue?: string;
    error?: string;
    label?: string;
    isActive: boolean
};

const AutoCompletePicker: React.FC<AutoCompletePickerProps> = ({
    items = [],
    placeholder = 'Select...',
    onSelect,
    defaultValue = '',
    error,
    label,
    isActive,
}) => {
    const { theme, formStyles } = useTheme();
    const styles = getStyles({ theme });
    const insets = useSafeAreaInsets();

    const inputRef = useRef<TextInput>(null);
    const [query, setQuery] = useState(defaultValue);
    const [visible, setVisible] = useState(false);
    const [inputLayout, setInputLayout] = useState<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 0, height: 0 });

    useEffect(() => {
        setQuery(defaultValue || '');
    }, [defaultValue]);

    const filteredCities = useMemo(() => {
        if (!query?.trim()) return items ?? [];
        return items?.filter(city =>
            city.toLowerCase().includes(query.toLowerCase())
        ) ?? [];
    }, [query, items]);

    const handleChangeText = (text: string) => {
        setQuery(text);
        setVisible(true);
    };

    const handleSelectCity = (city: string) => {
        setQuery(city);
        setVisible(false);
        onSelect?.(city);
    };

    const handleClear = () => {
        setQuery('');
        setVisible(false);
    };

    const handleMeasure = () => {
        if (inputRef.current) {
            const nodeHandle = findNodeHandle(inputRef.current);
            if (nodeHandle) {
                UIManager.measureInWindow(nodeHandle, (x, y, width, height) => {
                    requestAnimationFrame(() => {
                        setInputLayout({ x, y, width, height });
                    });
                });
            }
        }
    };

    useEffect(() => {
        if (visible && isActive) {
            handleMeasure();
        }
    }, [visible, isActive]);

    useEffect(() => {
        if (!isActive) {
            setVisible(false);
        }
    }, [isActive]);


    const ITEM_HEIGHT = 44;
    const dropdownHeight = Math.min(filteredCities.length * ITEM_HEIGHT, 200);
    const canOpenDown = inputLayout.y + inputLayout.height + dropdownHeight < SCREEN_HEIGHT;
    const dropdownTop = canOpenDown
        ? inputLayout.y + inputLayout.height
        : Math.max(inputLayout.y - dropdownHeight - 5, 0);


    return (
        <View style={{ position: 'relative' }}>
            {label && <Text style={formStyles.label}>{label}</Text>}

            <View style={styles.inputWrapper}>
                <TextInput
                    ref={inputRef}
                    style={[
                        formStyles.inputBorder,
                        formStyles.inputContainer,
                        styles.textInput,
                        { paddingRight: 40 },
                    ]}
                    value={query}
                    onChangeText={handleChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={theme.placeholder}
                    blurOnSubmit={false}
                />

                {query.length > 0 && (
                    <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                        <Text style={{ fontSize: 18, color: theme.placeholder, top: -3 }}>×</Text>
                    </TouchableOpacity>
                )}
            </View>

            {isActive && visible && filteredCities.length > 0 && (
                <Portal>
                    <View style={[
                        styles.dropdownContainer,
                        {
                            top: dropdownTop,
                            left: inputLayout.x,
                            width: inputLayout.width
                        }
                    ]}>
                        <FlatList
                            keyboardShouldPersistTaps="handled"
                            data={filteredCities}
                            keyExtractor={(item, index) => `${item}_${index}`}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => handleSelectCity(item)}>
                                    <Text style={styles.itemText}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </Portal>
            )}

            {error && <Text style={formStyles.errorText}>{error}</Text>}
        </View>
    );
};

export default AutoCompletePicker;

const getStyles = ({ theme }: { theme: ThemeType }) => StyleSheet.create({
    textInput: {
        height: inputHeight,
        color: theme.text,
    },
    inputWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    clearButton: {
        position: 'absolute',
        right: 10,
        top: '50%',
        transform: [{ translateY: -10 }],
        zIndex: 10,
    },
    dropdownContainer: {
        position: 'absolute',
        maxHeight: 200,
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.white,
        zIndex: 9999,
    },
    itemText: {
        padding: 10,
        fontSize: 16,
        color: theme.text,
    },
});
