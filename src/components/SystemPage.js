import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SystemCard from './SystemCard';
import './SystemPage.css';

// API fetch utility function
const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

const SystemPage = ({ systemName }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
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
      endpoint: "http://localhost/icd/release/11/2025-01/mms/search?q="
    }
  };

  const system = systemData[systemName];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    
    try {
      const data = await fetchData(`${system.endpoint}${encodeURIComponent(searchTerm)}`);
      
      if (data && data.results) {
        if (Array.isArray(data.results)) {
          setResults(data.results);
        } else if (Array.isArray(data)) {
          setResults(data);
        } else {
          setResults(Array.isArray(data.results) ? data.results : []);
        }
        console.log(`${system.title} API Response:`, data);
      } else if (Array.isArray(data)) {
        setResults(data);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error(`${system.title} search error:`, error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRowClick = (item) => {
    navigate('/mapping-details', {
      state: {
        item,
        system: systemName,
        query: searchTerm
      }
    });
  };

  const getTableHeaders = (items) => {
    if (!items || items.length === 0) return [];
    return Object.keys(items[0]);
  };

  return (
    <div className="system-page">
      <div className="container">
        <motion.div className="system-header">
          <div className="system-icon-large">
            <img 
              src={system.image} 
              alt={system.title} 
              style={{ width: '120px', height: '120px', objectFit: 'contain', borderRadius: "80px" }}
            />
          </div>
          <div className="system-info">
            <h2>{system.title}</h2>
            <p>{system.description}</p>
          </div>
        </motion.div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="search-forms">
          <input
            type="text"
            placeholder={`Search ${system.title} treatments`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-inputs"
          />
          <button type="submit" className="search-buttons" disabled={isSearching}>
            {isSearching ? <div className="loading-spinner"></div> : "Search"}
          </button>
        </form>

        {/* Results */}
        <AnimatePresence>
          {results && results.length > 0 && (
            <div className="system-results">
              <h3>{system.title} Treatments for "{searchTerm}"</h3>
              <div className="mapping-table-container">
                <table className="mapping-table">
                  <thead>
                    <tr>
                      {getTableHeaders(results).map((key) => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((item, idx) => (
                      <tr
                        key={idx}
                        className="mapping-row clickable-row"
                        onClick={() => handleRowClick(item)}
                      >
                        {getTableHeaders(results).map((key) => (
                          <td key={key}>
                            {typeof item[key] === 'object' 
                              ? JSON.stringify(item[key]) 
                              : item[key] ?? '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Card Grid */}
              <div className="results-grid">
                {results.map((item, index) => (
                  <div key={index} onClick={() => handleRowClick(item)} style={{ cursor: "pointer" }}>
                    <SystemCard item={item} system={system.title} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SystemPage;
