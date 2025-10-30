import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_BALANCE_STORAGE_KEY = 'app.tokens.balance';
export const DEFAULT_TOKEN_BALANCE = 100;

const sanitizeTokenAmount = (value: number) => {
    if (Number.isNaN(value) || !Number.isFinite(value)) {
        return DEFAULT_TOKEN_BALANCE;
    }

    return Math.max(0, Math.floor(value));
};

export const getTokenBalance = async (): Promise<number> => {
    try {
        const storedValue = await AsyncStorage.getItem(TOKEN_BALANCE_STORAGE_KEY);
        if (storedValue === null) {
            await AsyncStorage.setItem(
                TOKEN_BALANCE_STORAGE_KEY,
                DEFAULT_TOKEN_BALANCE.toString(),
            );
            return DEFAULT_TOKEN_BALANCE;
        }

        const parsedValue = sanitizeTokenAmount(Number(storedValue));
        if (parsedValue.toString() !== storedValue) {
            await AsyncStorage.setItem(TOKEN_BALANCE_STORAGE_KEY, parsedValue.toString());
        }

        return parsedValue;
    } catch (error) {
        throw new Error('Failed to read token balance');
    }
};

export const setTokenBalance = async (amount: number): Promise<number> => {
    const sanitizedAmount = sanitizeTokenAmount(amount);

    try {
        await AsyncStorage.setItem(TOKEN_BALANCE_STORAGE_KEY, sanitizedAmount.toString());
        return sanitizedAmount;
    } catch (error) {
        throw new Error('Failed to update token balance');
    }
};

export const addTokens = async (amount: number): Promise<number> => {
    if (amount <= 0) {
        return getTokenBalance();
    }

    const currentBalance = await getTokenBalance();
    return setTokenBalance(currentBalance + amount);
};

export const subtractTokens = async (amount: number): Promise<number> => {
    if (amount <= 0) {
        return getTokenBalance();
    }

    const currentBalance = await getTokenBalance();
    return setTokenBalance(Math.max(0, currentBalance - amount));
};
