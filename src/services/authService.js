import axios from 'axios';

// Базовый URL вашего бэкенда
const API_URL = 'http://localhost:8080/api/auth';

class AuthService {
    // Регистрация нового пользователя
    async register(userData) {
        try {
            const response = await axios.post(`${API_URL}/register`, {
                username: userData.username,
                email: userData.email,
                password: userData.password
            });

            if (response.data.token) {
                // Добавляем роль ROLE_USER для обычных пользователей
                const userWithRole = {
                    ...response.data,
                    role: 'ROLE_USER'
                };
                localStorage.setItem('user', JSON.stringify(userWithRole));
                localStorage.setItem('token', response.data.token);
                this.setAuthToken(response.data.token);
                return userWithRole;
            }

            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Вход пользователя
    async login(credentials) {
        try {
            // Всегда идем в бэкенд, никакого хардкода!
            const response = await axios.post(`${API_URL}/login`, {
                username: credentials.username,
                password: credentials.password
            });

            if (response.data.token) {
                // Сохраняем пользователя как есть (роль придет с бэкенда)
                const user = response.data;
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('token', user.token);
                this.setAuthToken(user.token);

                console.log('Успешный вход через бэкенд:', user);
                return user;
            }

            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Выход пользователя
    logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        this.setAuthToken(null);
    }

    // Получение текущего пользователя
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    // Получение токена
    getToken() {
        return localStorage.getItem('token');
    }

    // Установка токена в заголовки axios
    setAuthToken(token) {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }

    // Проверка авторизации
    isAuthenticated() {
        return !!this.getToken();
    }

    // Получение роли пользователя
    getUserRole() {
        const user = this.getCurrentUser();
        // Проверяем разные возможные форматы роли
        return user?.role || user?.roles?.[0] || 'ROLE_USER';
    }

    // Проверка, является ли пользователь админом
    isAdmin() {
        const role = this.getUserRole();
        return role === 'ROLE_ADMIN' || role === 'ADMIN' || role === 'admin';
    }

    // Обработка ошибок
    handleError(error) {
        if (error.response) {
            console.error('Server error:', error.response.data);
            return {
                status: error.response.status,
                message: error.response.data.message || 'Произошла ошибка на сервере',
                errors: error.response.data.errors || null
            };
        } else if (error.request) {
            console.error('Network error:', error.request);
            return {
                status: 503,
                message: 'Сервер временно недоступен. Проверьте подключение к интернету.'
            };
        } else {
            console.error('Request error:', error.message);
            return {
                status: 500,
                message: 'Произошла ошибка при отправке запроса'
            };
        }
    }
}

export default new AuthService();