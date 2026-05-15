export interface LoginCredentials {
    email: string;
    password: string;
}


export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: string;
}

export interface LoginData {
    staffId: string;
    fullName: string;
    email: string;
    roleId: string;
    roleName: string;
    requires2FA: boolean;
    mfaChallengeId: string | null;
    accessToken: string;
    expiresAt: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken?: string;
    user: AuthUser;
    requires2FA: boolean;
    mfaChallengeId?: string | null;
}

export interface Verify2FARequest {
    mfaChallengeId: string;
    inputCode: string;
}