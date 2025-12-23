import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import vectorHome from '../imgs/home.png';
import vectorLogIn from '../imgs/LogIn.png';

function Header() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('loginUsername');
    localStorage.removeItem('loginPassword');
    setRole(null);
    window.dispatchEvent(new Event('logoutChange'));
    navigate('/');
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('role');
      if (token && userRole) {
        setRole(userRole);
      } else {
        setRole(null);
      }
    };

    checkAuth();

    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('logoutChange', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('logoutChange', handleAuthChange);
    };
  }, []);

  const handleHomeClick = () => {
    window.location.href = 'http://localhost:3000/';
  };

  const handleAuthClick = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <button className="header-button home-button" onClick={handleHomeClick}>
            <img src={vectorHome} alt="Home" />
          </button>
        </div>
        <div className="header-center">
          <div className="rounded-box">
            <h1>Система учета</h1>
          </div>
        </div>
        <div className="header-right">
          {role ? (
            <button className="header-button user-role-button" onClick={handleLogout} style={{ fontWeight: 'bold' }}>
              {role}
            </button>
          ) : (
            <button className="header-button auth-button" onClick={handleAuthClick}>
              <img src={vectorLogIn} alt="Login" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
