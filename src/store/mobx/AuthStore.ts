import { isAxiosError } from "axios";
import { $api } from "../../helpers";
import { makeAutoObservable, runInAction } from "mobx";
import AuthService from "../../services/auth/AuthService";
import { getRefreshToken, removeAccessToken, removeLocalUserId, removeRefreshToken, setAccessToken, setLocalUserId, setRefreshToken } from "../../helpers/storageHelper";
import { BaseStore, StoreListener } from "./BaseStore";
import { RootStore } from "../rootStore";
import { AuthProvider, AuthUser, AuthUserLike, FormErrorResponse, LoginParams, NewPasswordParams, ParamsVerificateEmail, RegistrationParams } from "../../types/auth";


export class AuthStore {
    private readonly baseStore = new BaseStore();
    readonly subscribe: (listener: StoreListener) => () => void;
    private root: RootStore;

    isAuth: boolean = false;
    user: AuthUser | null = null;
    loading: boolean = false;
    accessToken: string | null = null;

    lastProvider: AuthProvider | null = null;
    hasAttemptedAutoLogin = false;

    constructor(root: RootStore) {
        this.root = root;
        this.subscribe = this.baseStore.subscribe;
        makeAutoObservable(this, {
            baseStore: false,
            subscribe: false,
            notify: false,
            root: false,
        } as any);
    }

    private notify() {
        this.baseStore.notify();
    }

    get snapshotVersion() {
        return this.baseStore.snapshotVersion;
    }

    private normalizeUser(user: AuthUserLike): AuthUser {
        const fullName = user.fullName ?? user.name ?? '';
        const name = user.name ?? fullName;
        return {
            id: user.id,
            email: user.email,
            isActivated: user.isActivated ?? true,
            fullName,
            name,
        };
    }

    get isAuthenticated() {
        return this.user !== null;
    }

    get myId() {
        return this.user?.id ?? null;
    }

    setLoading(value: boolean) {
        this.loading = value;
        this.notify();
    }

    setAuth(value: boolean) {
        this.isAuth = value;
        this.notify();
    }

    startAuth(provider: AuthProvider) {
        this.lastProvider = provider;
        this.notify();
    }

    completeAuth(user: AuthUserLike) {
        const normalizedUser = this.normalizeUser(user);
        runInAction(() => {
            this.user = normalizedUser;
            this.isAuth = true;
            this.lastProvider = this.lastProvider ?? 'demo';
        });
        this.notify();
    }

    cancelAuth() {
        this.lastProvider = null;
        this.notify();
    }

    getAuthUserEmail = () => this.user?.email;

    getMyId = () => this.user?.id;

    getUserInfo = () => {
        _id: this.user?.id
    }

    async loginByGoogle(credential: string, expoPushToken?: string) {
        try {
            const { data } = await AuthService.loginByGoogle(credential);
            const normalizedUser = this.normalizeUser(data.user);

            runInAction(() => {
                this.user = normalizedUser;
                this.isAuth = true;
                this.accessToken = data.accessToken;
                this.lastProvider = 'google';
            });

            this.notify();

            await setRefreshToken(data.refreshToken);
            await setAccessToken(data.accessToken);
            await setLocalUserId(data.user.id);

            $api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;

            if (expoPushToken) {
                await this.sendPushToken(expoPushToken);
            }

            return data
        } catch (e: any) {
            throw e;
        }
    }

    async loginByApple(identityToken: string, expoPushToken?: string) {
        try {
            const { data } = await AuthService.loginByApple(identityToken);

            const normalizedUser = this.normalizeUser(data.user);

            runInAction(() => {
                this.user = normalizedUser;
                this.isAuth = true;
                this.accessToken = data.accessToken;
                this.lastProvider = 'apple';
            });

            this.notify();

            await setRefreshToken(data.refreshToken);
            await setAccessToken(data.accessToken);
            await setLocalUserId(data.user.id);

            $api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;

            if (expoPushToken) {
                await this.sendPushToken(expoPushToken);
            }

            return data;
        } catch (e: any) {
            throw e;
        }
    }

