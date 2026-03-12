import { useAuthStore } from '@/store/auth-store';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export class ApiError extends Error {
    constructor(public status: number, message: string, public data?: any) {
        super(message);
        this.name = 'ApiError';
    }
}

async function refreshToken(): Promise<string | null> {
    const { refreshToken, setTokens, logout } = useAuthStore.getState();

    if (!refreshToken) return null;

    try {
        const response = await fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            throw new Error('Refresh failed');
        }

        const { data } = await response.json();
        setTokens(data.accessToken, data.refreshToken);
        return data.accessToken;
    } catch (error) {
        logout();
        return null;
    }
}

export const fetchClient = async (
    endpoint: string,
    options: RequestInit = {}
): Promise<any> => {
    const { accessToken } = useAuthStore.getState();
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type') && options.body) {
        headers.set('Content-Type', 'application/json');
    }

    if (accessToken && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const config: RequestInit = {
        ...options,
        headers,
    };

    try {
        let response = await fetch(url, config);

        // Handle 401 Unauthorized
        if (response.status === 401) {
            const newAccessToken = await refreshToken();

            if (newAccessToken) {
                // Retry original request with new token
                headers.set('Authorization', `Bearer ${newAccessToken}`);
                response = await fetch(url, { ...config, headers });
            } else {
                // If refresh failed, login page redirect happens via auth store/middleware
                throw new ApiError(401, 'Session expired');
            }
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new ApiError(response.status, data.message || 'An error occurred', data);
        }

        return data;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, error instanceof Error ? error.message : 'Network error');
    }
};
