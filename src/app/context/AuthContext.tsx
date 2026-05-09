import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import authService from '../services/authService';
import { LoginCredentials, LoginResponse, Verify2FARequest } from '../dto/auth.dto';

interface AuthContextType {
    isLoggedIn: boolean;
    user: LoginResponse['user'] | null;
    isLoading: boolean;
    error: string | null;
    requires2FA: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    verify2FA: (request: Verify2FARequest) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(() => authService.isAuthenticated());
    const [user, setUser] = useState(() => authService.getUser());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [requires2FA, setRequires2FA] = useState(false);

    const login = useCallback(async (credentials: LoginCredentials) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authService.login(credentials);
            if (response.requires2FA) {
                setRequires2FA(true);
                setUser(response.user);
            } else {
                setUser(response.user);
                setIsLoggedIn(true);
                setRequires2FA(false);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const verify2FA = useCallback(async (request: Verify2FARequest) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authService.verify2FA(request);
            setUser(response.user);
            setIsLoggedIn(true);
            setRequires2FA(false);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '2FA verification failed';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await authService.logout();
        } finally {
            setIsLoggedIn(false);
            setUser(null);
            setError(null);
            setRequires2FA(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn,
                user,
                isLoading,
                error,
                requires2FA,
                login,
                verify2FA,
                logout,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
