import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import * as Device from "expo-device";
import { Platform } from "react-native";
import uuid from "react-native-uuid";

/**
 * Локальный userId обеспечивает гостевую идентичность: хранится под одним ключом, генерируется
 * детерминированно по устройству (с префиксом device-) и переиспользуется между сессиями для
 * авто-логина, аналитики или привязки данных до авторизации. При входе серверный id просто
 * перезаписывает локальный.
 */
const USER_ID_KEY = "userId";
const DEVICE_USER_ID_PREFIX = "device-";

const sanitizeUserId = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, "");

const withPrefix = (value: string) =>
    value.startsWith(DEVICE_USER_ID_PREFIX) ? value : `${DEVICE_USER_ID_PREFIX}${value}`;

const createFallbackUserId = () => `${DEVICE_USER_ID_PREFIX}${uuid.v4()}`;

const ensureGeneratedUserId = async (): Promise<string> => {
    const deviceUserId = await deriveDeviceUserId();
    return deviceUserId ?? createFallbackUserId();
};

const deriveDeviceUserId = async (): Promise<string | null> => {
    try {
        if (Platform.OS === "android") {
            const androidId = await Application.getAndroidId();
            if (androidId) {
                const sanitized = sanitizeUserId(androidId);
                if (sanitized) {
                    return withPrefix(sanitized);
                }
            }
        }

        if (Platform.OS === "ios") {
            const iosId = await Application.getIosIdForVendorAsync();
            if (iosId) {
                const sanitized = sanitizeUserId(iosId);
                if (sanitized) {
                    return withPrefix(sanitized);
                }
            }
        }

        const manufacturer = Device.manufacturer ?? null; // string | null
        let deviceType: number | null = null;
        try {
            // В некоторых версиях deviceType уже доступен синхронно
            // (если нет — получаем асинхронно)
            deviceType = (Device as any).deviceType ?? (await Device.getDeviceTypeAsync());
        } catch {
            deviceType = null;
        }

        const fallbackParts = [
            manufacturer ?? Device.manufacturer ?? undefined,
            Device.modelName ?? undefined,
            Device.osBuildId ?? Device.osInternalBuildId ?? undefined,
            deviceType != null ? `type-${deviceType}` : undefined,
        ].filter(Boolean) as string[];

        if (fallbackParts.length > 0) {
            const sanitized = sanitizeUserId(fallbackParts.join("-").toLowerCase());
            if (sanitized) {
                return withPrefix(sanitized);
            }
        }
    } catch (error) {
        console.warn("Failed to derive device-based user id", error);
    }

    return null;
};

export const setLocalUserId = async (userId: string) => {
    const sanitized = sanitizeUserId(userId);
    const valueToStore = sanitized || (await ensureGeneratedUserId());

    await AsyncStorage.setItem(USER_ID_KEY, valueToStore);
};

export const getLocalUserId = async (): Promise<string> => {
    try {
        const storedUserId = await AsyncStorage.getItem(USER_ID_KEY);
        if (storedUserId) {
            return storedUserId;
        }

        const newUserId = await ensureGeneratedUserId();

        await AsyncStorage.setItem(USER_ID_KEY, newUserId);
        return newUserId;
    } catch (e) {
        console.error("Error getting user ID:", e);
        throw e;
    }
};

export const removeLocalUserId = async () => {
    await AsyncStorage.removeItem(USER_ID_KEY);
};
