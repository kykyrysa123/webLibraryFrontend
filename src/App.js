import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home';
import AuthorsList from './components/AuthorsList';
import BooksList from './components/BooksList';
import BookDetails from './components/BookDetails';
import Footer from './components/Footer';
import {
    AppBar,
    Toolbar,
    Box,
    Button,
} from '@mui/material';

const App = () => {
    return (
        <Router>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                    width: '100%',
                    maxWidth: '100vw',
                    overflowX: 'hidden',
                    boxSizing: 'border-box',
                    margin: 0,
                }}
            >
                <AppBar position="static" sx={{ bgcolor: '#8B4513', width: '100%', overflowX: 'hidden' }}>
                    <Toolbar>
                        <Box sx={{ flexGrow: 1 }}>
                            <Link to="/" style={{ textDecoration: 'none' }}>
                                <img
                                    src="https://avatars.mds.yandex.net/i?id=719c9269e947729483f634d19fab97a5d96d4ddb-8201030-images-thumbs&n=13"
                                    alt="Иконка книги"
                                    style={{ height: '40px', cursor: 'pointer' }}
                                />
                            </Link>
                        </Box>
                        <Box>
                            <Button color="inherit" component={Link} to="/authors">
                                Авторы
                            </Button>
                            <Button color="inherit" component={Link} to="/books">
                                Книги
                            </Button>
                        </Box>
                    </Toolbar>
                </AppBar>
                <Box sx={{ flex: '1 0 auto', marginTop: 2 }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/authors" element={<AuthorsList />} />
                        <Route path="/books" element={<BooksList />} />
                        <Route path="/books/:id" element={<BookDetails />} />
                    </Routes>
                </Box>
                <Footer />
            </Box>
        </Router>
    );
};

export default App;