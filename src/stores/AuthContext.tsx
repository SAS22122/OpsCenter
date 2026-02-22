import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiClient } from '@/lib/api';

export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    preferences: Record<string, unknown>;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setTokenState] = useState<string | null>(localStorage.getItem('access_token'));
    const [isLoading, setIsLoading] = useState(true);

    // Helper to set both state and localStorage
    const setToken = (newToken: string | null) => {
        setTokenState(newToken);
        if (newToken) {
            localStorage.setItem('access_token', newToken);
        } else {
            localStorage.removeItem('access_token');
        }
    };

    const login = (newToken: string, user: User) => {
        setToken(newToken);
        setUser(user);
        ApiClient.setToken(newToken);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        ApiClient.setToken(null);
    };

    const refreshUser = async () => {
        if (!token) {
            setIsLoading(false);
            return;
        }

        ApiClient.setToken(token);
        try {
            const userData = await ApiClient.getMe();
            setUser(userData as User);
        } catch (error) {
            console.error("Failed to refresh user:", error);
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        refreshUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
