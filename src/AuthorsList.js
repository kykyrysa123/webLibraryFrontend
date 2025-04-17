import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Card,
    CardContent,
    CardMedia,
    Grid,
    Collapse,
    IconButton,
    Divider,
    Box,
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
} from '@mui/material';
import { ExpandMore, ExpandLess, Edit, Delete, Circle } from '@mui/icons-material';
import axios from 'axios';

const AuthorsList = () => {
    const [authors, setAuthors] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({});
    const [openAddAuthorDialog, setOpenAddAuthorDialog] = useState(false);
    const [openEditAuthorDialog, setOpenEditAuthorDialog] = useState(false);
    const [openAddBookDialog, setOpenAddBookDialog] = useState(false);
    const [openEditBookDialog, setOpenEditBookDialog] = useState(false);
    const [currentAuthor, setCurrentAuthor] = useState(null);
    const [currentBook, setCurrentBook] = useState(null);
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
        authorId: null,
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const authorsResponse = await axios.get('http://localhost:228/api/authors');
            setAuthors(authorsResponse.data);

            const booksResponse = await axios.get('http://localhost:228/api/books');
            setBooks(booksResponse.data);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const handleExpandClick = (authorId) => {
        setExpanded((prev) => ({
            ...prev,
            [authorId]: !prev[authorId],
        }));
    };

    const getBooksByAuthor = (authorId) => {
        return books.filter((book) => book.author.id === authorId);
    };

    const getFullName = (author) => {
        return `${author.surname} ${author.name}${author.patronymic ? ' ' + author.patronymic : ''}`;
    };

    const isDeceased = (author) => {
        return !!author.deathDate;
    };

    const handleAddAuthor = async () => {
        if (!newAuthor.name || !newAuthor.surname || !newAuthor.birthDate) {
            setSnackbar({ open: true, message: 'Name, Surname, and Birth Date are required!', severity: 'error' });
            return;
        }
        try {
            console.log('Sending author data:', newAuthor);
            const response = await axios.post('http://localhost:228/api/authors', newAuthor);
            console.log('Response from server:', response.data);
            setSnackbar({ open: true, message: 'Author added successfully!', severity: 'success' });
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
            console.error('Error adding author:', error.response?.data || error.message);
            setSnackbar({ open: true, message: `Error adding author: ${error.response?.data?.message || error.message}`, severity: 'error' });
        }
    };

    const handleEditAuthor = async () => {
        if (!newAuthor.name || !newAuthor.surname || !newAuthor.birthDate) {
            setSnackbar({ open: true, message: 'Name, Surname, and Birth Date are required!', severity: 'error' });
            return;
        }
        try {
            await axios.put(`http://localhost:228/api/authors/${currentAuthor.id}`, newAuthor);
            setSnackbar({ open: true, message: 'Author updated successfully!', severity: 'success' });
            setOpenEditAuthorDialog(false);
            fetchData();
        } catch (error) {
            setSnackbar({ open: true, message: `Error updating author: ${error.response?.data?.message || error.message}`, severity: 'error' });
        }
    };

    const handleDeleteAuthor = async (authorId) => {
        try {
            await axios.delete(`http://localhost:228/api/authors/${authorId}`);
            setSnackbar({ open: true, message: 'Author deleted successfully!', severity: 'success' });
            fetchData();
        } catch (error) {
            setSnackbar({ open: true, message: 'Error deleting author', severity: 'error' });
        }
    };

    const handleAddBook = async () => {
        if (!newBook.title || !newBook.genre || !newBook.publishDate || !newBook.publisher) {
            setSnackbar({ open: true, message: 'Title, Genre, Publish Date, and Publisher are required!', severity: 'error' });
            return;
        }
        try {
            const bookToAdd = {
                ...newBook,
                author: { id: newBook.authorId },
            };
            console.log('Sending book data:', bookToAdd);
            await axios.post('http://localhost:228/api/books', bookToAdd);
            setSnackbar({ open: true, message: 'Book added successfully!', severity: 'success' });
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
                authorId: null,
            });
            fetchData();
        } catch (error) {
            console.error('Error adding book:', error.response?.data || error.message);
            setSnackbar({ open: true, message: `Error adding book: ${error.response?.data?.message || error.message}`, severity: 'error' });
        }
    };

    const handleEditBook = async () => {
        if (!newBook.title || !newBook.genre || !newBook.publishDate || !newBook.publisher) {
            setSnackbar({ open: true, message: 'Title, Genre, Publish Date, and Publisher are required!', severity: 'error' });
            return;
        }
        try {
            const bookToUpdate = {
                ...newBook,
                author: { id: newBook.authorId },
            };
            console.log('Updating book data:', bookToUpdate);
            await axios.put(`http://localhost:228/api/books/${currentBook.id}`, bookToUpdate);
            setSnackbar({ open: true, message: 'Book updated successfully!', severity: 'success' });
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
                authorId: null,
            });
            fetchData();
        } catch (error) {
            console.error('Error updating book:', error.response?.data || error.message);
            setSnackbar({ open: true, message: `Error updating book: ${error.response?.data?.message || error.message}`, severity: 'error' });
        }
    };

    const handleDeleteBook = async (bookId) => {
        try {
            await axios.delete(`http://localhost:228/api/books/${bookId}`);
            setSnackbar({ open: true, message: 'Book deleted successfully!', severity: 'success' });
            fetchData();
        } catch (error) {
            setSnackbar({ open: true, message: 'Error deleting book', severity: 'error' });
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Container
            sx={{
                py: 4,
                backgroundImage: 'url(https://img.freepik.com/free-photo/old-yellow-parchment-paper_95678-132.jpg)', // Новое изображение высокого качества
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                minHeight: '100vh',
                position: 'relative',
                '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Легкий оверлей для читаемости (можно убрать, если не нужно)
                    zIndex: 1,
                },
                '& > *': {
                    position: 'relative',
                    zIndex: 2, // Контент поверх оверлея
                },
            }}
        >
            <Typography
                variant="h4"
                gutterBottom
                align="center"
                sx={{ mb: 4, color: '#333', fontWeight: 'bold' }} // Темный текст для контраста с пергаментом
            >
                Authors and Their Books (OneToMany)
            </Typography>

            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenAddAuthorDialog(true)}
                    sx={{ backgroundColor: '#8B4513', color: '#fff' }} // Коричневый цвет кнопки в стиле пергамента
                >
                    Add New Author
                </Button>
            </Box>

            {authors.map((author) => {
                const authorBooks = getBooksByAuthor(author.id);
                return (
                    <Card
                        key={author.id}
                        sx={{
                            mb: 4,
                            boxShadow: 3,
                            borderRadius: 2,
                            backgroundColor: 'rgba(255, 255, 255, 0.9)', // Полупрозрачный белый фон для карточек
                            border: '1px solid #d4a373', // Тонкая рамка в стиле пергамента
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
                                        Genre Specialization: {author.genreSpecialization}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Biography: {author.biography}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Birth: {author.birthDate} | Death: {author.deathDate || 'N/A'}
                                    </Typography>
                                    <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                            Rating:
                                        </Typography>
                                        <Rating value={author.rating} precision={0.1} readOnly />
                                        <Typography variant="body2" sx={{ ml: 1 }}>
                                            ({author.rating})
                                        </Typography>
                                    </Box>
                                </Box>
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
                            </Box>

                            <Collapse in={expanded[author.id]} timeout="auto" unmountOnExit>
                                <Box sx={{ mt: 2 }}>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => {
                                            setNewBook({ ...newBook, authorId: author.id });
                                            setOpenAddBookDialog(true);
                                        }}
                                        sx={{ mb: 2, borderColor: '#8B4513', color: '#8B4513' }} // Коричневый стиль кнопки
                                    >
                                        Add Book
                                    </Button>
                                    {authorBooks.length > 0 ? (
                                        <Grid container spacing={2}>
                                            {authorBooks.map((book) => (
                                                <Grid item xs={12} sm={6} md={4} key={book.id}>
                                                    <Card
                                                        sx={{
                                                            height: '100%',
                                                            '&:hover': { boxShadow: 6, transform: 'scale(1.02)' },
                                                            backgroundColor: 'rgba(255, 255, 255, 0.95)', // Полупрозрачный фон для книг
                                                            border: '1px solid #d4a373', // Тонкая рамка в стиле пергамента
                                                        }}
                                                    >
                                                        <CardMedia
                                                            component="img"
                                                            height="140"
                                                            image={book.imageUrl || 'https://via.placeholder.com/140'}
                                                            alt={book.title}
                                                        />
                                                        <CardContent>
                                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                                <Typography variant="h6" gutterBottom color="primary.main">
                                                                    {book.title}
                                                                </Typography>
                                                                <Box>
                                                                    <IconButton
                                                                        onClick={() => {
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
                                                                                authorId: book.author.id,
                                                                            });
                                                                            setOpenEditBookDialog(true);
                                                                        }}
                                                                        sx={{ color: 'primary.main' }}
                                                                    >
                                                                        <Edit />
                                                                    </IconButton>
                                                                    <IconButton
                                                                        onClick={() => handleDeleteBook(book.id)}
                                                                        sx={{ color: 'error.main' }}
                                                                    >
                                                                        <Delete />
                                                                    </IconButton>
                                                                </Box>
                                                            </Box>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Genre: {book.genre}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Published: {book.publishDate}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Publisher: {book.publisher}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Pages: {book.pages}
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
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    ) : (
                                        <Typography variant="body1" sx={{ mt: 2 }}>
                                            No books available
                                        </Typography>
                                    )}
                                </Box>
                            </Collapse>
                        </CardContent>
                    </Card>
                );
            })}

            {/* Диалог для добавления автора */}
            <Dialog open={openAddAuthorDialog} onClose={() => setOpenAddAuthorDialog(false)}>
                <DialogTitle>Add New Author</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Name"
                        fullWidth
                        value={newAuthor.name}
                        onChange={(e) => setNewAuthor({ ...newAuthor, name: e.target.value })}
                        required
                    />
                    <TextField
                        margin="dense"
                        label="Surname"
                        fullWidth
                        value={newAuthor.surname}
                        onChange={(e) => setNewAuthor({ ...newAuthor, surname: e.target.value })}
                        required
                    />
                    <TextField
                        margin="dense"
                        label="Patronymic"
                        fullWidth
                        value={newAuthor.patronymic}
                        onChange={(e) => setNewAuthor({ ...newAuthor, patronymic: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Genre Specialization"
                        fullWidth
                        value={newAuthor.genreSpecialization}
                        onChange={(e) => setNewAuthor({ ...newAuthor, genreSpecialization: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Biography"
                        fullWidth
                        multiline
                        rows={3}
                        value={newAuthor.biography}
                        onChange={(e) => setNewAuthor({ ...newAuthor, biography: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Birth Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={newAuthor.birthDate}
                        onChange={(e) => setNewAuthor({ ...newAuthor, birthDate: e.target.value })}
                        required
                    />
                    <TextField
                        margin="dense"
                        label="Death Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={newAuthor.deathDate}
                        onChange={(e) => setNewAuthor({ ...newAuthor, deathDate: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Rating"
                        type="number"
                        fullWidth
                        value={newAuthor.rating}
                        onChange={(e) => setNewAuthor({ ...newAuthor, rating: parseFloat(e.target.value) })}
                        inputProps={{ min: 0, max: 5, step: 0.1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddAuthorDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddAuthor} color="primary">Add</Button>
                </DialogActions>
            </Dialog>

            {/* Диалог для редактирования автора */}
            <Dialog open={openEditAuthorDialog} onClose={() => setOpenEditAuthorDialog(false)}>
                <DialogTitle>Edit Author</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Name"
                        fullWidth
                        value={newAuthor.name}
                        onChange={(e) => setNewAuthor({ ...newAuthor, name: e.target.value })}
                        required
                    />
                    <TextField
                        margin="dense"
                        label="Surname"
                        fullWidth
                        value={newAuthor.surname}
                        onChange={(e) => setNewAuthor({ ...newAuthor, surname: e.target.value })}
                        required
                    />
                    <TextField
                        margin="dense"
                        label="Patronymic"
                        fullWidth
                        value={newAuthor.patronymic}
                        onChange={(e) => setNewAuthor({ ...newAuthor, patronymic: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Genre Specialization"
                        fullWidth
                        value={newAuthor.genreSpecialization}
                        onChange={(e) => setNewAuthor({ ...newAuthor, genreSpecialization: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Biography"
                        fullWidth
                        multiline
                        rows={3}
                        value={newAuthor.biography}
                        onChange={(e) => setNewAuthor({ ...newAuthor, biography: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Birth Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={newAuthor.birthDate}
                        onChange={(e) => setNewAuthor({ ...newAuthor, birthDate: e.target.value })}
                        required
                    />
                    <TextField
                        margin="dense"
                        label="Death Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={newAuthor.deathDate}
                        onChange={(e) => setNewAuthor({ ...newAuthor, deathDate: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Rating"
                        type="number"
                        fullWidth
                        value={newAuthor.rating}
                        onChange={(e) => setNewAuthor({ ...newAuthor, rating: parseFloat(e.target.value) })}
                        inputProps={{ min: 0, max: 5, step: 0.1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditAuthorDialog(false)}>Cancel</Button>
                    <Button onClick={handleEditAuthor} color="primary">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Диалог для добавления книги */}
            <Dialog open={openAddBookDialog} onClose={() => setOpenAddBookDialog(false)}>
                <DialogTitle>Add New Book</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Title"
                        fullWidth
                        value={newBook.title}
                        onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                        required
                    />
                    <TextField
                        margin="dense"
                        label="Genre"
                        fullWidth
                        value={newBook.genre}
                        onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
                        required
                    />
                    <TextField
                        margin="dense"
                        label="Publish Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={newBook.publishDate}
                        onChange={(e) => setNewBook({ ...newBook, publishDate: e.target.value })}
                        required
                    />
                    <TextField
                        margin="dense"
                        label="Pages"
                        type="number"
                        fullWidth
                        value={newBook.pages}
                        onChange={(e) => setNewBook({ ...newBook, pages: parseInt(e.target.value) })}
                        inputProps={{ min: 1 }}
                    />
                    <TextField
                        margin="dense"
                        label="Publisher"
                        fullWidth
                        value={newBook.publisher}
                        onChange={(e) => setNewBook({ ...newBook, publisher: e.target.value })}
                        required
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        value={newBook.description}
                        onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Language"
                        fullWidth
                        value={newBook.language}
                        onChange={(e) => setNewBook({ ...newBook, language: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Image URL"
                        fullWidth
                        value={newBook.imageUrl}
                        onChange={(e) => setNewBook({ ...newBook, imageUrl: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddBookDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddBook} color="primary">Add</Button>
                </DialogActions>
            </Dialog>

            {/* Диалог для редактирования книги */}
            <Dialog open={openEditBookDialog} onClose={() => setOpenEditBookDialog(false)}>
                <DialogTitle>Edit Book</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Title"
                        fullWidth
                        value={newBook.title}
                        onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                        required
                    />
                    <TextField
                        margin="dense"
                        label="Genre"
                        fullWidth
                        value={newBook.genre}
                        onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
                        required
                    />
                    <TextField
                        margin="dense"
                        label="Publish Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={newBook.publishDate}
                        onChange={(e) => setNewBook({ ...newBook, publishDate: e.target.value })}
                        required
                    />
                    <TextField
                        margin="dense"
                        label="Pages"
                        type="number"
                        fullWidth
                        value={newBook.pages}
                        onChange={(e) => setNewBook({ ...newBook, pages: parseInt(e.target.value) })}
                        inputProps={{ min: 1 }}
                    />
                    <TextField
                        margin="dense"
                        label="Publisher"
                        fullWidth
                        value={newBook.publisher}
                        onChange={(e) => setNewBook({ ...newBook, publisher: e.target.value })}
                        required
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        value={newBook.description}
                        onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Language"
                        fullWidth
                        value={newBook.language}
                        onChange={(e) => setNewBook({ ...newBook, language: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Image URL"
                        fullWidth
                        value={newBook.imageUrl}
                        onChange={(e) => setNewBook({ ...newBook, imageUrl: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditBookDialog(false)}>Cancel</Button>
                    <Button onClick={handleEditBook} color="primary">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Уведомления */}
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
        </Container>
    );
};

export default AuthorsList;