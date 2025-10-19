import { isAxiosError } from "axios";
import { $api, registerTokenRefreshFailureHandler, registerTokenRefreshHandler } from "../../helpers";
import { makeAutoObservable, runInAction } from "mobx";
import AuthService from "../../services/auth/AuthService";
import {
    getAccessToken,
    getAuthUser,
    getRefreshToken,
    removeAccessToken,
    removeAuthUser,
    removeLocalUserId,
    removeRefreshToken,
    setAccessToken,
    setAuthUser,
    setLocalUserId,
    setRefreshToken,
} from "../../helpers/storageHelper";
import { BaseStore, StoreListener } from "./BaseStore";
import { RootStore } from "../rootStore";
import { AuthProvider, AuthUser, AuthUserLike, FormErrorResponse, LoginParams, NewPasswordParams, ParamsVerificateEmail, RegistrationParams } from "../../types/auth";
import type { TokenRefreshPayload } from "../../helpers";
import { isTokenValid } from "../../helpers/auth/tokenUtils";


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

    private readonly handleTokenRefresh = async ({ accessToken, refreshToken, user }: TokenRefreshPayload) => {
        const normalizedUser = this.normalizeUser(user);
        await this.setAuthenticatedUser(normalizedUser, accessToken, { refreshToken });
    };

    private readonly handleTokenRefreshFailure = async () => {
        await this.clearPersistedAuthState();

        runInAction(() => {
            this.user = null;
            this.accessToken = null;
            this.isAuth = false;
            this.lastProvider = null;
        });

        delete $api.defaults.headers.common['Authorization'];

        this.notify();
    };

    constructor(root: RootStore) {
        this.root = root;
        this.subscribe = this.baseStore.subscribe;
        makeAutoObservable(this, {
            baseStore: false,
            subscribe: false,
            notify: false,
            root: false,
        } as any);

        registerTokenRefreshHandler(this.handleTokenRefresh);
        registerTokenRefreshFailureHandler(this.handleTokenRefreshFailure);
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

    private async setAuthenticatedUser(
        user: AuthUser,
        accessToken: string,
        options: { refreshToken?: string; provider?: AuthProvider | null } = {},
    ) {
        const provider = options.provider ?? this.lastProvider ?? 'demo';

        runInAction(() => {
            this.user = user;
            this.isAuth = true;
            this.accessToken = accessToken;
            this.lastProvider = provider;
        });

        $api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        const tasks: Promise<unknown>[] = [
            setAccessToken(accessToken),
            setAuthUser(user),
            setLocalUserId(user.id),
        ];

        if (options.refreshToken) {
            tasks.push(setRefreshToken(options.refreshToken));
        }

        await Promise.all(tasks);

        this.notify();
    }

    private async clearPersistedAuthState() {
        await Promise.all([
            removeRefreshToken(),
            removeAccessToken(),
            removeAuthUser(),
            removeLocalUserId(),
        ]);
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
        void setAuthUser(normalizedUser);
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

            await this.setAuthenticatedUser(normalizedUser, data.accessToken, {
                refreshToken: data.refreshToken,
                provider: 'google',
            });

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

            await this.setAuthenticatedUser(normalizedUser, data.accessToken, {
                refreshToken: data.refreshToken,
                provider: 'apple',
            });

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
            await this.setAuthenticatedUser(normalizedUser, data.accessToken, {
                refreshToken: data.refreshToken,
            });

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
            delete $api.defaults.headers.common['Authorization'];
            await this.clearPersistedAuthState();
        }
    }


    async registration(props: RegistrationParams, expoPushToken?: string) {
        try {
            this.setLoading(true);
            const { data } = await AuthService.registration(props);

            const normalizedUser = this.normalizeUser(data.user);
            await this.setAuthenticatedUser(normalizedUser, data.accessToken, {
                refreshToken: data.refreshToken,
            });

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
        let didRestoreSession = false;
        try {
            const [accessToken, storedUser] = await Promise.all([
                getAccessToken(),
                getAuthUser(),
            ]);

            if (accessToken && storedUser && isTokenValid(accessToken)) {
                await this.setAuthenticatedUser(storedUser, accessToken);
                didRestoreSession = true;
                return true;
            }

            const refreshToken = await getRefreshToken();
            if (!refreshToken) {
                await this.handleTokenRefreshFailure();
                return false;
            }

            const { data } = await AuthService.refreshAccessTokenRequest(refreshToken);
            await this.handleTokenRefresh({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                user: data.user,
            });

            didRestoreSession = true;
        } catch (e: any) {
            await this.handleTokenRefreshFailure();
            console.log(e);
            return false;
        } finally {
            runInAction(() => {
                this.hasAttemptedAutoLogin = true;
            });
            this.notify();
        }
        return didRestoreSession;
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

