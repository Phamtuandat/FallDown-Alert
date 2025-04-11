import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    id: string | null;
    lastName: string | null;
    firstName: string | null;
    email: string | null;
    token: string | null;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (e) {
                console.log('Failed to load user:', e);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        if (email === 'test@example.com' && password === 'password') {
            const userData: User = {
                id: '1',
                lastName: 'Doe',
                firstName: 'John',
                email,
                token: '123456',
            };
            setUser(userData);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            return true;
        }
        return false;
    };

    const logout = async (): Promise<void> => {
        setUser(null);
        await AsyncStorage.removeItem('user');
        router.replace('./login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
