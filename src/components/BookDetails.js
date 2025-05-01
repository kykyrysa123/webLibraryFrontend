import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Typography,
    Button,
    Card,
    CardContent,
    CardMedia,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Snackbar,
    Alert,
    Box,
    Rating,
    Divider,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';

const BookDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openReviewDialog, setOpenReviewDialog] = useState(false);
    const [openEditReviewDialog, setOpenEditReviewDialog] = useState(false);
    const [newReadUrl, setNewReadUrl] = useState('');
    const [newReview, setNewReview] = useState({
        rating: 0,
        reviewText: '',
    });
    const [editReview, setEditReview] = useState({
        id: null,
        rating: 0,
        reviewText: '',
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Заглушка для userId (замените на реальный userId из авторизации)
    const userId = 1; // Предполагаем, что пользователь с id=1 авторизован

    useEffect(() => {
        const fetchBookAndReviews = async () => {
            try {
                const bookResponse = await axios.get(`http://localhost:228/api/books/${id}`);
                setBook(bookResponse.data);
                setNewReadUrl(bookResponse.data.readUrl || '');

                const reviewsResponse = await axios.get(`http://localhost:228/api/reviews?bookId=${id}`);
                console.log('Reviews fetched:', reviewsResponse.data); // Отладка
                setReviews(reviewsResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error); // Отладка
                setSnackbar({ open: true, message: 'Ошибка получения данных', severity: 'error' });
            }
        };
        fetchBookAndReviews();
    }, [id]);

    const getFullName = (author) => {
        if (!author || typeof author !== 'object' || !author.name || !author.surname) {
            return 'Неизвестный автор';
        }
        return `${author.surname} ${author.name}${author.patronymic ? ' ' + author.patronymic : ''}`.trim();
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setNewReadUrl(book?.readUrl || '');
    };

    const handleOpenReviewDialog = () => {
        setOpenReviewDialog(true);
    };

    const handleCloseReviewDialog = () => {
        setOpenReviewDialog(false);
        setNewReview({ rating: 0, reviewText: '' });
    };

    const handleOpenEditReviewDialog = (review) => {
        console.log('Editing review:', review); // Отладка
        setEditReview({
            id: review.id,
            rating: review.rating,
            reviewText: review.reviewText,
        });
        setOpenEditReviewDialog(true);
    };

    const handleCloseEditReviewDialog = () => {
        setOpenEditReviewDialog(false);
        setEditReview({ id: null, rating: 0, reviewText: '' });
    };

    const handleUpdateReadUrl = async () => {
        const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/;
        if (newReadUrl && !urlPattern.test(newReadUrl)) {
            setSnackbar({ open: true, message: 'Неверный формат URL', severity: 'error' });
            return;
        }

        try {
            const updatedBook = {
                title: book.title,
                publisher: book.publisher,
                isbn: book.isbn || '',
                pages: book.pages || 0,
                genre: book.genre,
                publishDate: book.publishDate,
                language: book.language,
                description: book.description || '',
                imageUrl: book.imageUrl || '',
                rating: book.rating || 0,
                authorIds: book.authors ? book.authors.map((a) => a.id) : [],
                readUrl: newReadUrl,
            };
            await axios.put(`http://localhost:228/api/books/${id}`, updatedBook);
            setBook({ ...book, readUrl: newReadUrl });
            setSnackbar({ open: true, message: 'Ссылка для чтения успешно обновлена', severity: 'success' });
            handleCloseDialog();
        } catch (error) {
            setSnackbar({ open: true, message: 'Ошибка обновления ссылки для чтения', severity: 'error' });
        }
    };

    const handleSubmitReview = async () => {
        if (!newReview.rating || newReview.rating < 0 || newReview.rating > 5) {
            setSnackbar({ open: true, message: 'Пожалуйста, выберите рейтинг от 0 до 5', severity: 'error' });
            return;
        }
        if (!newReview.reviewText.trim()) {
            setSnackbar({ open: true, message: 'Текст отзыва не может быть пустым', severity: 'error' });
            return;
        }

        try {
            const reviewData = {
                rating: newReview.rating,
                reviewText: newReview.reviewText,
                reviewDate: new Date().toISOString().split('T')[0],
                bookId: parseInt(id),
                userId: userId,
            };
            console.log('Submitting review:', reviewData); // Отладка
            await axios.post('http://localhost:228/api/reviews', reviewData);
            const reviewsResponse = await axios.get(`http://localhost:228/api/reviews?bookId=${id}`);
            setReviews(reviewsResponse.data);
            setSnackbar({ open: true, message: 'Отзыв успешно добавлен', severity: 'success' });
            handleCloseReviewDialog();
        } catch (error) {
            console.error('Error submitting review:', error); // Отладка
            setSnackbar({ open: true, message: 'Ошибка добавления отзыва', severity: 'error' });
        }
    };

    const handleEditReview = async () => {
        if (!editReview.rating || editReview.rating < 0 || editReview.rating > 5) {
            setSnackbar({ open: true, message: 'Пожалуйста, выберите рейтинг от 0 до 5', severity: 'error' });
            return;
        }
        if (!editReview.reviewText.trim()) {
            setSnackbar({ open: true, message: 'Текст отзыва не может быть пустым', severity: 'error' });
            return;
        }

        try {
            const reviewData = {
                rating: editReview.rating,
                reviewText: editReview.reviewText,
                reviewDate: new Date().toISOString().split('T')[0],
                bookId: parseInt(id),
                userId: userId,
            };
            console.log('Updating review:', reviewData); // Отладка
            await axios.put(`http://localhost:228/api/reviews/${editReview.id}`, reviewData);
            const reviewsResponse = await axios.get(`http://localhost:228/api/reviews?bookId=${id}`);
            setReviews(reviewsResponse.data);
            setSnackbar({ open: true, message: 'Отзыв успешно отредактирован', severity: 'success' });
            handleCloseEditReviewDialog();
        } catch (error) {
            console.error('Error updating review:', error); // Отладка
            setSnackbar({ open: true, message: 'Ошибка редактирования отзыва', severity: 'error' });
        }
    };

    const handleDeleteReview = async (reviewId) => {
        console.log('Deleting review ID:', reviewId); // Отладка
        try {
            await axios.delete(`http://localhost:228/api/reviews/${reviewId}`);
            const reviewsResponse = await axios.get(`http://localhost:228/api/reviews?bookId=${id}`);
            setReviews(reviewsResponse.data);
            setSnackbar({ open: true, message: 'Отзыв успешно удалён', severity: 'success' });
        } catch (error) {
            console.error('Error deleting review:', error); // Отладка
            setSnackbar({ open: true, message: 'Ошибка удаления отзыва', severity: 'error' });
        }
    };

    if (!book) return <Typography>Загрузка...</Typography>;

    return (
        <Box sx={{ padding: 4, backgroundColor: '#E0E0E0', width: '100%', maxWidth: '100vw', boxSizing: 'border-box' }}>
            <Card sx={{ maxWidth: 600, margin: '0 auto', backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #d4a373' }}>
                {book.imageUrl && (
                    <CardMedia
                        component="img"
                        height="300"
                        image={book.imageUrl}
                        alt={book.title}
                        sx={{ objectFit: 'cover' }}
                    />
                )}
                <CardContent>
                    <Typography variant="h4" gutterBottom>
                        {book.title}
                    </Typography>
                    <Typography variant="subtitle1">
                        Авторы:{' '}
                        {book.authors && Array.isArray(book.authors) && book.authors.length > 0
                            ? book.authors.map((author) => getFullName(author)).join(', ')
                            : 'Неизвестный автор'}
                    </Typography>
                    <Typography variant="body1">Жанр: {book.genre || 'Не указано'}</Typography>
                    <Typography variant="body1">Издатель: {book.publisher || 'Не указано'}</Typography>
                    <Typography variant="body1">Страницы: {book.pages || 'Не указано'}</Typography>
                    <Typography variant="body1">Язык: {book.language || 'Не указано'}</Typography>
                    <Typography variant="body1">Дата публикации: {book.publishDate || 'Не указано'}</Typography>
                    <Typography variant="body1" paragraph>
                        Описание: {book.description || 'Описание отсутствует'}
                    </Typography>
                    {/* Кнопки на первой строке */}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                        {book.readUrl && (
                            <Button
                                variant="contained"
                                color="primary"
                                href={book.readUrl}
                                target="_blank"
                                sx={{ backgroundColor: '#8B4513' }}
                            >
                                Читать книгу
                            </Button>
                        )}
                        {userId && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleOpenReviewDialog}
                                sx={{ backgroundColor: '#8B4513' }}
                            >
                                Оставить отзыв
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => navigate('/books')}
                        >
                            Вернуться к книгам
                        </Button>
                    </Box>
                    {/* Кнопка на второй строке */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={handleOpenDialog}
                            sx={{ borderColor: '#8B4513', color: '#8B4513' }}
                        >
                            Редактировать ссылку для чтения
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Секция отзывов */}
            <Box sx={{ maxWidth: 600, margin: '2rem auto' }}>
                <Typography variant="h5" gutterBottom>
                    Отзывы
                </Typography>
                {reviews.length > 0 ? (
                    <List>
                        {reviews.map((review) => (
                            <React.Fragment key={review.id}>
                                <ListItem>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Rating value={review.rating} readOnly precision={0.5} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {new Date(review.reviewDate).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                        }
                                        secondary={
                                            <Typography variant="body1">{review.reviewText}</Typography>
                                        }
                                    />
                                    {/* Временно убрана проверка userId для отладки */}
                                    <Box sx={{ ml: 2 }}>
                                        <Button
                                            size="small"
                                            color="primary"
                                            onClick={() => handleOpenEditReviewDialog(review)}
                                        >
                                            Редактировать
                                        </Button>
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() => handleDeleteReview(review.id)}
                                        >
                                            Удалить
                                        </Button>
                                    </Box>
                                </ListItem>
                                <Divider />
                            </React.Fragment>
                        ))}
                    </List>
                ) : (
                    <Typography variant="body1">Отзывы отсутствуют.</Typography>
                )}
            </Box>

            {/* Диалог для редактирования readUrl */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Редактировать ссылку для чтения</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Ссылка для чтения"
                        value={newReadUrl}
                        onChange={(e) => setNewReadUrl(e.target.value)}
                        fullWidth
                        margin="normal"
                        placeholder="https://example.com/read-book"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Отмена</Button>
                    <Button onClick={handleUpdateReadUrl} color="primary">
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Диалог для добавления отзыва */}
            <Dialog open={openReviewDialog} onClose={handleCloseReviewDialog}>
                <DialogTitle>Оставить отзыв</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body1" gutterBottom>
                            Рейтинг
                        </Typography>
                        <Rating
                            value={newReview.rating}
                            onChange={(e, newValue) => setNewReview({ ...newReview, rating: newValue })}
                            precision={0.5}
                        />
                    </Box>
                    <TextField
                        label="Текст отзыва"
                        value={newReview.reviewText}
                        onChange={(e) => setNewReview({ ...newReview, reviewText: e.target.value })}
                        fullWidth
                        multiline
                        rows={4}
                        margin="normal"
                        placeholder="Ваш отзыв о книге..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseReviewDialog}>Отмена</Button>
                    <Button onClick={handleSubmitReview} color="primary">
                        Отправить
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Диалог для редактирования отзыва */}
            <Dialog open={openEditReviewDialog} onClose={handleCloseEditReviewDialog}>
                <DialogTitle>Редактировать отзыв</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body1" gutterBottom>
                            Рейтинг
                        </Typography>
                        <Rating
                            value={editReview.rating}
                            onChange={(e, newValue) => setEditReview({ ...editReview, rating: newValue })}
                            precision={0.5}
                        />
                    </Box>
                    <TextField
                        label="Текст отзыва"
                        value={editReview.reviewText}
                        onChange={(e) => setEditReview({ ...editReview, reviewText: e.target.value })}
                        fullWidth
                        multiline
                        rows={4}
                        margin="normal"
                        placeholder="Ваш отзыв о книге..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditReviewDialog}>Отмена</Button>
                    <Button onClick={handleEditReview} color="primary">
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default BookDetails;