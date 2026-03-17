import React from 'react';
import { Box, Typography, AppBar, Toolbar, Button, Grid, Card, CardContent } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <Box>
            <AppBar position="static" sx={{ backgroundColor: '#8B4513', mb: 4 }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Админ панель
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
                    <Button color="inherit" onClick={logout}>
                        Выйти ({user?.username})
                    </Button>
                </Toolbar>
            </AppBar>

            <Box sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Панель управления
                </Typography>

                <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" gutterBottom>
                                    Управление книгами
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Добавление, редактирование и удаление книг
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/books')}
                                    sx={{ backgroundColor: '#8B4513' }}
                                >
                                    Перейти к книгам
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" gutterBottom>
                                    Управление авторами
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Добавление, редактирование и удаление авторов
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/authors')}
                                    sx={{ backgroundColor: '#8B4513' }}
                                >
                                    Перейти к авторам
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default AdminPanel;