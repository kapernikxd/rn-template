import AsyncStorage from "@react-native-async-storage/async-storage";
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
export const setLocalUserId = async (userId: string) => {
    await removeLocalUserId();
    await setItem("userId", userId);
};

export const getLocalUserId = async (): Promise<string> => {
    try {
        const storedUserId = await getItem("userId");
        if (storedUserId) {
            return storedUserId;
        }
        const newUserId = `app-${uuid.v4()}`;
        await setItem("userId", newUserId);
        return newUserId;
    } catch (e) {
        console.error("Error getting user ID:", e);
        throw e;
    }
};

export const removeLocalUserId = async () => {
    await removeItem("userId");
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

