import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardMedia,
    CardActionArea,
    Grid,
    Collapse,
    IconButton,
    Chip,
    Rating,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Snackbar,
    Alert,
    Pagination,
    FormControl,
    FormGroup,
    FormControlLabel,
    Checkbox,
    AppBar,
    Toolbar
} from '@mui/material';
import { ExpandMore, ExpandLess, Edit, Delete, Circle } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext'; // Добавь импорт

const AuthorsList = () => {
    const { user, isAdmin, logout } = useAuth();
    const { favorites } = useFavorites(); // Добавь для счетчика
    const [authors, setAuthors] = useState([]);
    const [filteredAuthors, setFilteredAuthors] = useState([]);
    const [displayedAuthors, setDisplayedAuthors] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({});
    const [openAddAuthorDialog, setOpenAddAuthorDialog] = useState(false);
    const [openEditAuthorDialog, setOpenEditAuthorDialog] = useState(false);
    const [openAddBookDialog, setOpenAddBookDialog] = useState(false);
    const [openEditBookDialog, setOpenEditBookDialog] = useState(false);
    const [currentAuthor, setCurrentAuthor] = useState(null);
    const [currentBook, setCurrentBook] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const authorsPerPage = 5;
    const [newAuthor, setNewAuthor] = useState({
        name: '',
        surname: '',
        patronymic: '',
        genreSpecialization: '',
        biography: '',
        birthDate: '',
        deathDate: '',
        rating: 0,
    });
    const [newBook, setNewBook] = useState({
        title: '',
        genre: '',
        publishDate: '',
        pages: 0,
        publisher: '',
        description: '',
        language: '',
        imageUrl: '',
        authorIds: [],
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const filtered = authors.filter((author) =>
            author && typeof author === 'object' && author.name && author.surname
                ? `${author.surname} ${author.name}${author.patronymic ? ' ' + author.patronymic : ''}`
                    .toLowerCase()
                    .includes(searchQuery.trim().toLowerCase())
                : false
        );
        setFilteredAuthors(filtered);
        setTotalPages(Math.ceil(filtered.length / authorsPerPage));
        setPage(1);
    }, [searchQuery, authors]);

    useEffect(() => {
        const startIndex = (page - 1) * authorsPerPage;
        const paginatedAuthors = filteredAuthors.slice(startIndex, startIndex + authorsPerPage);
        setDisplayedAuthors(paginatedAuthors);
    }, [page, filteredAuthors]);

    const fetchData = async () => {
        try {
            const authorsResponse = await axios.get('http://localhost:8080/api/authors');
            const allAuthors = authorsResponse.data.filter(
                (author) => author && typeof author === 'object' && author.id && author.name && author.surname
            );
            setAuthors(allAuthors);
            setFilteredAuthors(allAuthors);

            const booksResponse = await axios.get('http://localhost:8080/api/books');
            const allBooks = booksResponse.data.filter(
                (book) => book && typeof book === 'object' && book.id && book.title
            );
            setBooks(allBooks);

            setLoading(false);
        } catch (error) {
            console.error('Ошибка получения данных:', error);
            setLoading(false);
            setSnackbar({ open: true, message: 'Ошибка получения данных', severity: 'error' });
        }
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleExpandClick = (authorId) => {
        setExpanded((prev) => ({
            ...prev,
            [authorId]: !prev[authorId],
        }));
    };

    const getBooksByAuthor = (authorId) => {
        return books.filter(
            (book) =>
                book.authors &&
                Array.isArray(book.authors) &&
                book.authors.some((author) => author && author.id === authorId)
        );
    };

    const getFullName = (author) => {
        if (!author || typeof author !== 'object' || !author.name || !author.surname) {
            return 'Неизвестный автор';
        }
        return `${author.surname} ${author.name}${author.patronymic ? ' ' + author.patronymic : ''}`.trim();
    };

    const isDeceased = (author) => {
        return !!author?.deathDate;
    };

    const handleAddAuthor = async () => {
        if (!newAuthor.name || !newAuthor.surname || !newAuthor.birthDate) {
            setSnackbar({ open: true, message: 'Имя, фамилия и дата рождения обязательны!', severity: 'error' });
            return;
        }
        try {
            await axios.post('http://localhost:8080/api/authors', newAuthor);
            setSnackbar({ open: true, message: 'Автор успешно добавлен!', severity: 'success' });
            setOpenAddAuthorDialog(false);
            setNewAuthor({
                name: '',
                surname: '',
                patronymic: '',
                genreSpecialization: '',
                biography: '',
                birthDate: '',
                deathDate: '',
                rating: 0,
            });
            fetchData();
        } catch (error) {
            setSnackbar({ open: true, message: `Ошибка добавления автора: ${error.response?.data?.message || error.message}`, severity: 'error' });
        }
    };

    const handleEditAuthor = async () => {
        if (!newAuthor.name || !newAuthor.surname || !newAuthor.birthDate) {
            setSnackbar({ open: true, message: 'Имя, фамилия и дата рождения обязательны!', severity: 'error' });
            return;
        }
        try {
            await axios.put(`http://localhost:8080/api/authors/${currentAuthor.id}`, newAuthor);
            setSnackbar({ open: true, message: 'Автор успешно обновлён!', severity: 'success' });
            setOpenEditAuthorDialog(false);
            fetchData();
        } catch (error) {
            setSnackbar({ open: true, message: `Ошибка обновления автора: ${error.response?.data?.message || error.message}`, severity: 'error' });
        }
    };

    const handleDeleteAuthor = async (authorId) => {
        try {
            await axios.delete(`http://localhost:8080/api/authors/${authorId}`);
            setSnackbar({ open: true, message: 'Автор успешно удалён!', severity: 'success' });
            fetchData();
        } catch (error) {
            setSnackbar({ open: true, message: 'Ошибка удаления автора', severity: 'error' });
        }
    };

    const handleAddBook = async () => {
        if (!newBook.title || !newBook.genre || !newBook.publishDate || !newBook.publisher || newBook.authorIds.length === 0) {
            setSnackbar({ open: true, message: 'Название, жанр, дата публикации, издатель и хотя бы один автор обязательны!', severity: 'error' });
            return;
        }
        try {
            const bookToAdd = {
                ...newBook,
                authorIds: newBook.authorIds,
            };
            await axios.post('http://localhost:8080/api/books', bookToAdd);
            setSnackbar({ open: true, message: 'Книга успешно добавлена!', severity: 'success' });
            setOpenAddBookDialog(false);
            setNewBook({
                title: '',
                genre: '',
                publishDate: '',
                pages: 0,
                publisher: '',
                description: '',
                language: '',
                imageUrl: '',
                authorIds: [],
            });
            fetchData();
        } catch (error) {
            setSnackbar({ open: true, message: `Ошибка добавления книги: ${error.response?.data?.message || error.message}`, severity: 'error' });
        }
    };

    const handleEditBook = async () => {
        if (!newBook.title || !newBook.genre || !newBook.publishDate || !newBook.publisher || newBook.authorIds.length === 0) {
            setSnackbar({ open: true, message: 'Название, жанр, дата публикации, издатель и хотя бы один автор обязательны!', severity: 'error' });
            return;
        }
        try {
            const bookToUpdate = {
                ...newBook,
                authorIds: newBook.authorIds,
            };
            await axios.put(`http://localhost:8080/api/books/${currentBook.id}`, bookToUpdate);
            setSnackbar({ open: true, message: 'Книга успешно обновлена!', severity: 'success' });
            setOpenEditBookDialog(false);
            setNewBook({
                title: '',
                genre: '',
                publishDate: '',
                pages: 0,
                publisher: '',
                description: '',
                language: '',
                imageUrl: '',
                authorIds: [],
            });
            fetchData();
        } catch (error) {
            setSnackbar({ open: true, message: `Ошибка обновления книги: ${error.response?.data?.message || error.message}`, severity: 'error' });
        }
    };

    const handleDeleteBook = async (bookId) => {
        try {
            await axios.delete(`http://localhost:8080/api/books/${bookId}`);
            setSnackbar({ open: true, message: 'Книга успешно удалена!', severity: 'success' });
            fetchData();
        } catch (error) {
            setSnackbar({ open: true, message: 'Ошибка удаления книги', severity: 'error' });
        }
    };

    const handleAuthorCheckboxChange = (authorId) => {
        setNewBook((prev) => {
            const newAuthorIds = prev.authorIds.includes(authorId)
                ? prev.authorIds.filter((id) => id !== authorId)
                : [...prev.authorIds, authorId];
            return { ...prev, authorIds: newAuthorIds };
        });
    };

    const handleCardClick = (bookId) => {
        navigate(`/books/${bookId}`);
    };

    const handleClear = () => {
        setSearchQuery('');
    };

    if (loading) {
        return <div>Загрузка...</div>;
    }

    return (
        <Box>
            <AppBar position="static" sx={{ backgroundColor: '#8B4513', mb: 4 }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Библиотека - Авторы
                    </Typography>
                    <Button color="inherit" component={Link} to="/">
                        Главная
                    </Button>
                    <Button color="inherit" component={Link} to="/books">
                        Книги
                    </Button>
                    {/* Кнопка Избранное с счетчиком */}
                    <Button color="inherit" component={Link} to="/favorites">
                        Избранное
                        {favorites.length > 0 && (
                            <Box
                                component="span"
                                sx={{
                                    ml: 1,
                                    bgcolor: 'error.main',
                                    borderRadius: '50%',
                                    width: 20,
                                    height: 20,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem'
                                }}
                            >
                                {favorites.length}
                            </Box>
                        )}
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

            <Box
                sx={{
                    py: 4,
                    backgroundColor: '#E0E0E0',
                    width: '100%',
                    maxWidth: '100vw',
                    overflowX: 'hidden',
                    boxSizing: 'border-box',
                    px: { xs: 0, sm: 1, md: 2 },
                    margin: 0,
                }}
            >
                <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
                    Все авторы
                </Typography>

                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <TextField
                        label="Поиск по имени автора"
                        variant="outlined"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ width: { xs: '100%', sm: '50%', md: '40%' } }}
                    />
                    <Button
                        variant="outlined"
                        onClick={handleClear}
                        sx={{ borderColor: '#8B4513', color: '#8B4513' }}
                    >
                        Очистить
                    </Button>
                </Box>

                {/* Кнопка добавления автора - только для админа */}
                {isAdmin && (
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setOpenAddAuthorDialog(true)}
                            sx={{ backgroundColor: '#8B4513', color: '#fff' }}
                        >
                            Добавить нового автора
                        </Button>
                    </Box>
                )}

                {displayedAuthors.length > 0 ? (
                    displayedAuthors.map((author) => {
                        const authorBooks = getBooksByAuthor(author.id);
                        return (
                            <Card
                                key={author.id}
                                sx={{
                                    mb: 4,
                                    boxShadow: 3,
                                    borderRadius: 2,
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    border: '1px solid #d4a373',
                                    mx: 0,
                                    width: '100%',
                                    maxWidth: '100%',
                                }}
                            >
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Box display="flex" alignItems="center">
                                                <Typography variant="h5" gutterBottom color="primary.main">
                                                    {getFullName(author)}
                                                </Typography>
                                                <Circle
                                                    sx={{
                                                        ml: 1,
                                                        fontSize: 12,
                                                        color: isDeceased(author) ? 'error.main' : 'success.main',
                                                    }}
                                                />
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Специализация по жанрам: {author.genreSpecialization || 'Не указано'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Биография: {author.biography || 'Не указано'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                Дата рождения: {author.birthDate || 'Не указано'} | Дата смерти: {author.deathDate || 'Нет данных'}
                                            </Typography>
                                            <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                                                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                                    Рейтинг:
                                                </Typography>
                                                <Rating value={author.rating || 0} precision={0.1} readOnly />
                                                <Typography variant="body2" sx={{ ml: 1 }}>
                                                    ({author.rating || 0})
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Иконки для админа */}
                                        {isAdmin && (
                                            <Box>
                                                <IconButton
                                                    onClick={() => {
                                                        setCurrentAuthor(author);
                                                        setNewAuthor(author);
                                                        setOpenEditAuthorDialog(true);
                                                    }}
                                                    sx={{ color: 'primary.main' }}
                                                >
                                                    <Edit />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleDeleteAuthor(author.id)}
                                                    sx={{ color: 'error.main' }}
                                                >
                                                    <Delete />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleExpandClick(author.id)}
                                                    sx={{ color: 'secondary.main' }}
                                                >
                                                    {expanded[author.id] ? <ExpandLess /> : <ExpandMore />}
                                                </IconButton>
                                            </Box>
                                        )}

                                        {/* Для обычных пользователей только кнопка развернуть */}
                                        {!isAdmin && (
                                            <IconButton
                                                onClick={() => handleExpandClick(author.id)}
                                                sx={{ color: 'secondary.main' }}
                                            >
                                                {expanded[author.id] ? <ExpandLess /> : <ExpandMore />}
                                            </IconButton>
                                        )}
                                    </Box>

                                    <Collapse in={expanded[author.id]} timeout="auto" unmountOnExit>
                                        <Box sx={{ mt: 2 }}>
                                            {/* Кнопка добавления книги - только для админа */}
                                            {isAdmin && (
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={() => {
                                                        setNewBook({ ...newBook, authorIds: [author.id] });
                                                        setOpenAddBookDialog(true);
                                                    }}
                                                    sx={{ mb: 2, borderColor: '#8B4513', color: '#8B4513' }}
                                                >
                                                    Добавить книгу
                                                </Button>
                                            )}

                                            {authorBooks.length > 0 ? (
                                                <Grid container spacing={2} sx={{ width: '100%', maxWidth: '100%', mx: 0 }}>
                                                    {authorBooks.map((book) => (
                                                        <Grid item xs={12} sm={6} md={4} key={book.id}>
                                                            <Card
                                                                sx={{
                                                                    height: '100%',
                                                                    width: '100%',
                                                                    maxWidth: '100%',
                                                                    '&:hover': { boxShadow: 6, transform: 'scale(1.02)' },
                                                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                                    border: '1px solid #d4a373',
                                                                    mx: 0,
                                                                    position: 'relative',
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
                                                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                                                            <Typography
                                                                                variant="h6"
                                                                                gutterBottom
                                                                                color="primary.main"
                                                                                sx={{ textDecoration: 'none' }}
                                                                            >
                                                                                {book.title}
                                                                            </Typography>
                                                                        </Box>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            Жанр: {book.genre}
                                                                        </Typography>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            Дата публикации: {book.publishDate}
                                                                        </Typography>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            Издатель: {book.publisher}
                                                                        </Typography>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            Страницы: {book.pages}
                                                                        </Typography>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            Авторы: {book.authors && Array.isArray(book.authors)
                                                                            ? book.authors.map((author) => getFullName(author)).join(', ')
                                                                            : 'Неизвестный автор'}
                                                                        </Typography>
                                                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                                            {book.description}
                                                                        </Typography>
                                                                        <Chip
                                                                            label={book.language}
                                                                            size="small"
                                                                            sx={{ mt: 1, bgcolor: 'secondary.main', color: 'white' }}
                                                                        />
                                                                    </CardContent>
                                                                </CardActionArea>

                                                                {/* Иконки редактирования/удаления книги - только для админа */}
                                                                {isAdmin && (
                                                                    <Box
                                                                        sx={{
                                                                            position: 'absolute',
                                                                            top: 8,
                                                                            right: 8,
                                                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                                            borderRadius: 1,
                                                                            display: 'flex',
                                                                            gap: 0.5,
                                                                            padding: '2px',
                                                                        }}
                                                                    >
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setCurrentBook(book);
                                                                                setNewBook({
                                                                                    title: book.title,
                                                                                    genre: book.genre,
                                                                                    publishDate: book.publishDate,
                                                                                    pages: book.pages,
                                                                                    publisher: book.publisher,
                                                                                    description: book.description,
                                                                                    language: book.language,
                                                                                    imageUrl: book.imageUrl,
                                                                                    authorIds: book.authors.map((a) => a.id),
                                                                                });
                                                                                setOpenEditBookDialog(true);
                                                                            }}
                                                                            sx={{ color: 'primary.main' }}
                                                                        >
                                                                            <Edit fontSize="small" />
                                                                        </IconButton>
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDeleteBook(book.id);
                                                                            }}
                                                                            sx={{ color: 'error.main' }}
                                                                        >
                                                                            <Delete fontSize="small" />
                                                                        </IconButton>
                                                                    </Box>
                                                                )}
                                                            </Card>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            ) : (
                                                <Typography variant="body1" sx={{ mt: 2 }}>
                                                    Книги отсутствуют
                                                </Typography>
                                            )}
                                        </Box>
                                    </Collapse>
                                </CardContent>
                            </Card>
                        );
                    })
                ) : (
                    <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
                        Авторы не найдены.
                    </Typography>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                    />
                </Box>

                {/* Диалоги для админа */}
                {isAdmin && (
                    <>
                        {/* Диалог добавления автора */}
                        <Dialog open={openAddAuthorDialog} onClose={() => setOpenAddAuthorDialog(false)}>
                            <DialogTitle>Добавить нового автора</DialogTitle>
                            <DialogContent>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    label="Имя"
                                    fullWidth
                                    value={newAuthor.name}
                                    onChange={(e) => setNewAuthor({ ...newAuthor, name: e.target.value })}
                                    required
                                />
                                <TextField
                                    margin="dense"
                                    label="Фамилия"
                                    fullWidth
                                    value={newAuthor.surname}
                                    onChange={(e) => setNewAuthor({ ...newAuthor, surname: e.target.value })}
                                    required
                                />
                                <TextField
                                    margin="dense"
                                    label="Отчество"
                                    fullWidth
                                    value={newAuthor.patronymic}
                                    onChange={(e) => setNewAuthor({ ...newAuthor, patronymic: e.target.value })}
                                />
                                <TextField
                                    margin="dense"
                                    label="Специализация по жанрам"
                                    fullWidth
                                    value={newAuthor.genreSpecialization}
                                    onChange={(e) => setNewAuthor({ ...newAuthor, genreSpecialization: e.target.value })}
                                />
                                <TextField
                                    margin="dense"
                                    label="Биография"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={newAuthor.biography}
                                    onChange={(e) => setNewAuthor({ ...newAuthor, biography: e.target.value })}
                                />
                                <TextField
                                    margin="dense"
                                    label="Дата рождения"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={newAuthor.birthDate}
                                    onChange={(e) => setNewAuthor({ ...newAuthor, birthDate: e.target.value })}
                                    required
                                />
                                <TextField
                                    margin="dense"
                                    label="Дата смерти"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={newAuthor.deathDate}
                                    onChange={(e) => setNewAuthor({ ...newAuthor, deathDate: e.target.value })}
                                />
                                <TextField
                                    margin="dense"
                                    label="Рейтинг"
                                    type="number"
                                    fullWidth
                                    value={newAuthor.rating}
                                    onChange={(e) => setNewAuthor({ ...newAuthor, rating: parseFloat(e.target.value) })}
                                    inputProps={{ min: 0, max: 5, step: 0.1 }}
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setOpenAddAuthorDialog(false)}>Отмена</Button>
                                <Button onClick={handleAddAuthor} color="primary">
                                    Добавить
                                </Button>
                            </DialogActions>
                        </Dialog>

                        {/* Диалог редактирования автора */}
                        <Dialog open={openEditAuthorDialog} onClose={() => setOpenEditAuthorDialog(false)}>
                            <DialogTitle>Редактировать автора</DialogTitle>
                            <DialogContent>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    label="Имя"
                                    fullWidth
                                    value={newAuthor.name}
                                    onChange={(e) => setNewAuthor({ ...newAuthor, name: e.target.value })}
                                    required
                                />
                                <TextField
                                    margin="dense"
                                    label="Фамилия"
                                    fullWidth
                                    value={newAuthor.surname}
                                    onChange={(e) => setNewAuthor({ ...newAuthor, surname: e.target.value })}
                                    required
                                />
                                <TextField
                                    margin="dense"
                                    label="Отчество"
                                    fullWidth
                                    value={newAuthor.patronymic}
                                    onChange={(e) => setNewAuthor({ ...newAuthor, patronymic: e.target.value })}
                                />
                                <TextField
                                    margin="dense"
                                    label="Специализация по жанрам"
                                    fullWidth
                                    value={newAuthor.genreSpecialization}
                                    onChange={(e) => setNewAuthor({ ...newAuthor, genreSpecialization: e.target.value })}
                                />
                                <TextField
                                    margin="dense"
                                    label="Биография"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={newAuthor.biography}
                                    onChange={(e) => setNewAuthor({ ...newAuthor, biography: e.target.value })}
                                />
                                <TextField
                                    margin="dense"
                                    label="Дата рождения"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={newAuthor.birthDate}
                                    onChange={(e) => setNewAuthor({ ...newAuthor, birthDate: e.target.value })}
                                    required
                                />
                                <TextField
                                    margin="dense"
                                    label="Дата смерти"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={newAuthor.deathDate}
                                    onChange={(e) => setNewAuthor({ ...newAuthor, deathDate: e.target.value })}
                                />
                                <TextField
                                    margin="dense"
                                    label="Рейтинг"
                                    type="number"
                                    fullWidth
                                    value={newAuthor.rating}
                                    onChange={(e) => setNewAuthor({ ...newAuthor, rating: parseFloat(e.target.value) })}
                                    inputProps={{ min: 0, max: 5, step: 0.1 }}
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setOpenEditAuthorDialog(false)}>Отмена</Button>
                                <Button onClick={handleEditAuthor} color="primary">
                                    Сохранить
                                </Button>
                            </DialogActions>
                        </Dialog>

                        {/* Диалог добавления книги */}
                        <Dialog open={openAddBookDialog} onClose={() => setOpenAddBookDialog(false)}>
                            <DialogTitle>Добавить новую книгу</DialogTitle>
                            <DialogContent>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    label="Название"
                                    fullWidth
                                    value={newBook.title}
                                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                                    required
                                />
                                <TextField
                                    margin="dense"
                                    label="Жанр"
                                    fullWidth
                                    value={newBook.genre}
                                    onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
                                    required
                                />
                                <TextField
                                    margin="dense"
                                    label="Дата публикации"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={newBook.publishDate}
                                    onChange={(e) => setNewBook({ ...newBook, publishDate: e.target.value })}
                                    required
                                />
                                <TextField
                                    margin="dense"
                                    label="Количество страниц"
                                    type="number"
                                    fullWidth
                                    value={newBook.pages}
                                    onChange={(e) => setNewBook({ ...newBook, pages: parseInt(e.target.value) })}
                                    inputProps={{ min: 1 }}
                                />
                                <TextField
                                    margin="dense"
                                    label="Издатель"
                                    fullWidth
                                    value={newBook.publisher}
                                    onChange={(e) => setNewBook({ ...newBook, publisher: e.target.value })}
                                    required
                                />
                                <TextField
                                    margin="dense"
                                    label="Описание"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={newBook.description}
                                    onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                                />
                                <TextField
                                    margin="dense"
                                    label="Язык"
                                    fullWidth
                                    value={newBook.language}
                                    onChange={(e) => setNewBook({ ...newBook, language: e.target.value })}
                                />
                                <TextField
                                    margin="dense"
                                    label="URL изображения"
                                    fullWidth
                                    value={newBook.imageUrl}
                                    onChange={(e) => setNewBook({ ...newBook, imageUrl: e.target.value })}
                                />
                                <FormControl component="fieldset" fullWidth margin="dense" required>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Выберите авторов
                                    </Typography>
                                    <Box sx={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ccc', borderRadius: '4px', p: 1 }}>
                                        <FormGroup>
                                            {authors.length > 0 ? (
                                                authors.map((author) => (
                                                    <FormControlLabel
                                                        key={author.id}
                                                        control={
                                                            <Checkbox
                                                                checked={newBook.authorIds.includes(author.id)}
                                                                onChange={() => handleAuthorCheckboxChange(author.id)}
                                                                color="primary"
                                                            />
                                                        }
                                                        label={getFullName(author)}
                                                    />
                                                ))
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Авторы отсутствуют
                                                </Typography>
                                            )}
                                        </FormGroup>
                                    </Box>
                                </FormControl>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setOpenAddBookDialog(false)}>Отмена</Button>
                                <Button onClick={handleAddBook} color="primary">
                                    Добавить
                                </Button>
                            </DialogActions>
                        </Dialog>

                        {/* Диалог редактирования книги */}
                        <Dialog open={openEditBookDialog} onClose={() => setOpenEditBookDialog(false)}>
                            <DialogTitle>Редактировать книгу</DialogTitle>
                            <DialogContent>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    label="Название"
                                    fullWidth
                                    value={newBook.title}
                                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                                    required
                                />
                                <TextField
                                    margin="dense"
                                    label="Жанр"
                                    fullWidth
                                    value={newBook.genre}
                                    onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
                                    required
                                />
                                <TextField
                                    margin="dense"
                                    label="Дата публикации"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={newBook.publishDate}
                                    onChange={(e) => setNewBook({ ...newBook, publishDate: e.target.value })}
                                    required
                                />
                                <TextField
                                    margin="dense"
                                    label="Количество страниц"
                                    type="number"
                                    fullWidth
                                    value={newBook.pages}
                                    onChange={(e) => setNewBook({ ...newBook, pages: parseInt(e.target.value) })}
                                    inputProps={{ min: 1 }}
                                />
                                <TextField
                                    margin="dense"
                                    label="Издатель"
                                    fullWidth
                                    value={newBook.publisher}
                                    onChange={(e) => setNewBook({ ...newBook, publisher: e.target.value })}
                                    required
                                />
                                <TextField
                                    margin="dense"
                                    label="Описание"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={newBook.description}
                                    onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                                />
                                <TextField
                                    margin="dense"
                                    label="Язык"
                                    fullWidth
                                    value={newBook.language}
                                    onChange={(e) => setNewBook({ ...newBook, language: e.target.value })}
                                />
                                <TextField
                                    margin="dense"
                                    label="URL изображения"
                                    fullWidth
                                    value={newBook.imageUrl}
                                    onChange={(e) => setNewBook({ ...newBook, imageUrl: e.target.value })}
                                />
                                <FormControl component="fieldset" fullWidth margin="dense" required>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Выберите авторов
                                    </Typography>
                                    <Box sx={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ccc', borderRadius: '4px', p: 1 }}>
                                        <FormGroup>
                                            {authors.length > 0 ? (
                                                authors.map((author) => (
                                                    <FormControlLabel
                                                        key={author.id}
                                                        control={
                                                            <Checkbox
                                                                checked={newBook.authorIds.includes(author.id)}
                                                                onChange={() => handleAuthorCheckboxChange(author.id)}
                                                                color="primary"
                                                            />
                                                        }
                                                        label={getFullName(author)}
                                                    />
                                                ))
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Авторы отсутствуют
                                                </Typography>
                                            )}
                                        </FormGroup>
                                    </Box>
                                </FormControl>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setOpenEditBookDialog(false)}>Отмена</Button>
                                <Button onClick={handleEditBook} color="primary">
                                    Сохранить
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </>
                )}

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    <Alert
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                        severity={snackbar.severity}
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    );
};

export default AuthorsList;