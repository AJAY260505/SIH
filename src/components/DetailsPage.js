import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import './DetailsPage.css';

const DetailsPage = () => {
  const location = useLocation();
  const { item, system } = location.state || {};

  if (!item) {
    return (
      <div className="details-page">
        <div className="container">
          <div className="error-message">
            <h2>No Item Details Available</h2>
            <p>Please go back and select an item to view details.</p>
            <Link to="/search" className="back-button">Back to Search</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="details-page">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div whileHover={{ x: -3 }}>
            <Link to={-1} className="back-button">← Back</Link>
          </motion.div>

          <div className="details-header">
            <h2>{item.english_name || item.display_name || item.title}</h2>
            <div className="badges">
              {system && <span className="system-badge">{system}</span>}
              {item.code && <span className="code-badge">{item.code}</span>}
            </div>
          </div>

          <div className="details-content">
            <motion.div
              className="details-card"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3>Basic Information</h3>
              <div className="details-grid">
                {item.code && (
                  <div className="detail-item">
                    <span className="detail-label">Code:</span>
                    <span className="detail-value">{item.code}</span>
                  </div>
                )}
                {item.english_name && (
                  <div className="detail-item">
                    <span className="detail-label">English Name:</span>
                    <span className="detail-value">{item.english_name}</span>
                  </div>
                )}
                {item.hindi_name && (
                  <div className="detail-item">
                    <span className="detail-label">Hindi Name:</span>
                    <span className="detail-value">{item.hindi_name}</span>
                  </div>
                )}
                {item.arabic_name && (
                  <div className="detail-item">
                    <span className="detail-label">Arabic Name:</span>
                    <span className="detail-value">{item.arabic_name}</span>
                  </div>
                )}
                {item.tamil_name && (
                  <div className="detail-item">
                    <span className="detail-label">Tamil Name:</span>
                    <span className="detail-value">{item.tamil_name}</span>
                  </div>
                )}
                {item.diacritical_name && (
                  <div className="detail-item">
                    <span className="detail-label">Diacritical Name:</span>
                    <span className="detail-value">{item.diacritical_name}</span>
                  </div>
                )}
                {item.romanized_name && (
                  <div className="detail-item">
                    <span className="detail-label">Romanized Name:</span>
                    <span className="detail-value">{item.romanized_name}</span>
                  </div>
                )}
                {item.display_name && (
                  <div className="detail-item">
                    <span className="detail-label">Display Name:</span>
                    <span className="detail-value">{item.display_name}</span>
                  </div>
                )}
                {item.title && (
                  <div className="detail-item">
                    <span className="detail-label">Title:</span>
                    <span className="detail-value">{item.title}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {item.description && item.description !== '-' && (
              <motion.div
                className="details-card"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3>Description</h3>
                <p>{item.description}</p>
              </motion.div>
            )}

            {(item.foundation_uri || item.linearization_uri || item.chapter_no || item.is_leaf !== undefined) && (
              <motion.div
                className="details-card"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3>ICD-11 Details</h3>
                <div className="details-grid">
                  {item.foundation_uri && (
                    <div className="detail-item">
                      <span className="detail-label">Foundation URI:</span>
                      <span className="detail-value">
                        <a href={item.foundation_uri} target="_blank" rel="noopener noreferrer">
                          {item.foundation_uri}
                        </a>
                      </span>
                    </div>
                  )}
                  {item.linearization_uri && (
                    <div className="detail-item">
                      <span className="detail-label">Linearization URI:</span>
                      <span className="detail-value">
                        <a href={item.linearization_uri} target="_blank" rel="noopener noreferrer">
                          {item.linearization_uri}
                        </a>
                      </span>
                    </div>
                  )}
                  {item.chapter_no && (
                    <div className="detail-item">
                      <span className="detail-label">Chapter Number:</span>
                      <span className="detail-value">{item.chapter_no}</span>
                    </div>
                  )}
                  {item.browser_link && (
                    <div className="detail-item">
                      <span className="detail-label">Browser Link:</span>
                      <span className="detail-value">
                        <a href={item.browser_link} target="_blank" rel="noopener noreferrer">
                          {item.browser_link}
                        </a>
                      </span>
                    </div>
                  )}
                  {item.icat_link && (
                    <div className="detail-item">
                      <span className="detail-label">ICAT Link:</span>
                      <span className="detail-value">
                        <a href={item.icat_link} target="_blank" rel="noopener noreferrer">
                          {item.icat_link}
                        </a>
                      </span>
                    </div>
                  )}
                  {item.is_leaf !== undefined && (
                    <div className="detail-item">
                      <span className="detail-label">Is Leaf:</span>
                      <span className={`detail-value status ${item.is_leaf ? 'active' : 'inactive'}`}>
                        {item.is_leaf ? 'Yes' : 'No'}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DetailsPage;
