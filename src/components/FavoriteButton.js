import React, { useState } from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';

const FavoriteButton = ({ book, size = 'medium', sx = {} }) => {
    const { isAuthenticated } = useAuth();
    const { isFavorite, toggleFavorite } = useFavorites();
    const [loading, setLoading] = useState(false);

    const handleClick = async (e) => {
        e.stopPropagation();

        if (!isAuthenticated) {
            // Можно показать уведомление или перенаправить на логин
            alert('Пожалуйста, войдите в систему, чтобы добавлять книги в избранное');
            return;
        }

        setLoading(true);
        await toggleFavorite(book);
        setLoading(false);
    };

    return (
        <Tooltip title={isAuthenticated ? (isFavorite(book.id) ? 'Удалить из избранного' : 'Добавить в избранное') : 'Войдите, чтобы добавлять в избранное'}>
            <IconButton
                onClick={handleClick}
                disabled={loading}
                size={size}
                sx={{
                    color: isFavorite(book.id) ? 'error.main' : 'action.disabled',
                    '&:hover': {
                        color: 'error.main',
                        transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s',
                    ...sx
                }}
            >
                {loading ? (
                    <CircularProgress size={20} color="inherit" />
                ) : isFavorite(book.id) ? (
                    <Favorite />
                ) : (
                    <FavoriteBorder />
                )}
            </IconButton>
        </Tooltip>
    );
};

export default FavoriteButton;