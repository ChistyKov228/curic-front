import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    window.location.href = 'http://localhost:3000/';
  };

  const handleAuthClick = () => {
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <button className="header-button home-button" onClick={handleHomeClick}>
            <img src="/home/fikus/VsCode/Universitet/curic-front/src/imgs/Vector.png"></img>
          </button>
        </div>
        <div clasName="Header-center">
          <div className="rounded-box">
            <h1>Система учета</h1>
          </div>
        </div>
        <div className="header-right">
          <button className="header-button auth-button" onClick={handleAuthClick}>
            👤 Login
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
