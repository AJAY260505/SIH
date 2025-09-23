import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SystemCard from './SystemCard';
import './SystemPage.css';

// API fetch utility
const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

const SystemPage = ({ systemName }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;
  const navigate = useNavigate();

  const systemData = {
    ayurveda: {
      title: "Ayurveda",
      description: "Ancient Indian system of natural and holistic healing",
      image: "/img5.png",
      endpoint: "http://localhost:8000/terminologies/ayurveda/search/?q="
    },
    siddha: {
      title: "Siddha",
      description: "One of the oldest traditional medicine systems from South India",
      image: "/img3.png",
      endpoint: "http://localhost:8000/terminologies/siddha/search/?q="
    },
    unani: {
      title: "Unani",
      description: "Greco-Arabic system of medicine based on the teachings of Hippocrates",
      image: "/img3.png",
      endpoint: "http://localhost:8000/terminologies/unani/search/?q="
    },
    icd11: {
      title: "ICD-11",
      description: "International Classification of Diseases 11th Revision",
      image: "/img4.png",
      endpoint: "http://localhost:8000/terminologies/icd11/search/?q="
    }
  };

  const system = systemData[systemName];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setCurrentPage(1);

    try {
      const data = await fetchData(`${system.endpoint}${encodeURIComponent(searchTerm)}`);
      if (data && data.results) setResults(Array.isArray(data.results) ? data.results : []);
      else if (Array.isArray(data)) setResults(data);
      else setResults([]);
    } catch (error) {
      console.error(`${system.title} search error:`, error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRowClick = (item) => {
    navigate('/view-details', { state: { item, system: system.title, query: searchTerm } });
  };

  const getTableHeaders = (items) => {
    if (!items || items.length === 0) return [];
    return Object.keys(items[0]);
  };

  // Strict pagination
  const totalPages = Math.ceil(results.length / resultsPerPage);
  const currentResults = results.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="system-page">
      <div className="containers">
        {/* System Header */}
        <motion.div className="system-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <motion.div className="system-icon-large" animate={{ rotate: 360 }} transition={{ duration: 2, repeat: 0 }}>
            <img src={system.image} alt={system.title} style={{ width: '120px', height: '120px', objectFit: 'contain', borderRadius: "80px" }} />
          </motion.div>
          <div className="system-info">
            <h2>{system.title}</h2>
            <p>{system.description}</p>
          </div>
        </motion.div>

        {/* Search Form */}
        <motion.form onSubmit={handleSearch} className="search-forms" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <input
            type="text"
            placeholder={`Search ${system.title} treatments (e.g., fever, diabetes)`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-inputs"
          />
          <motion.button type="submit" className="search-buttons" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={isSearching}>
            {isSearching ? <div className="loading-spinner"></div> : "Search"}
          </motion.button>
        </motion.form>

        {/* Results Table */}
        {results.length > 0 && (
          <motion.div className="system-results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h3>{system.title} Treatments for "{searchTerm}"</h3>

            <div className="mapping-table-container">
              <table className="mapping-table">
                <thead>
                  <tr>{getTableHeaders(currentResults).map((key) => (<th key={key}>{key}</th>))}</tr>
                </thead>
                <tbody>
                  {currentResults.map((item, idx) => (
                    <motion.tr key={item.code || item.id || idx} className="mapping-row clickable-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }} onClick={() => handleRowClick(item)}>
                      {getTableHeaders(currentResults).map((key) => (
                        <td key={key}>{typeof item[key] === 'object' ? JSON.stringify(item[key]) : item[key] ?? '-'}</td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button onClick={() => handlePageChange(Math.max(currentPage - 1, 1))} disabled={currentPage === 1}>&lt; Prev</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={currentPage === i + 1 ? 'active-page' : ''}
                  >
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages}>Next &gt;</button>
              </div>
            )}
          </motion.div>
        )}

        {/* About & Key Benefits (Always visible) */}
        <motion.div className="system-info-content" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
          <h3>About {system.title}</h3>
          <p>
            {system.title} is a {system.title === 'ICD-11' ? 'modern international standard' : 'traditional system of medicine'} with {
              system.title === 'ICD-11'
                ? ' global recognition for disease classification and health reporting.'
                : ' historical roots in the Indian subcontinent. The system integrates natural elements and holistic approaches to prevent and treat health conditions.'
            }
          </p>
          <div className="system-benefits">
            <h4>Key Benefits</h4>
            <ul>
              {system.title === 'ICD-11' ? (
                <>
                  <li>Global standard for health reporting</li>
                  <li>Comprehensive disease classification</li>
                  <li>Digital-ready structure</li>
                  <li>Integration with traditional medicine systems</li>
                </>
              ) : (
                <>
                  <li>Holistic approach to wellness</li>
                  <li>Natural and minimal side effects</li>
                  <li>Personalized treatments based on individual constitution</li>
                  <li>Focus on prevention and health maintenance</li>
                </>
              )}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SystemPage;
