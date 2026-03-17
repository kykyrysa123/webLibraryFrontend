import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const FavoritesContext = createContext();

export function useFavorites() {
    return useContext(FavoritesContext);
}

export function FavoritesProvider({ children }) {
    const { user, isAuthenticated } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Загружаем избранное из БД
    const loadFavorites = useCallback(async () => {
        if (!isAuthenticated || !user) {
            setFavorites([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Используем новый эндпоинт /my
            const response = await axios.get('http://localhost:8080/api/favorites/my');
            setFavorites(response.data);
        } catch (err) {
            console.error('Ошибка загрузки избранного:', err);
            setError('Не удалось загрузить избранное');
            setFavorites([]);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user]);

    // Загружаем при монтировании и при изменении пользователя
    useEffect(() => {
        loadFavorites();
    }, [loadFavorites]);

    // Добавление в избранное
    const addToFavorites = async (book) => {
        if (!isAuthenticated || !user) {
            setError('Необходимо авторизоваться');
            return false;
        }

        try {
            setError(null);

            await axios.post('http://localhost:8080/api/favorites', {
                bookId: book.id
            });

            // Обновляем локальное состояние
            setFavorites(prev => {
                if (!prev.some(item => item.id === book.id)) {
                    return [...prev, book];
                }
                return prev;
            });

            return true;
        } catch (err) {
            console.error('Ошибка добавления в избранное:', err);
            setError(err.response?.data || 'Не удалось добавить в избранное');
            return false;
        }
    };

    // Удаление из избранного
    const removeFromFavorites = async (bookId) => {
        if (!isAuthenticated || !user) {
            setError('Необходимо авторизоваться');
            return false;
        }

        try {
            setError(null);

            await axios.delete(`http://localhost:8080/api/favorites/${bookId}`);

            // Обновляем локальное состояние
            setFavorites(prev => prev.filter(book => book.id !== bookId));
            return true;
        } catch (err) {
            console.error('Ошибка удаления из избранного:', err);
            setError(err.response?.data || 'Не удалось удалить из избранного');
            return false;
        }
    };

    // Проверка, есть ли книга в избранном
    const isFavorite = (bookId) => {
        return favorites.some(book => book.id === bookId);
    };

    // Переключение избранного
    const toggleFavorite = async (book) => {
        if (isFavorite(book.id)) {
            return await removeFromFavorites(book.id);
        } else {
            return await addToFavorites(book);
        }
    };

    const value = {
        favorites,
        loading,
        error,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        toggleFavorite,
        refreshFavorites: loadFavorites
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
}