import { apiRequest } from '../api/client';
import { LoginCredentials, LoginResponse, Verify2FARequest, AuthUser } from '../dto/auth.dto';
import { LoginData } from '../dto/auth.dto';

const AUTH_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';
const PENDING_2FA_KEY = '2fa_pending';

export const authService = {
    /**
     * Login with email and password
     */
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        try {
            const data = await apiRequest<LoginData>("/auth/login", {
                method: "POST",
                body: JSON.stringify(credentials),
                auth: false,
            });

            const user: AuthUser = {
                id: data.staffId,
                email: data.email,
                name: data.fullName,
                role: data.roleName,
            };

            const loginResponse: LoginResponse = {
                accessToken: data.accessToken,
                user,
                requires2FA: data.requires2FA,
                mfaChallengeId: data.mfaChallengeId,
            };

            if (data.requires2FA) {
                localStorage.setItem(
                    PENDING_2FA_KEY,
                    JSON.stringify({
                        userId: data.staffId,
                        accessToken: data.accessToken,
                        mfaChallengeId: data.mfaChallengeId,
                    })
                );
            } else {
                localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
                localStorage.setItem(USER_KEY, JSON.stringify(user));
            }

            return loginResponse;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Login failed");
        }
    },

    /**
     * Verify 2FA code and complete login
     */
    async verify2FA(request: Verify2FARequest): Promise<LoginResponse> {
        try {
            const data = await apiRequest<LoginData>('/auth/2fa/verify', {
                method: 'POST',
                body: JSON.stringify(request),
                auth: false,
            });

            const user: AuthUser = {
                id: data.staffId,
                email: data.email,
                name: data.fullName,
                role: data.roleName,
            };

            const loginResponse: LoginResponse = {
                accessToken: data.accessToken,
                user,
                requires2FA: data.requires2FA,
                mfaChallengeId: data.mfaChallengeId,
            };

            if (data.accessToken) {
                localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
            }

            localStorage.setItem(USER_KEY, JSON.stringify(user));
            localStorage.removeItem(PENDING_2FA_KEY);

            return loginResponse;
        } catch (error) {
            throw new Error(
                error instanceof Error ? error.message : '2FA verification failed'
            );
        }
    },
    /**
     * Get pending 2FA data
     */
    getPending2FA() {
        const pending = localStorage.getItem(PENDING_2FA_KEY);
        return pending ? JSON.parse(pending) : null;
    },

    /**
     * Clear pending 2FA data
     */
    clearPending2FA(): void {
        localStorage.removeItem(PENDING_2FA_KEY);
    },

    /**
     * Logout and clear stored tokens
     */
    async logout(): Promise<void> {
        const token = this.getAccessToken();
        try {
            if (token) {
                await apiRequest<void>('/auth/logout', {
                    method: 'POST',
                    auth: true,
                });
            }
        } catch (error) {
            // Continue logout even if API call fails
            console.warn('Logout API call failed:', error);
        } finally {
            this.clearAuthData();
        }
    },

    /**
     * Get stored access token
     */
    getAccessToken(): string | null {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    },

    /**
     * Get stored refresh token
     */
    getRefreshToken(): string | null {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    /**
     * Get stored user information
     */
    getUser() {
        const userStr = localStorage.getItem(USER_KEY);

        if (!userStr || userStr === "undefined" || userStr === "null") {
            return null;
        }

        try {
            return JSON.parse(userStr);
        } catch {
            localStorage.removeItem(USER_KEY);
            return null;
        }
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!this.getAccessToken();
    },

    /**
     * Set token manually (useful for testing)
     */
    setAccessToken(token: string): void {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
    },

    /**
     * Clear all stored auth data
     */
    clearAuthData(): void {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(PENDING_2FA_KEY);
    },
};

export default authService;
