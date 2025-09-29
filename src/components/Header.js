import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Header.css';

const Header = ({ theme, toggleTheme, user, handleSignIn, handleSignOut }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /* helper to close drawer after navigation */
  const close = () => setIsMenuOpen(false);

  /* icon + label for the theme row */
  const themeLabel = theme === 'light' ? '🌙  Dark theme' : '☀️  Light theme';

  return (
    <header className={`header ${theme}`}>
      <div className="header-container">
        {/* -------  LOGO  ------- */}
        <Link to="/" className="logo-link">
          <img src="/logo.png" alt="Logo" className="logo-img" />
          <span className="logo-text">Ayush Bhandhan</span>
        </Link>

        {/* -------  DESKTOP NAV  ------- */}
        <nav className="nav desktop-nav">
          <ul>
            <li><Link to="/search">Search</Link></li>
            <li>
              <a href="http://localhost:8080/"
                 target="_blank" rel="noopener noreferrer">Documentation</a>
            </li>

            {user ? (
              <>
                <li><Link to="/add-patient">Add Patient</Link></li>
                <li><Link to="/doctor-dashboard">Doctor Dashboard</Link></li>
                <li>
                  <Link to="/profile" className="user-name-btn">
                    {user.displayName || 'User'}
                  </Link>
                </li>
                <li>
                  <button className="auth-btn" onClick={handleSignOut}>
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <li>
                <button className="auth-btn" onClick={handleSignIn}>
                  Sign In
                </button>
              </li>
            )}

            <li>
              <button className="theme-toggle" onClick={toggleTheme}>
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </li>
          </ul>
        </nav>

        {/* -------  HAMBURGER  ------- */}
        <button className="hamburger" onClick={() => setIsMenuOpen(true)}>☰</button>
      </div>

      {/* -------------------------------------------------- */}
      {/*                   DRAWER / SIDEBAR                 */}
      {/* -------------------------------------------------- */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* backdrop */}
            <motion.div
              className="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
            />

            {/* drawer panel */}
            <motion.aside
              className={`sidebar ${theme}`}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <button className="close-btn" onClick={close}>✕</button>

              <ul className="drawer-list">
                {/* generic links */}
                <li><Link to="/search" onClick={close}>🔍 Search</Link></li>
                <li>
                  <a href="https://ayush-documentation.vercel.app"
                     target="_blank" rel="noopener noreferrer" onClick={close}>
                     📖 Documentation
                  </a>
                </li>

                {/* auth dependent section */}
                {user ? (
                  <>
                    <li><Link to="/add-patient" onClick={close}>➕ Add Patient</Link></li>
                    <li><Link to="/doctor-dashboard" onClick={close}>👨‍⚕️ Doctor Dashboard</Link></li>
                    <li>
                      <Link to="/profile" onClick={close}>
                        <span className="drawer-avatar">{user.displayName || 'User'}</span>
                      </Link>
                    </li>
                    <li>
                      <button className="auth-btn drawer-btn" onClick={() => { handleSignOut(); close(); }}>
                        🚪 Sign Out
                      </button>
                    </li>
                  </>
                ) : (
                  <li>
                    <button className="auth-btn drawer-btn" onClick={() => { handleSignIn(); close(); }}>
                      🔐 Sign In
                    </button>
                  </li>
                )}

                {/* theme toggle row */}
                <li>
                  <button className="theme-toggle drawer-btn" onClick={toggleTheme}>
                    {themeLabel}
                  </button>
                </li>
              </ul>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;