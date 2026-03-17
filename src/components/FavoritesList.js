import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardMedia,
    CardActionArea,
    Grid,
    Button,
    AppBar,
    Toolbar,
    IconButton
} from '@mui/material';
import { Favorite, ArrowBack } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import FavoriteButton from './FavoriteButton';

const FavoritesList = () => {
    const { user, isAdmin, logout } = useAuth();
    const { favorites } = useFavorites();
    const navigate = useNavigate();

    const getFullName = (author) => {
        if (!author || typeof author !== 'object' || !author.name || !author.surname) {
            return 'Неизвестный автор';
        }
        return `${author.surname} ${author.name}${author.patronymic ? ' ' + author.patronymic : ''}`.trim();
    };

    const handleCardClick = (id) => {
        navigate(`/books/${id}`);
    };

    return (
        <Box>
            <AppBar position="static" sx={{ backgroundColor: '#8B4513', mb: 4 }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Библиотека - Избранное
                    </Typography>
                    <Button color="inherit" component={Link} to="/">
                        Главная
                    </Button>
                    <Button color="inherit" component={Link} to="/books">
                        Книги
                    </Button>
                    <Button color="inherit" component={Link} to="/authors">
                        Авторы
                    </Button>
                    {isAdmin && (
                        <Button color="inherit" component={Link} to="/admin">
                            Админ панель
                        </Button>
                    )}
                    <Button color="inherit" onClick={logout}>
                        Выйти ({user?.username})
                    </Button>
                </Toolbar>
            </AppBar>

            <Box sx={{ p: 4, backgroundColor: '#E0E0E0', minHeight: '100vh' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ color: '#8B4513' }}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Favorite sx={{ color: 'error.main', fontSize: 40 }} />
                        Мои избранные книги
                    </Typography>
                </Box>

                {favorites.length > 0 ? (
                    <Grid container spacing={3}>
                        {favorites.map((book) => (
                            <Grid item xs={12} sm={6} md={4} key={book.id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #d4a373',
                                        position: 'relative',
                                        transition: 'transform 0.2s',
                                        '&:hover': {
                                            transform: 'scale(1.02)',
                                            boxShadow: 3
                                        }
                                    }}
                                >
                                    <CardActionArea onClick={() => handleCardClick(book.id)}>
                                        <CardMedia
                                            component="img"
                                            height="140"
                                            image={book.imageUrl || 'https://via.placeholder.com/140'}
                                            alt={book.title}
                                            sx={{ objectFit: 'cover' }}
                                        />
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom color="primary.main">
                                                {book.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Авторы:{' '}
                                                {book.authors && Array.isArray(book.authors) && book.authors.length > 0
                                                    ? book.authors.map((author) => getFullName(author)).join(', ')
                                                    : 'Неизвестный автор'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Жанр: {book.genre || 'Не указано'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Дата публикации: {book.publishDate || 'Не указано'}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>

                                    {/* Кнопка избранного */}
                                    <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                                        <FavoriteButton
                                            book={book}
                                            size="large"
                                            sx={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                                }
                                            }}
                                        />
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Box sx={{ textAlign: 'center', mt: 8 }}>
                        <Favorite sx={{ fontSize: 80, color: 'action.disabled', mb: 2 }} />
                        <Typography variant="h5" color="text.secondary" gutterBottom>
                            У вас пока нет избранных книг
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                            Добавляйте книги в избранное, нажимая на сердечко
                        </Typography>
                        <Button
                            variant="contained"
                            component={Link}
                            to="/books"
                            sx={{ backgroundColor: '#8B4513' }}
                        >
                            Перейти к книгам
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default FavoritesList;