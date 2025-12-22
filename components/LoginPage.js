import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Здесь будет логика авторизации
    console.log('Login:', login, 'Password:', password);
    // После успешной авторизации можно перенаправить
    // navigate('/');
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="login-page">
      <button onClick={handleBack} className="back-button">Назад</button>
      <div className="login-container">
        <h1>Авторизация</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="login">Логин:</label>
            <input
              type="text"
              id="login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Пароль:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-submit-button">Войти</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
