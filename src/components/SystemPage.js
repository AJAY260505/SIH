import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './SystemPage.css';

// ----------  utility  ----------
const fetchData = async (url) => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('fetch error', e);
    return null;
  }
};

// ----------  main component  ----------
const SystemPage = ({ systemName }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [suggPage, setSuggPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [uploadRes, setUploadRes] = useState(null);
  const resultsPerPage = 10;
  const suggPerPage = 10;
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const dropdownRef = useRef(null);

  // ----------  system config  ----------
  const systemData = {
    ayurveda: {
      title: 'Ayurveda',
      description: 'Ancient Indian system of natural and holistic healing',
      image: '/img5.png',
      searchEp: 'http://localhost:8000/terminologies/ayurveda/search/?q=',
      csvEp: 'http://localhost:8000/terminologies/ayurveda/csv/upload/',
      autoEp: 'http://localhost:8000/terminologies/ayurveda/autocomplete/?q=',
      about: `Ayurveda, the "science of life", is a 5,000-year-old healing tradition...`,
      benefits: [
        'Truly personalised medicine based on your unique mind-body type',
        'Natural herbs & oils – minimal side-effects, gentle detox',
        'Seasonal & daily routines that prevent disease before it starts'
      ]
    },
    siddha: {
      title: 'Siddha',
      description: 'One of the oldest traditional medicine systems from South India',
      image: '/img3.png',
      searchEp: 'http://localhost:8000/terminologies/siddha/search/?q=',
      csvEp: 'http://localhost:8000/terminologies/siddha/csv/upload/',
      autoEp: 'http://localhost:8000/terminologies/siddha/autocomplete/?q=',
      about: `Siddha is a Tamil healing tradition believed to have been transmitted by the 18 Siddhars...`,
      benefits: [
        'Unique Naadi-pariksha (pulse diagnosis) reveals deep imbalances early',
        'Kaya-kalpa therapies that rejuvenate cells and prolong healthy lifespan',
        'Varmam energy-point therapy for instant pain relief & vitality'
      ]
    },
    unani: {
      title: 'Unani',
      description: 'Greco-Arabic system of medicine based on the teachings of Hippocrates',
      image: '/img3.png',
      searchEp: 'http://localhost:8000/terminologies/unani/search/?q=',
      csvEp: 'http://localhost:8000/terminologies/unani/csv/upload/',
      autoEp: 'http://localhost:8000/terminologies/unani/autocomplete/?q=',
      about: `Unani-Tibb is an elegant fusion of Greek, Arabic, Persian and Indian medical wisdom...`,
      benefits: [
        'Temperament-based prescriptions – right drug for the right person',
        'Non-surgical detox via wet-cupping (Hijamat) and leech therapy',
        'Potent herb-mineral syrups (Joshanda, Khamira) for quick relief'
      ]
    },
    icd11: {
      title: 'ICD-11',
      description: 'International Classification of Diseases 11th Revision',
      image: '/img4.png',
      searchEp: 'http://localhost:8000/terminologies/icd11/search/?q=',
      csvEp: null,
      autoEp: 'http://localhost:8000/terminologies/icd11/autocomplete/?q=',
      about: `ICD-11 is the global standard for recording, analysing and reporting health conditions...`,
      benefits: [
        'Global language for disease documentation and tele-medicine',
        'Digital-ready URI-based codes for EHR & mobile apps',
        'Built-in traditional medicine chapter for AYUSH integration'
      ]
    }
  };

  const system = systemData[systemName];

  // ----------  autocomplete with enhanced pagination  ----------
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggTotal, setSuggTotal] = useState(0);
  const [suggLoading, setSuggLoading] = useState(false);
  const [suggTotalPages, setSuggTotalPages] = useState(1);
  const [allSuggestions, setAllSuggestions] = useState([]); // Store ALL suggestions

  // Enhanced fetch suggestions - get ALL data first, then paginate locally
  const fetchAllSuggestions = async (term) => {
    if (!term || term.length < 2) {
      setAllSuggestions([]);
      setSuggestions([]);
      setSuggTotal(0);
      setSuggTotalPages(1);
      return;
    }
    
    setSuggLoading(true);
    try {
      // First, try to get all data with a large limit
      const data = await fetchData(
        `${system.autoEp}${encodeURIComponent(term)}&limit=1000` // Request large limit to get all data
      );
      
      let allData = [];
      if (data && Array.isArray(data.results)) {
        allData = data.results;
      } else if (Array.isArray(data)) {
        allData = data;
      }
      
      setAllSuggestions(allData);
      setSuggTotal(allData.length);
      setSuggTotalPages(Math.ceil(allData.length / suggPerPage));
      
      // Show first page
      updateDisplayedSuggestions(allData, 1);
      
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setAllSuggestions([]);
      setSuggestions([]);
      setSuggTotal(0);
      setSuggTotalPages(1);
    } finally {
      setSuggLoading(false);
    }
  };

  // Update displayed suggestions based on current page
  const updateDisplayedSuggestions = (allData, page) => {
    const startIndex = (page - 1) * suggPerPage;
    const endIndex = startIndex + suggPerPage;
    setSuggestions(allData.slice(startIndex, endIndex));
  };

  // Debounced search for suggestions
  useEffect(() => {
    const t = setTimeout(() => {
      setSuggPage(1);
      fetchAllSuggestions(searchTerm);
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Update displayed suggestions when page changes
  useEffect(() => {
    if (allSuggestions.length > 0) {
      updateDisplayedSuggestions(allSuggestions, suggPage);
    }
  }, [suggPage, allSuggestions]);

  // Close suggestions when clicking outside - FIXED
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ensure dropdown stays visible when suggestions exist
  useEffect(() => {
    if (showSuggestions && suggestions.length > 0 && dropdownRef.current) {
      dropdownRef.current.style.display = 'block';
      dropdownRef.current.style.opacity = '1';
      dropdownRef.current.style.visibility = 'visible';
    }
  }, [showSuggestions, suggestions]);

  // ----------  search  ----------
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setCurrentPage(1);
    
    try {
      const data = await fetchData(`${system.searchEp}${encodeURIComponent(searchTerm)}`);
      
      if (data && data.results) {
        setResults(Array.isArray(data.results) ? data.results : []);
      } else if (Array.isArray(data)) {
        setResults(data);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
      setShowSuggestions(false);
    }
  };

  // Quick search from suggestions
  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    // Auto-search when clicking a suggestion
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  // ----------  csv upload  ----------
  const handleFilePick = () => fileInputRef.current?.click();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (system.csvEp === null) return;
    
    setUploading(true);
    setUploadRes(null);
    
    const form = new FormData();
    form.append('file', file);
    form.append('update_search_vector', 'true');
    
    try {
      const res = await fetch(system.csvEp, { method: 'POST', body: form });
      const json = await res.json();
      setUploadRes(json);
    } catch (err) {
      setUploadRes({ error: 'Network or server error' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // ----------  navigation  ----------
  const handleRowClick = (item) => {
    navigate('/view-details', { 
      state: { 
        item, 
        system: system.title, 
        query: searchTerm,
        timestamp: new Date().toISOString()
      } 
    });
  };

  const getTableHeaders = (items) => {
    if (!items || items.length === 0) return [];
    
    const allKeys = new Set();
    items.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key));
    });
    
    return Array.from(allKeys);
  };

  const renderTableCell = (value) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') {
      return JSON.stringify(value).length > 100 
        ? JSON.stringify(value).substring(0, 100) + '...'
        : JSON.stringify(value);
    }
    if (typeof value === 'string' && value.length > 100) {
      return value.substring(0, 100) + '...';
    }
    return value;
  };

  // ----------  pagination  ----------
  const totalPages = Math.ceil(results.length / resultsPerPage);
  const currentResults = results.slice(
    (currentPage - 1) * resultsPerPage, 
    currentPage * resultsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Enhanced suggestion pagination - now using local pagination
  const handleSuggPage = (page) => {
    if (page < 1 || page > suggTotalPages) return;
    setSuggPage(page);
  };

  const renderSuggPagination = () => {
    if (suggTotalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, suggPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(suggTotalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`sugg-page-btn ${suggPage === i ? 'active' : ''}`}
          onClick={() => handleSuggPage(i)}
        >
          {i}
        </button>
      );
    }

    const startItem = ((suggPage - 1) * suggPerPage) + 1;
    const endItem = Math.min(suggPage * suggPerPage, suggTotal);

    return (
     <div></div>
    );
  };

  // Keyboard navigation for suggestions
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="system-page">
      <div className="containers">
        {/* header */}
        <motion.div className="system-header" >
          <motion.div className="system-icon-large" >
            <img src={system.image} alt={system.title} style={{ width: '120px', height: '120px', objectFit: 'contain', borderRadius: '80px' }} />
          </motion.div>
          <div className="system-info">
            <h2>{system.title}</h2>
            <p>{system.description}</p>
          </div>
        </motion.div>

        {/* search bar with enhanced autocomplete */}
        <motion.form onSubmit={handleSearch} className="search-forms" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <div className="search-input-container">
            <div className="autocomplete-wrapper" ref={suggestionsRef}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder={`Search ${system.title} treatments (e.g., fever, diabetes)`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                className="search-inputs"
              />

              {/* Enhanced suggestions dropdown - FIXED VISIBILITY */}
              {showSuggestions && searchTerm.length >= 2 && (
                <div className="suggestions-dropdown" ref={dropdownRef}>
                  {suggLoading ? (
                    <div className="suggestions-loading">Loading suggestions...</div>
                  ) : suggestions.length > 0 ? (
                    <>
                      {suggestions.map((s, i) => (
                        <div 
                          key={i} 
                          className="suggestion-item" 
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSuggestionClick(s);
                          }}
                          title={`Click to search for "${s}"`}
                        >
                          <span className="suggestion-text">{s}</span>
                        </div>
                      ))}
                      {renderSuggPagination()}
                    </>
                  ) : (
                    <div className="suggestions-empty">No suggestions found for "{searchTerm}"</div>
                  )}
                </div>
              )}
            </div>

            {/* upload icon */}
            {system.csvEp && (
              <div className="upload-group">
                <img
                  src="https://cdn-icons-png.flaticon.com/256/10024/10024501.png"
                  alt="upload"
                  className={`upload-icon ${uploading ? 'uploading' : ''}`}
                  onClick={handleFilePick}
                  title="Upload CSV to update database"
                />
                <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
              </div>
            )}

            <motion.button 
              type="submit" 
              className="search-buttons" 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              disabled={isSearching || !searchTerm.trim()}
            >
              {isSearching ? <div className="loading-spinner" /> : 'Search'}
            </motion.button>
          </div>
        </motion.form>

        {/* upload feedback */}
        <AnimatePresence>
          {uploadRes && (
            <motion.div className="upload-feedback" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {uploadRes.error ? (
                <span className="upload-error">Upload failed: {uploadRes.error}</span>
              ) : (
                <span className="upload-success">
                  <img src="https://i.imgur.com/4QZhF9u.png" alt="success" className="success-tick" />
                  {uploadRes.summary || `Created: ${uploadRes.created || 0} | Updated: ${uploadRes.updated || 0} | Skipped: ${uploadRes.skipped || 0}`}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* enhanced results table */}
        {currentResults.length > 0 && (
          <motion.div className="system-results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h3>
              {system.title} Results for "{searchTerm}" 
              <small style={{ fontSize: '0.8em', marginLeft: '10px', color: 'var(--text-muted)' }}>
                (Showing {((currentPage - 1) * resultsPerPage) + 1}-{Math.min(currentPage * resultsPerPage, results.length)} of {results.length} results)
              </small>
            </h3>
            
            <div className="mapping-table-container">
              <table className="mapping-table">
                <thead>
                  <tr>
                    {getTableHeaders(currentResults).map((k) => (
                      <th key={k}>{k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentResults.map((item, idx) => (
                    <motion.tr 
                      key={item.code || item.id || idx} 
                      className="mapping-row clickable-row" 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      transition={{ delay: idx * 0.03 }} 
                      onClick={() => handleRowClick(item)}
                      title="Click to view details"
                    >
                      {getTableHeaders(currentResults).map((k) => (
                        <td key={k}>{renderTableCell(item[k])}</td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* enhanced pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => handlePageChange(1)} 
                  disabled={currentPage === 1}
                >
                  First
                </button>
                <button 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1}
                >
                  Prev
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button 
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)} 
                      className={currentPage === pageNum ? 'active-page' : ''}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
                <button 
                  onClick={() => handlePageChange(totalPages)} 
                  disabled={currentPage === totalPages}
                >
                  Last
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* about / benefits section */}
        <motion.div className="system-info-content" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
          <h3>About {system.title}</h3>
          <p>{system.about}</p>

          <div className="system-benefits">
            <h4>Key Benefits</h4>
            <ul>
              {system.benefits.map((b, index) => (
                <li key={index}>{b}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SystemPage;