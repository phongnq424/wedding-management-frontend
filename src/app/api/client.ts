const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type RequestOptions = RequestInit & {
    auth?: boolean;
};

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token || '');
        }
    });
    failedQueue = [];
};

export async function apiRequest<T>(
    path: string,
    options: RequestOptions = {}
): Promise<T> {
    // Import here to avoid circular dependency
    const { authService } = await import('../services/authService');

    const token = authService.getAccessToken();
    const headers = new Headers(options.headers);

    if (!headers.has("Content-Type") && options.body) {
        headers.set("Content-Type", "application/json");
    }

    if (options.auth !== false && token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    let response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && options.auth !== false && authService.getRefreshToken()) {
        if (!isRefreshing) {
            isRefreshing = true;
            try {
                // Note: Refresh token endpoint is not implemented in backend yet
                // This is a placeholder for when token refresh is needed
                authService.logout();
                processQueue(new Error('Token expired'), null);
                window.location.href = '/';
                throw new Error('Token expired - please login again');
            } catch (error) {
                processQueue(error as Error, null);
                throw error;
            } finally {
                isRefreshing = false;
            }
        } else {
            // Wait for token refresh to complete
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(newToken => {
                const newHeaders = new Headers(headers);
                newHeaders.set("Authorization", `Bearer ${newToken}`);
                return fetch(`${API_BASE_URL}${path}`, {
                    ...options,
                    headers: newHeaders,
                });
            }).then(res => res.json());
        }
    }

    const body = await response.json().catch(() => null);

    // Backend returns ApiResponse wrapper
    if (!response.ok) {
        const errorMessage = body?.message || "API request failed";
        throw new Error(errorMessage);
    }

    // Extract data from ApiResponse wrapper, or return the data directly
    if (body?.data !== undefined) {
        return body.data as T;
    }

    return body as T;
}