import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardMedia,
    CardActionArea,
    Grid,
    IconButton,
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
import { Edit, Delete } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext'; // Добавь импорт
import FavoriteButton from './FavoriteButton';

const BooksList = () => {
    const { user, isAdmin, logout } = useAuth();
    const { favorites } = useFavorites(); // Добавь для счетчика
    const [books, setBooks] = useState([]);
    const [allBooks, setAllBooks] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [displayedBooks, setDisplayedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [currentBook, setCurrentBook] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const booksPerPage = 6;
    const [newBook, setNewBook] = useState({
        title: '',
        genre: '',
        publishDate: '',
        pages: 0,
        publisher: '',
        description: '',
        language: '',
        imageUrl: '',
        readUrl: '',
        authorIds: [],
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const startIndex = (page - 1) * booksPerPage;
        const paginatedBooks = books.slice(startIndex, startIndex + booksPerPage);
        setDisplayedBooks(paginatedBooks);
        setTotalPages(Math.ceil(books.length / booksPerPage));
    }, [page, books]);

    const fetchData = async () => {
        try {
            const booksResponse = await axios.get('http://localhost:8080/api/books');
            const validBooks = booksResponse.data.filter(
                (book) => book && typeof book === 'object' && book.id && book.title
            );
            setAllBooks(validBooks);
            setBooks(validBooks);
            setTotalPages(Math.ceil(validBooks.length / booksPerPage));

            const authorsResponse = await axios.get('http://localhost:8080/api/authors');
            const validAuthors = authorsResponse.data.filter(
                (author) => author && typeof author === 'object' && author.id && author.name && author.surname
            );
            setAuthors(validAuthors);

            setLoading(false);
        } catch (error) {
            console.error('Ошибка получения данных:', error);
            setLoading(false);
            setSnackbar({ open: true, message: 'Ошибка получения данных', severity: 'error' });
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setBooks(allBooks);
            setPage(1);
            return;
        }
        try {
            const response = await axios.get(`http://localhost:8080/api/books/by-title?title=${encodeURIComponent(searchQuery.trim())}`);
            const validBooks = response.data.filter(
                (book) => book && typeof book === 'object' && book.id && book.title
            );
            setBooks(validBooks);
            setPage(1);
        } catch (error) {
            console.error('Ошибка поиска:', error);
            setBooks([]);
            setSnackbar({ open: true, message: 'Ошибка поиска книг', severity: 'error' });
        }
    };

    const handleClear = () => {
        setSearchQuery('');
        setBooks(allBooks);
        setPage(1);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const getFullName = (author) => {
        if (!author || typeof author !== 'object' || !author.name || !author.surname) {
            return 'Неизвестный автор';
        }
        return `${author.surname} ${author.name}${author.patronymic ? ' ' + author.patronymic : ''}`.trim();
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
            setOpenAddDialog(false);
            setNewBook({
                title: '',
                genre: '',
                publishDate: '',
                pages: 0,
                publisher: '',
                description: '',
                language: '',
                imageUrl: '',
                readUrl: '',
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
            setOpenEditDialog(false);
            setNewBook({
                title: '',
                genre: '',
                publishDate: '',
                pages: 0,
                publisher: '',
                description: '',
                language: '',
                imageUrl: '',
                readUrl: '',
                authorIds: [],
            });
            fetchData();
        } catch (error) {
            setSnackbar({ open: true, message: `Ошибка обновления книги: ${error.response?.data?.message || error.message}`, severity: 'error' });
        }
    };

    const handleDeleteBook = async (bookId) => {
        if (window.confirm('Вы уверены, что хотите удалить эту книгу?')) {
            try {
                await axios.delete(`http://localhost:8080/api/books/${bookId}`);
                setSnackbar({ open: true, message: 'Книга успешно удалена!', severity: 'success' });
                fetchData();
            } catch (error) {
                setSnackbar({ open: true, message: 'Ошибка удаления книги', severity: 'error' });
            }
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

    const handleCardClick = (id) => {
        navigate(`/books/${id}`);
    };

    if (loading) {
        return <div>Загрузка...</div>;
    }

    return (
        <Box>
            <AppBar position="static" sx={{ backgroundColor: '#8B4513', mb: 4 }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Библиотека - Книги
                    </Typography>
                    <Button color="inherit" component={Link} to="/">
                        Главная
                    </Button>
                    <Button color="inherit" component={Link} to="/authors">
                        Авторы
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
                    Все книги
                </Typography>

                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <TextField
                        label="Поиск по названию книги"
                        variant="outlined"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ width: { xs: '100%', sm: '50%', md: '40%' } }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSearch}
                        sx={{ backgroundColor: '#8B4513', color: '#fff' }}
                    >
                        Найти
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleClear}
                        sx={{ borderColor: '#8B4513', color: '#8B4513' }}
                    >
                        Очистить
                    </Button>
                </Box>

                {/* Кнопка добавления книги - только для админа */}
                {isAdmin && (
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setOpenAddDialog(true)}
                            sx={{ backgroundColor: '#8B4513', color: '#fff' }}
                        >
                            Добавить новую книгу
                        </Button>
                    </Box>
                )}

                {displayedBooks.length > 0 ? (
                    <Grid container spacing={2} sx={{ width: '100%', maxWidth: '100%', mx: 0 }}>
                        {displayedBooks.map((book) => (
                            <Grid item xs={12} sm={6} md={4} key={book.id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        width: '100%',
                                        maxWidth: '100%',
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
                                            <Typography
                                                variant="h6"
                                                gutterBottom
                                                color="primary.main"
                                                sx={{ textDecoration: 'none' }}
                                            >
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
                                            <Typography variant="body2" color="text.secondary">
                                                Издатель: {book.publisher || 'Не указано'}
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

                                    {/* Иконки редактирования/удаления - только для админа */}
                                    {isAdmin && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                left: 8,
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
                                                        readUrl: book.readUrl || '',
                                                        authorIds: book.authors ? book.authors.map((a) => a.id) : [],
                                                    });
                                                    setOpenEditDialog(true);
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
                    <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
                        Книги не найдены.
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
                        <Dialog
                            open={openAddDialog}
                            onClose={() => setOpenAddDialog(false)}
                            sx={{ '& .MuiDialog-paper': { width: '100%', maxWidth: '500px' } }}
                        >
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
                                <TextField
                                    margin="dense"
                                    label="Ссылка для чтения"
                                    fullWidth
                                    value={newBook.readUrl}
                                    onChange={(e) => setNewBook({ ...newBook, readUrl: e.target.value })}
                                    placeholder="https://example.com/read-book"
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
                                <Button onClick={() => setOpenAddDialog(false)}>Отмена</Button>
                                <Button onClick={handleAddBook} color="primary">
                                    Добавить
                                </Button>
                            </DialogActions>
                        </Dialog>

                        <Dialog
                            open={openEditDialog}
                            onClose={() => setOpenEditDialog(false)}
                            sx={{ '& .MuiDialog-paper': { width: '100%', maxWidth: '500px' } }}
                        >
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
                                <TextField
                                    margin="dense"
                                    label="Ссылка для чтения"
                                    fullWidth
                                    value={newBook.readUrl}
                                    onChange={(e) => setNewBook({ ...newBook, readUrl: e.target.value })}
                                    placeholder="https://example.com/read-book"
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
                                <Button onClick={() => setOpenEditDialog(false)}>Отмена</Button>
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

export default BooksList;