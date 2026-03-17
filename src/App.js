import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext'; // Добавь импорт
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Home from './components/Home';
import BooksList from './components/BooksList';
import BookDetails from './components/BookDetails';
import AuthorsList from './components/AuthorsList';
import FavoritesList from './components/FavoritesList'; // Добавь импорт

function App() {
    return (
        <Router>
            <AuthProvider>
                <FavoritesProvider> {/* Оборачиваем в FavoritesProvider */}
                    <Routes>
                        {/* Публичные маршруты */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        {/* Маршруты для всех авторизованных пользователей */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Home />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/books"
                            element={
                                <ProtectedRoute>
                                    <BooksList />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/books/:id"
                            element={
                                <ProtectedRoute>
                                    <BookDetails />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/authors"
                            element={
                                <ProtectedRoute>
                                    <AuthorsList />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/favorites" // Новый маршрут
                            element={
                                <ProtectedRoute>
                                    <FavoritesList />
                                </ProtectedRoute>
                            }
                        />

                        {/* Если адрес не найден - на главную */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </FavoritesProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;