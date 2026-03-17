import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initAuth = async () => {
            const currentUser = authService.getCurrentUser();
            const token = authService.getToken();

            if (currentUser && token) {
                authService.setAuthToken(token);

                // Для админа adminwl явно устанавливаем роль
                if (currentUser.username === 'adminwl') {
                    const adminUser = {
                        ...currentUser,
                        role: 'ROLE_ADMIN'
                    };
                    setUser(adminUser);
                    // Обновляем в localStorage
                    localStorage.setItem('user', JSON.stringify(adminUser));
                } else {
                    setUser(currentUser);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const register = async (userData) => {
        try {
            setError(null);
            const response = await authService.register(userData);

            // Для обычных пользователей ставим ROLE_USER
            const userWithRole = {
                ...response,
                role: 'ROLE_USER'
            };

            localStorage.setItem('user', JSON.stringify(userWithRole));
            setUser(userWithRole);
            return { success: true, data: userWithRole };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err };
        }
    };

    const login = async (credentials) => {
        try {
            setError(null);
            const response = await authService.login(credentials);

            // Определяем роль
            let role = 'ROLE_USER';
            if (credentials.username === 'adminwl') {
                role = 'ROLE_ADMIN';
            }

            const userWithRole = {
                ...response,
                role: role
            };

            localStorage.setItem('user', JSON.stringify(userWithRole));
            setUser(userWithRole);
            return { success: true, data: userWithRole };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err };
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const clearError = () => {
        setError(null);
    };

    // Проверка роли пользователя
    const isAdmin = () => {
        if (!user) return false;
        // Проверяем username для adminwl
        if (user.username === 'adminwl') return true;
        // Проверяем роль
        const role = user?.role || user?.roles?.[0];
        return role === 'ROLE_ADMIN' || role === 'ADMIN' || role === 'admin';
    };

    const value = {
        user,
        loading,
        error,
        register,
        login,
        logout,
        clearError,
        isAuthenticated: !!user,
        isAdmin: isAdmin()
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}