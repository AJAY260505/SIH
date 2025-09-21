import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Header.css';

const Header = ({ theme, toggleTheme, user, handleSignIn, handleSignOut }) => {
  return (
  <header className={`header ${theme}`}>
  <div
    className="header-container"
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      padding: '1rem 2rem',
      margin: 0 // override the auto centering
    }}
  >
    {/* Left: Logo + Name */}
    <Link
      to="/"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontStyle: 'italic',
        fontSize: '1.9rem',
        fontWeight: '800',
        color: '#1e88e5',
        textDecoration: 'none',
      }}
    >
      <img
        src="/logo.png"
        alt="Logo"
        style={{
          height: '48px',
          width: '48px',
          objectFit: 'contain'
        }}
      />
      <span>AYUSH BANDHAN</span>
    </Link>

    {/* Right: Navigation & Buttons */}
    <nav className="nav">
      <ul style={{ display: 'flex', gap: '2rem', alignItems: 'center', margin: 0, padding: 0 }}>
        <li><Link to="/search">Search</Link></li>
        <li>
          <a href="https://ayush-documentation.vercel.app/" target="_blank" rel="noopener noreferrer">
            Documentation
          </a>
        </li>
        {user ? (
          <>
            <li><Link to="/add-patient">Add Patient</Link></li>
            <li><Link to="/doctor-dashboard">Doctor Dashboard</Link></li>
            <li>
              <Link to="/profile" style={{
                background: 'linear-gradient(135deg, #1e88e5, #42a5f5)',
                color: '#fff',
                padding: '0.5rem 1.2rem',
                borderRadius: '25px',
                fontWeight: 600,
                textDecoration: 'none'
              }}>
                {user.displayName || 'User'}
              </Link>
            </li>
          </>
        ) : (
          <li>
            <button style={{
              background: 'linear-gradient(135deg, #1e88e5, #42a5f5)',
              color: '#fff',
              padding: '0.55rem 1.2rem',
              borderRadius: '25px',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer'
            }} onClick={handleSignIn}>
              Sign In
            </button>
          </li>
        )}
        <li>
          <button style={{
            background: '#e3f2fd',
            color: '#1e88e5',
            borderRadius: '25px',
            border: 'none',
            padding: '0.5rem 0.7rem',
            fontSize: '1.3rem',
            cursor: 'pointer'
          }} onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </li>
      </ul>
    </nav>
  </div>
</header>

  );
};

export default Header;
