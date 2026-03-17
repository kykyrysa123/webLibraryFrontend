import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RegisterPage() {
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [localError, setLocalError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { register, error, clearError } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
        setLocalError('');
        clearError();
    };

    const validateForm = () => {
        if (!userData.username || !userData.email || !userData.password || !userData.confirmPassword) {
            setLocalError('Пожалуйста, заполните все поля');
            return false;
        }

        if (userData.password.length < 6) {
            setLocalError('Пароль должен содержать минимум 6 символов');
            return false;
        }

        if (userData.password !== userData.confirmPassword) {
            setLocalError('Пароли не совпадают');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            setLocalError('Введите корректный email адрес');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setLocalError('');

        // Убираем confirmPassword перед отправкой
        const { confirmPassword, ...registrationData } = userData;

        const result = await register(registrationData);

        setIsLoading(false);

        if (result.success) {
            navigate('/'); // Перенаправляем на главную после успешной регистрации
        } else {
            setLocalError(result.error.message || 'Ошибка при регистрации');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formContainer}>
                <h2 style={styles.title}>Регистрация</h2>

                {(localError || error) && (
                    <div style={styles.errorMessage}>
                        {localError || error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Имя пользователя</label>
                        <input
                            type="text"
                            name="username"
                            value={userData.username}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="Введите имя пользователя"
                            disabled={isLoading}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={userData.email}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="Введите email"
                            disabled={isLoading}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Пароль</label>
                        <input
                            type="password"
                            name="password"
                            value={userData.password}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="Минимум 6 символов"
                            disabled={isLoading}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Подтверждение пароля</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={userData.confirmPassword}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="Повторите пароль"
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        style={styles.button}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>

                <p style={styles.loginLink}>
                    Уже есть аккаунт? <Link to="/login">Войти</Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
    },
    formContainer: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
    },
    title: {
        textAlign: 'center',
        marginBottom: '30px',
        color: '#333',
        fontSize: '24px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    label: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#555'
    },
    input: {
        padding: '10px',
        fontSize: '16px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        outline: 'none',
        transition: 'border-color 0.3s'
    },
    button: {
        padding: '12px',
        fontSize: '16px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        marginTop: '10px'
    },
    errorMessage: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '20px',
        textAlign: 'center'
    },
    loginLink: {
        textAlign: 'center',
        marginTop: '20px',
        color: '#666'
    }
};

export default RegisterPage;