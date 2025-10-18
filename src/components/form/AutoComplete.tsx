import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import axios from "axios";
import { inputHeight } from "../../constants/theme/styles/commonFormStyles";
import { ThemeType, useTheme } from 'rn-vs-lb/theme';

export type CityItem = {
    lat: number;
    lon: number;
    display_name: string;
};

type CityAutocompleteProps = {
    placeholder?: string;
    onSelect?: (city: CityItem) => void;
    defaultValue?: string;
    /** Если нужно отобразить ошибку под полем */
    error?: string;
};

/** Простой debounce без lodash */
function useDebounce<T extends (...args: any[]) => void>(fn: T, delay = 500) {
    const timer = useRef<NodeJS.Timeout | null>(null);

    return useMemo(
        () =>
            ((...args: Parameters<T>) => {
                if (timer.current) clearTimeout(timer.current);
                timer.current = setTimeout(() => fn(...args), delay);
            }) as T,
        [fn, delay]
    );
}

const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
    placeholder = "Search for a city...",
    onSelect,
    defaultValue = "",
    error,
}) => {
    const { theme, formStyles } = useTheme();
    const styles = getStyles({ theme });

    const [query, setQuery] = useState(defaultValue);
    const [cities, setCities] = useState<CityItem[]>([]);
    const [visible, setVisible] = useState(false);
    const lastQueryRef = useRef("");

    useEffect(() => {
        setQuery(defaultValue);
    }, [defaultValue]);

    const search = async (text: string) => {
        const q = text.trim();
        if (!q) {
            setCities([]);
            setVisible(false);
            return;
        }

        try {
            lastQueryRef.current = q;
            const res = await axios.get(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`
            );
            // Защита от гонок: показываем только результат последнего запроса
            if (lastQueryRef.current !== q) return;

            const data = Array.isArray(res.data) ? res.data : [];
            if (data.length) {
                // Приводим к нашему типу
                const mapped: CityItem[] = data.map((d: any) => ({
                    display_name: String(d.display_name ?? ""),
                    lat: Number(d.lat),
                    lon: Number(d.lon),
                }));
                setCities(mapped);
                setVisible(true);
            } else {
                setCities([]);
                setVisible(false);
            }
        } catch (e) {
            console.error("City search error:", e);
            setCities([]);
            setVisible(false);
        }
    };

    const debouncedSearch = useDebounce(search, 500);

    const handleChangeText = (text: string) => {
        setQuery(text);
        debouncedSearch(text);
    };

    const handleSelectCity = (city: CityItem) => {
        setQuery(city.display_name);
        setVisible(false);
        onSelect?.({
            display_name: city.display_name,
            lat: Number(city.lat),
            lon: Number(city.lon),
        });
    };

    const clear = () => {
        setQuery("");
        setCities([]);
        setVisible(false);
    };

    return (
        <View
            style={{ position: "relative", zIndex: 1, overflow: "visible" }}
            collapsable={false}
        >
            <View style={styles.inputWrapper}>
                <TextInput
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
                    <TouchableOpacity style={styles.clearButton} onPress={clear}>
                        <Text style={{ fontSize: 18, color: theme.placeholder, top: -3 }}>×</Text>
                    </TouchableOpacity>
                )}
            </View>

            {visible && cities.length > 0 && (
                <View style={styles.dropdownContainer} pointerEvents="auto">
                    <FlatList
                        keyboardShouldPersistTaps="handled"
                        data={cities}
                        keyExtractor={(item, index) => `${item.lat}_${item.lon}_${index}`}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => handleSelectCity(item)}>
                                <Text style={styles.itemText}>{item.display_name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}

            {error ? <Text style={formStyles.errorText}>{error}</Text> : null}
        </View>
    );
};

export default CityAutocomplete;

const getStyles = ({ theme }: { theme: ThemeType }) =>
    StyleSheet.create({
        textInput: {
            height: inputHeight,
            color: theme.text,
        },
        inputWrapper: {
            position: "relative",
            justifyContent: "center",
        },
        clearButton: {
            position: "absolute",
            right: 10,
            top: "50%",
            transform: [{ translateY: -10 }],
            zIndex: 10,
        },
        /** Ключевой слой: абсолют + высокий zIndex/elevation, чтобы быть поверх карты/ScrollView */
        dropdownContainer: {
            position: "absolute",
            left: 0,
            right: 0,
            top: inputHeight + 8, // сразу под инпутом
            maxHeight: 220,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.white,
            zIndex: 1000, // iOS/JS
            elevation: 20, // Android
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
        },
        itemText: {
            padding: 10,
            fontSize: 16,
            color: theme.text,
        },
    });
