import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardMedia,
    CardActionArea,
    Grid,
    TextField,
    Button,
    Pagination,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
    const [allBooks, setAllBooks] = useState([]);
    const [books, setBooks] = useState([]);
    const [displayedBooks, setDisplayedBooks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('author'); // 'author' или 'title'
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const booksPerPage = 6;
    const navigate = useNavigate();

    useEffect(() => {
        fetchBooks();
    }, []);

    useEffect(() => {
        const startIndex = (page - 1) * booksPerPage;
        const paginatedBooks = books.slice(startIndex, startIndex + booksPerPage);
        setDisplayedBooks(paginatedBooks);
        setTotalPages(Math.ceil(books.length / booksPerPage));
    }, [page, books]);

    const fetchBooks = async () => {
        try {
            const response = await axios.get('http://localhost:228/api/books');
            const validBooks = response.data.filter(
                (book) => book && typeof book === 'object' && book.id && book.title
            );
            setAllBooks(validBooks);
            setBooks(validBooks);
            setDisplayedBooks(validBooks.slice(0, booksPerPage));
            setTotalPages(Math.ceil(validBooks.length / booksPerPage));
        } catch (error) {
            console.error('Ошибка получения книг:', error);
            setAllBooks([]);
            setBooks([]);
            setDisplayedBooks([]);
        }
    };

    const getFullName = (author) => {
        if (!author || typeof author !== 'object' || !author.name || !author.surname) {
            return 'Неизвестный автор';
        }
        return `${author.surname} ${author.name}${author.patronymic ? ' ' + author.patronymic : ''}`.trim();
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setBooks(allBooks);
            setPage(1);
            return;
        }
        const query = searchQuery.trim().toLowerCase();
        try {
            if (searchType === 'author') {
                const filtered = allBooks.filter((book) =>
                    book.authors &&
                    Array.isArray(book.authors) &&
                    book.authors.some((author) =>
                        author && author.name && author.surname
                            ? `${author.surname} ${author.name}${author.patronymic ? ' ' + author.patronymic : ''}`
                                .toLowerCase()
                                .includes(query)
                            : false
                    )
                );
                setBooks(filtered);
            } else {
                const response = await axios.get(`http://localhost:228/api/books/by-title?title=${encodeURIComponent(query)}`);
                const validBooks = response.data.filter(
                    (book) => book && typeof book === 'object' && book.id && book.title
                );
                setBooks(validBooks);
            }
            setPage(1);
        } catch (error) {
            console.error('Ошибка поиска:', error);
            setBooks([]);
        }
    };

    const handleClear = () => {
        setSearchQuery('');
        setBooks(allBooks);
        setPage(1);
    };

    const handleCardClick = (id) => {
        navigate(`/books/${id}`);
    };

    return (
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
            <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <FormControl component="fieldset">
                    <RadioGroup
                        row
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                    >
                        <FormControlLabel value="author" control={<Radio />} label="По автору" />
                        <FormControlLabel value="title" control={<Radio />} label="По названию" />
                    </RadioGroup>
                </FormControl>
                <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', sm: '50%', md: '40%' } }}>
                    <TextField
                        label={searchType === 'author' ? 'Поиск по имени автора' : 'Поиск по названию книги'}
                        variant="outlined"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        fullWidth
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
            </Box>
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
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                />
            </Box>
        </Box>
    );
};

export default Home;