    async login(props: LoginParams, expoPushToken?: string) {
        try {
            this.setLoading(true);
            const { data } = await AuthService.login(props);

            const normalizedUser = this.normalizeUser(data.user);
            runInAction(() => {
                this.user = normalizedUser;
                this.isAuth = true;
                this.accessToken = data.accessToken;
                this.lastProvider = this.lastProvider ?? 'demo';
            });

            this.notify();

            await setRefreshToken(data.refreshToken);
            await setAccessToken(data.accessToken);
            await setLocalUserId(data.user.id);

            $api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;

            if (expoPushToken) {
                await this.sendPushToken(expoPushToken);
            }

            return data
        } catch (error: unknown) {
            const formErrors = this.extractFormErrors(error);
            if (formErrors) {
                throw formErrors;
            }
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    async logout() {
        try {
            await AuthService.logout();
        } finally {
            runInAction(() => {
                this.user = null;
                this.isAuth = false;
                this.accessToken = null;
                this.lastProvider = null;
            });
            this.notify();
            await removeRefreshToken();
            await removeAccessToken();
            await removeLocalUserId();
        }
    }


    async registration(props: RegistrationParams, expoPushToken?: string) {
        try {
            this.setLoading(true);
            const { data } = await AuthService.registration(props);

            const normalizedUser = this.normalizeUser(data.user);
            runInAction(() => {
                this.user = normalizedUser;
                this.isAuth = true;
                this.accessToken = data.accessToken;
                this.lastProvider = this.lastProvider ?? 'demo';
            });

            this.notify();

            await setAccessToken(data.accessToken);
            await setRefreshToken(data.refreshToken);
            await setLocalUserId(data.user.id);

            $api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;

            if (expoPushToken) {
                await this.sendPushToken(expoPushToken);
            }

            this.setLoading(false);
        } catch (error: unknown) {
            const formErrors = this.extractFormErrors(error);
            if (formErrors) {
                throw formErrors;
            }
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    async otp(props: ParamsVerificateEmail) {
        try {
            this.setLoading(true);
            const { data } = await AuthService.verificateEmail(props);

            const normalizedUser = this.normalizeUser(data.user);
            runInAction(() => {
                this.user = normalizedUser;
                this.isAuth = true;
            })

            this.notify();

            return data

        } catch (error: unknown) {
            const formErrors = this.extractFormErrors(error);
            if (formErrors) {
                throw formErrors;
            }
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    async activateEmail(email: string) {
        try {
            const { data } = await AuthService.activateEmail(email);
            return data;

        } catch (error: unknown) {
            const formErrors = this.extractFormErrors(error);
            if (formErrors) {
                throw formErrors;
            }
            throw error;
        }
    }

    //флоу когда сбрасываем пароль
    async resetPassword(props: ParamsVerificateEmail) {
        try {
            this.setLoading(true);
            const { data } = await AuthService.resetPassword(props);
            return data

        } catch (error: unknown) {
            const formErrors = this.extractFormErrors(error);
            if (formErrors) {
                throw formErrors;
            }
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    async newPassword(props: NewPasswordParams) {
        try {
            const { data } = await AuthService.newPassword(props);
            return data;

        } catch (error: unknown) {
            const formErrors = this.extractFormErrors(error);
            if (formErrors) {
                throw formErrors;
            }
            throw error;
        }
    }

    async refreshAccessToken() {
        let didRefresh = false;
        try {
            const refreshToken = await getRefreshToken();
            if (!refreshToken) {
                return false;
            }
            const { data } = await AuthService.refreshAccessTokenRequest(refreshToken);
            const normalizedUser = this.normalizeUser(data.user);
            runInAction(() => {
                this.user = normalizedUser;
                this.accessToken = data.accessToken;
                this.isAuth = true;
                this.lastProvider = this.lastProvider ?? 'demo';
            });

            // Persist обновленные токены для последующих запросов
            await setAccessToken(data.accessToken);
            await setRefreshToken(data.refreshToken);
            await setLocalUserId(data.user.id);

            // Обновляем заголовок авторизации для axios
            $api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;

            didRefresh = true;
        } catch (e: any) {
            await removeRefreshToken();
            await removeAccessToken();
            runInAction(() => {
                this.user = null;
                this.isAuth = false;
                this.accessToken = null;
                this.lastProvider = null;
            });
            console.log(e)
        } finally {
            runInAction(() => {
                this.hasAttemptedAutoLogin = true;
            });
            this.notify();
        }
        return didRefresh;
    }

    async sendPushToken(token: string) {
        try {
            await AuthService.sendPushToken(token);
        } catch (e) {
            console.warn("Ошибка при отправке пуш-токена", e);
        }
    }

    private extractFormErrors(error: unknown): Record<string, string> | null {
        if (isAxiosError<FormErrorResponse>(error)) {
            const errors = error.response?.data?.errors;
            if (Array.isArray(errors)) {
                return errors.reduce<Record<string, string>>((acc, item) => {
                    acc[item.field] = item.message;
                    return acc;
                }, {});
            }
        }

        return null;
    }

}

