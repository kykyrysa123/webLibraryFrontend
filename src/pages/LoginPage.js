    import React, { useState } from 'react';
    import { useNavigate, Link } from 'react-router-dom';
    import { useAuth } from '../context/AuthContext';

    function LoginPage() {
        const [credentials, setCredentials] = useState({
            username: '',
            password: ''
        });
        const [localError, setLocalError] = useState('');
        const [isLoading, setIsLoading] = useState(false);

        const navigate = useNavigate();
        const { login, error, clearError } = useAuth();

        const handleChange = (e) => {
            const { name, value } = e.target;
            setCredentials(prev => ({
                ...prev,
                [name]: value
            }));
            // Очищаем ошибки при вводе
            setLocalError('');
            clearError();
        };

        const handleSubmit = async (e) => {
            e.preventDefault();

            // Валидация
            if (!credentials.username || !credentials.password) {
                setLocalError('Пожалуйста, заполните все поля');
                return;
            }

            setIsLoading(true);
            setLocalError('');

            const result = await login(credentials);

            setIsLoading(false);

            if (result.success) {
                navigate('/'); // Перенаправляем на главную страницу
            } else {
                setLocalError(result.error.message || 'Ошибка при входе');
            }
        };

        return (
            <div style={styles.container}>
                <div style={styles.formContainer}>
                    <h2 style={styles.title}>Вход в систему</h2>

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
                                value={credentials.username}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="Введите имя пользователя"
                                disabled={isLoading}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Пароль</label>
                            <input
                                type="password"
                                name="password"
                                value={credentials.password}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="Введите пароль"
                                disabled={isLoading}
                            />
                        </div>

                        <button
                            type="submit"
                            style={styles.button}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Вход...' : 'Войти'}
                        </button>
                    </form>

                    <p style={styles.registerLink}>
                        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
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
            gap: '20px'
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
        registerLink: {
            textAlign: 'center',
            marginTop: '20px',
            color: '#666'
        }
    };

    export default LoginPage;