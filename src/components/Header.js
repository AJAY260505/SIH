import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Header.css';

const Header = ({ theme, toggleTheme, user, handleSignIn, handleSignOut }) => {
  return (
    <motion.header 
      className={`header ${theme}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120 }}
    >
      <div className="container">
        <Link to="/" className="logo">
          AYUSH BANDHAN
        </Link>

        <nav className="nav">
          <ul>
            <li>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/search">Search</Link>
              </motion.div>
            </li>
            <li>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <a href="https://ayush-documentation.vercel.app/" target="_blank" rel="noopener noreferrer">
                  Documentation
                </a>
              </motion.div>
            </li>

            {user && (
              <>
                <li>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/add-patient">Add Patient</Link>
                  </motion.div>
                </li>
                <li>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/doctor-dashboard">Doctor Dashboard</Link>
                  </motion.div>
                </li>
              </>
            )}

            {user ? (
              <li className="user-menu">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/profile" className="user-name-btn">
                    {user.displayName || "User"}
                  </Link>
                </motion.div>
              </li>
            ) : (
              <li>
                <motion.button 
                  onClick={handleSignIn} 
                  className="auth-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign In
                </motion.button>
              </li>
            )}

            <li>
              <motion.button 
                onClick={toggleTheme} 
                className="theme-toggle"
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </motion.button>
            </li>
          </ul>
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;
