import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import './MappingDetailsPage.css';
const MappingDetailsPage = () => {
  const location = useLocation();
  const { mapping } = location.state || {};
  
  if (!mapping) {
    return (
      <div className="mapping-details-page">
        <div className="container">
          <div className="error-message">
            <h2>No Mapping Details Available</h2>
            <p>Please go back and select a mapping to view details.</p>
            <Link to="/search" className="back-button">Back to Search</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mapping-details-page">
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Link to={-1} className="back-button">← Back to Results</Link>
          
          <div className="details-header">
            <h2>{mapping.source_term.english_name}</h2>
            <div className="badges">
              <span className="system-badge">{mapping.search_system}</span>
              <span className="code-badge">{mapping.source_term.code}</span>
              <span className="confidence-badge">
                Confidence: {(mapping.confidence_score * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="mapping-details-content">
            <div className="details-section">
              <h3>Source Term Information</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">System:</span>
                  <span className="detail-value">{mapping.search_system}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Code:</span>
                  <span className="detail-value">{mapping.source_term.code}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">English Name:</span>
                  <span className="detail-value">{mapping.source_term.english_name}</span>
                </div>
                {mapping.source_term.hindi_name && (
                  <div className="detail-item">
                    <span className="detail-label">Hindi Name:</span>
                    <span className="detail-value">{mapping.source_term.hindi_name}</span>
                  </div>
                )}
                {mapping.source_term.diacritical_name && (
                  <div className="detail-item">
                    <span className="detail-label">Diacritical Name:</span>
                    <span className="detail-value">{mapping.source_term.diacritical_name}</span>
                  </div>
                )}
                {mapping.source_term.description && mapping.source_term.description !== '-' && (
                  <div className="detail-item full-width">
                    <span className="detail-label">Description:</span>
                    <span className="detail-value">{mapping.source_term.description}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="details-section">
              <h3>NAMASTE Terms Mapping</h3>
              <div className="mapping-cards">
                {mapping.namaste_terms.ayurveda && (
                  <div className="mapping-card">
                    <h4>Ayurveda</h4>
                    <div className="mapping-details">
                      <div className="detail-item">
                        <span className="detail-label">Code:</span>
                        <span className="detail-value">{mapping.namaste_terms.ayurveda.code}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">English Name:</span>
                        <span className="detail-value">{mapping.namaste_terms.ayurveda.english_name}</span>
                      </div>
                      {mapping.namaste_terms.ayurveda.hindi_name && (
                        <div className="detail-item">
                          <span className="detail-label">Hindi Name:</span>
                          <span className="detail-value">{mapping.namaste_terms.ayurveda.hindi_name}</span>
                        </div>
                      )}
                      {mapping.namaste_terms.ayurveda.diacritical_name && (
                        <div className="detail-item">
                          <span className="detail-label">Diacritical Name:</span>
                          <span className="detail-value">{mapping.namaste_terms.ayurveda.diacritical_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {mapping.namaste_terms.siddha && (
                  <div className="mapping-card">
                    <h4>Siddha</h4>
                    <div className="mapping-details">
                      <div className="detail-item">
                        <span className="detail-label">Code:</span>
                        <span className="detail-value">{mapping.namaste_terms.siddha.code}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">English Name:</span>
                        <span className="detail-value">{mapping.namaste_terms.siddha.english_name}</span>
                      </div>
                      {mapping.namaste_terms.siddha.tamil_name && (
                        <div className="detail-item">
                          <span className="detail-label">Tamil Name:</span>
                          <span className="detail-value">{mapping.namaste_terms.siddha.tamil_name}</span>
                        </div>
                      )}
                      {mapping.namaste_terms.siddha.romanized_name && (
                        <div className="detail-item">
                          <span className="detail-label">Romanized Name:</span>
                          <span className="detail-value">{mapping.namaste_terms.siddha.romanized_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {mapping.namaste_terms.unani && (
                  <div className="mapping-card">
                    <h4>Unani</h4>
                    <div className="mapping-details">
                      <div className="detail-item">
                        <span className="detail-label">Code:</span>
                        <span className="detail-value">{mapping.namaste_terms.unani.code}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">English Name:</span>
                        <span className="detail-value">{mapping.namaste_terms.unani.english_name}</span>
                      </div>
                      {mapping.namaste_terms.unani.arabic_name && (
                        <div className="detail-item">
                          <span className="detail-label">Arabic Name:</span>
                          <span className="detail-value">{mapping.namaste_terms.unani.arabic_name}</span>
                        </div>
                      )}
                      {mapping.namaste_terms.unani.romanized_name && (
                        <div className="detail-item">
                          <span className="detail-label">Romanized Name:</span>
                          <span className="detail-value">{mapping.namaste_terms.unani.romanized_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {mapping.icd_mapping && (
              <div className="details-section">
                <h3>ICD-11 Mapping</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Code:</span>
                    <span className="detail-value">{mapping.icd_mapping.code}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Title:</span>
                    <span className="detail-value">{mapping.icd_mapping.title}</span>
                  </div>
                  {mapping.icd_mapping.foundation_uri && (
                    <div className="detail-item">
                      <span className="detail-label">Foundation URI:</span>
                      <span className="detail-value">
                        <a href={mapping.icd_mapping.foundation_uri} target="_blank" rel="noopener noreferrer">
                          {mapping.icd_mapping.foundation_uri}
                        </a>
                      </span>
                    </div>
                  )}
                  {mapping.icd_mapping.chapter_no && (
                    <div className="detail-item">
                      <span className="detail-label">Chapter Number:</span>
                      <span className="detail-value">{mapping.icd_mapping.chapter_no}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">Similarity Score:</span>
                    <span className="detail-value">{(mapping.icd_mapping.similarity_score * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="details-section">
              <h3>Additional Information</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Mapping ID:</span>
                  <span className="detail-value">{mapping.mapping_id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Fuzzy Similarity:</span>
                  <span className="detail-value">{(mapping.fuzzy_similarity * 100).toFixed(1)}%</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Confidence Score:</span>
                  <span className="detail-value">{(mapping.confidence_score * 100).toFixed(1)}%</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Created At:</span>
                  <span className="detail-value">
                    {new Date(mapping.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MappingDetailsPage;