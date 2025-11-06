import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import * as Device from "expo-device";
import { Platform } from "react-native";
import uuid from "react-native-uuid";
import type { AuthUser } from "../../types/auth";

const REFRESH_TOKEN = "refreshToken";
const ACCESS_TOKEN = "accessToken";
const AUTH_USER = "authUser";

// Универсальные функции для работы с AsyncStorage
const setItem = async (key: string, value: string) => {
    await AsyncStorage.setItem(key, value);
};

const getItem = async (key: string): Promise<string | null> => {
    return await AsyncStorage.getItem(key);
};

const removeItem = async (key: string) => {
    await AsyncStorage.removeItem(key);
};

// Работа с токенами
export const setRefreshToken = async (token: string) => setItem(REFRESH_TOKEN, token);
export const getRefreshToken = async () => getItem(REFRESH_TOKEN);
export const removeRefreshToken = async () => removeItem(REFRESH_TOKEN);

export const setAccessToken = async (token: string) => setItem(ACCESS_TOKEN, token);
export const getAccessToken = async () => getItem(ACCESS_TOKEN);
export const removeAccessToken = async () => removeItem(ACCESS_TOKEN);

// Работа с пользователем
export const setAuthUser = async (user: AuthUser) => setItem(AUTH_USER, JSON.stringify(user));
export const getAuthUser = async (): Promise<AuthUser | null> => {
    const storedUser = await getItem(AUTH_USER);
    if (!storedUser) {
        return null;
    }

    try {
        return JSON.parse(storedUser) as AuthUser;
    } catch (error) {
        console.warn("Failed to parse stored auth user", error);
        await removeAuthUser();
        return null;
    }
};
export const removeAuthUser = async () => removeItem(AUTH_USER);

// Работа с ID пользователя
const LOCAL_USER_ID_KEY = "userId";
const DEVICE_USER_ID_PREFIX = "device-";

const sanitizeUserId = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, "");

const withPrefix = (value: string) =>
    value.startsWith(DEVICE_USER_ID_PREFIX) ? value : `${DEVICE_USER_ID_PREFIX}${value}`;

const deriveDeviceUserId = async (): Promise<string | null> => {
    try {
        if (Platform.OS === "android") {
            const androidId = await Application.getAndroidIdAsync();
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

        const [manufacturer, deviceType] = await Promise.all([
            Device.getManufacturerAsync().catch(() => null),
            Device.getDeviceTypeAsync().catch(() => null),
        ]);

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
    const valueToStore = sanitized || `app-${uuid.v4()}`;
    await removeLocalUserId();
    await setItem(LOCAL_USER_ID_KEY, valueToStore);
};

export const getLocalUserId = async (): Promise<string> => {
    try {
        const storedUserId = await getItem(LOCAL_USER_ID_KEY);
        if (storedUserId) {
            return storedUserId;
        }

        const deviceUserId = await deriveDeviceUserId();
        const newUserId = deviceUserId ?? `app-${uuid.v4()}`;

        await setItem(LOCAL_USER_ID_KEY, newUserId);
        return newUserId;
    } catch (e) {
        console.error("Error getting user ID:", e);
        throw e;
    }
};

export const removeLocalUserId = async () => {
    await removeItem(LOCAL_USER_ID_KEY);
};

// Работа с просмотренными событиями
export const addViewedEvent = async (eventId: string): Promise<void> => {
    try {
        const viewedEvents = await getItem("viewedEvents");
        const viewedEventsArray = viewedEvents ? JSON.parse(viewedEvents) : [];

        if (!viewedEventsArray.includes(eventId)) {
            viewedEventsArray.push(eventId);
            await setItem("viewedEvents", JSON.stringify(viewedEventsArray));
        }
    } catch (e) {
        console.error("Error adding viewed event:", e);
    }
};

export const hasViewedEvent = async (eventId: string): Promise<boolean> => {
    try {
        const viewedEvents = await getItem("viewedEvents");
        const viewedEventsArray = viewedEvents ? JSON.parse(viewedEvents) : [];
        return viewedEventsArray.includes(eventId);
    } catch (e) {
        console.error("Error checking viewed event:", e);
        return false;
    }
};

