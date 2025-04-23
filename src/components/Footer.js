import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer = () => {
    return (
        <Box
            sx={{
                py: 2,
                px: 4,
                backgroundColor: '#8B4513',
                color: '#fff',
                textAlign: 'center',
                width: '100%',
                maxWidth: '100vw',
                boxSizing: 'border-box',
            }}
        >
            <Typography variant="body2">
                © {new Date().getFullYear()} Библиотека. Все права защищены.
            </Typography>
            <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                    Разработал: Стасюк Артём Александрович
                </Typography>
                <Typography variant="body2">
                    Телефон: <Link href="tel:+375447169359" color="inherit" sx={{ textDecoration: 'none' }}>
                    +375 44 716 9359
                </Link>
                </Typography>
                <Typography variant="body2">
                    Почта: <Link href="mailto:stasyukartem02@gmail.com" color="inherit" sx={{ textDecoration: 'none' }}>
                    stasyukartem02@gmail.com
                </Link>
                </Typography>
                <Typography variant="body2">
                    ВКонтакте: <Link href="https://vk.com/id418370835" target="_blank" color="inherit" sx={{ textDecoration: 'none' }}>
                    vk.com/id418370835
                </Link>
                </Typography>
            </Box>
        </Box>
    );
};

export default Footer;