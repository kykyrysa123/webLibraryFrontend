import React from 'react';
import AuthorsList from './AuthorsList';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2', // Основной цвет (синий)
        },
        secondary: {
            main: '#f50057', // Вторичный цвет (розовый)
        },
        background: {
            default: '#f5f5f5', // Цвет фона страницы
            paper: '#ffffff', // Цвет фона карточек
        },
    },
    typography: {
        h4: {
            fontWeight: 700, // Жирный заголовок
        },
        h5: {
            fontWeight: 600,
        },
        body2: {
            color: '#555', // Цвет текста для мелких деталей
        },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    transition: 'all 0.3s ease-in-out', // Плавный переход для hover-эффектов
                },
            },
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <AuthorsList />
        </ThemeProvider>
    );
}

export default App;