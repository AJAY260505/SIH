import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './SearchPage.css';

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

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('all');
  const [minConfidence, setMinConfidence] = useState(0.1);
  const [results, setResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [hasSearched, setHasSearched] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [theme, setTheme] = useState('light');
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const API_BASE_URL = "https://ayushbandan.duckdns.org";

  // Theme toggle effect
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Fetch autocomplete suggestions using combined search
  const fetchSuggestions = async (term) => {
    if (!term || term.length < 2) {
      setSuggestions([]);
      setRecommendations([]);
      return;
    }

    try {
      const data = await fetchData(
        `${API_BASE_URL}/terminologies/search/combined/?q=${encodeURIComponent(term)}&fuzzy=true&threshold=0.2&page_size=5`
      );

      if (data && data.results) {
        const allSuggestions = data.results.map((item, index) => ({
          name: item.title,
          type: 'combined',
          confidence: item.search_score || 0.8,
          id: item.id,
          system: 'icd11',
          definition: item.definition
        }));

        setSuggestions(allSuggestions);
        setRecommendations(allSuggestions.slice(0, 3));
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
      setRecommendations([]);
    }
  };

  // Perform comprehensive search across all systems
  const performSearch = async ({ term = searchTerm, system = selectedSystem, confidence = minConfidence } = {}) => {
    if (!term || !term.trim()) return;

    setIsSearching(true);
    try {
      // Fetch data from all endpoints
      const [combinedData, ayurvedaData, unaniData, siddhaData, icd11Data] = await Promise.all([
        fetchData(`${API_BASE_URL}/terminologies/search/combined/?q=${encodeURIComponent(term)}&fuzzy=true&threshold=0.2&page_size=50`),
        fetchData(`${API_BASE_URL}/terminologies/ayurveda/search/?q=${encodeURIComponent(term)}&threshold=0.1`),
        fetchData(`${API_BASE_URL}/terminologies/unani/search/?q=${encodeURIComponent(term)}&threshold=0.1`),
        fetchData(`${API_BASE_URL}/terminologies/siddha/search/?q=${encodeURIComponent(term)}&threshold=0.1`),
        fetchData(`${API_BASE_URL}/terminologies/icd11/search/?q=${encodeURIComponent(term)}&fuzzy=true&threshold=0.2&page_size=50`)
      ]);

      // Transform all data into a unified structure
      const transformedData = {
        combined: combinedData,
        ayurveda: ayurvedaData,
        unani: unaniData,
        siddha: siddhaData,
        icd11: icd11Data,
        // Create mapping results from combined data
        mappingResults: combinedData?.results ? combinedData.results.map(item => ({
          mapping_id: item.id,
          source_term: {
            code: item.code,
            english_name: item.title,
            hindi_name: null
          },
          namaste_terms: {
            ayurveda: item.related_ayurveda ? {
              code: item.related_ayurveda.code,
              english_name: item.related_ayurveda.english_name,
              local_name: item.related_ayurveda.local_name
            } : null,
            siddha: item.related_siddha ? {
              code: item.related_siddha.code,
              english_name: item.related_siddha.english_name,
              local_name: item.related_siddha.local_name
            } : null,
            unani: item.related_unani ? {
              code: item.related_unani.code,
              english_name: item.related_unani.english_name,
              local_name: item.related_unani.local_name
            } : null
          },
          icd_mapping: {
            code: item.code,
            title: item.title,
            definition: item.definition,
            class_kind: item.class_kind,
            foundation_uri: item.foundation_uri
          },
          confidence_score: item.mapping_info?.confidence_score || item.search_score || 0.7,
          search_score: item.search_score
        })) : []
      };

      setResults(transformedData);
      setHasSearched(true);
    } catch (error) {
      console.error("Search error:", error);
      setResults({ 
        combined: { results: [] },
        ayurveda: { results: [] },
        unani: { results: [] },
        siddha: { results: [] },
        icd11: { results: [] },
        mappingResults: [] 
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    await performSearch({ term: searchTerm, system: selectedSystem, confidence: minConfidence });
  };

  useEffect(() => {
    if (!hasSearched) return;
    if (!searchTerm || !searchTerm.trim()) return;

    const debounceMs = 300;
    const timer = setTimeout(() => {
      performSearch({ term: searchTerm, system: selectedSystem, confidence: minConfidence });
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [selectedSystem, minConfidence]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, 200);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleViewDetails = async (mapping, systemType = 'combined') => {
    setIsSearching(true);
    const specificTerm = mapping.source_term?.english_name || mapping.title || mapping.english_name || searchTerm;
    
    try {
      // Fetch comprehensive data for detailed view
      const [combinedData, ayurvedaData, unaniData, siddhaData, icd11Data] = await Promise.all([
        fetchData(`${API_BASE_URL}/terminologies/search/combined/?q=${encodeURIComponent(specificTerm)}&fuzzy=true&threshold=0.2&page_size=20`),
        fetchData(`${API_BASE_URL}/terminologies/ayurveda/search/?q=${encodeURIComponent(specificTerm)}&threshold=0.1`),
        fetchData(`${API_BASE_URL}/terminologies/unani/search/?q=${encodeURIComponent(specificTerm)}&threshold=0.1`),
        fetchData(`${API_BASE_URL}/terminologies/siddha/search/?q=${encodeURIComponent(specificTerm)}&threshold=0.1`),
        fetchData(`${API_BASE_URL}/terminologies/icd11/search/?q=${encodeURIComponent(specificTerm)}&fuzzy=true&threshold=0.2&page_size=20`)
      ]);

      navigate('/mapping-details', { 
        state: { 
          mapping, 
          systemType,
          searchParams: { system: selectedSystem, query: specificTerm, min_confidence: minConfidence },
          additionalData: { 
            combined: combinedData,
            ayurveda: ayurvedaData, 
            unani: unaniData, 
            siddha: siddhaData,
            icd11: icd11Data
          },
          searchTerm: specificTerm,
          source: 'comprehensive-search'
        } 
      });
    } catch (error) {
      console.error("Error fetching additional data:", error);
      navigate('/mapping-details', { 
        state: { 
          mapping, 
          systemType,
          searchParams: { system: selectedSystem, query: specificTerm, min_confidence: minConfidence },
          searchTerm: specificTerm,
          source: 'comprehensive-search'
        } 
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleRowViewDetails = (mapping) => {
    handleViewDetails(mapping, 'mapping');
  };

  const handleSystemResultClick = (result, system) => {
    handleViewDetails(result, system);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.name);
    setShowSuggestions(false);
    performSearch({ term: suggestion.name, system: selectedSystem, confidence: minConfidence });
  };

  // Fixed: Navigate to specific system pages instead of system-results
  const handleSystemCardClick = (system) => {
    navigate(`/${system}`);
  };

  // Get result counts for overview
  const getResultCounts = () => {
    if (!results) return { combined: 0, ayurveda: 0, unani: 0, siddha: 0, icd11: 0 };
    
    return {
      combined: results.combined?.results?.length || 0,
      ayurveda: results.ayurveda?.results?.length || results.ayurveda?.count || 0,
      unani: results.unani?.results?.length || results.unani?.count || 0,
      siddha: results.siddha?.results?.length || results.siddha?.count || 0,
      icd11: results.icd11?.results?.length || results.icd11?.count || 0
    };
  };

  const resultCounts = getResultCounts();
  const totalResults = Object.values(resultCounts).reduce((sum, count) => sum + count, 0);

  const renderSystemResults = (systemData, systemName) => {
    if (!systemData?.results?.length) {
      return (
        <div className="no-results">
          <p>No {systemName} data available for "{searchTerm}".</p>
        </div>
      );
    }

    return (
      <div className="system-results-section">
        <h3>{systemName} Results ({systemData.results.length})</h3>
        <div className="table-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>English Name</th>
                {systemName === 'Ayurveda' && <th>Hindi Name</th>}
                {systemName === 'Ayurveda' && <th>Diacritical Name</th>}
                {systemName === 'Unani' && <th>Arabic Name</th>}
                {systemName === 'Unani' && <th>Romanized Name</th>}
                {systemName === 'Siddha' && <th>Tamil Name</th>}
                {systemName === 'Siddha' && <th>Romanized Name</th>}
                {systemName === 'ICD-11' && <th>Class Kind</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {systemData.results.slice(0, 10).map((result, index) => (
                <motion.tr 
                  key={result.id || index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="result-row"
                >
                  <td>{result.code || "N/A"}</td>
                  <td className="term-name">{result.english_name || result.title || "N/A"}</td>
                  {systemName === 'Ayurveda' && (
                    <>
                      <td>{result.hindi_name || "-"}</td>
                      <td>{result.diacritical_name || "-"}</td>
                    </>
                  )}
                  {systemName === 'Unani' && (
                    <>
                      <td>{result.arabic_name || "-"}</td>
                      <td>{result.romanized_name || "-"}</td>
                    </>
                  )}
                  {systemName === 'Siddha' && (
                    <>
                      <td>{result.tamil_name || "-"}</td>
                      <td>{result.romanized_name || "-"}</td>
                    </>
                  )}
                  {systemName === 'ICD-11' && (
                    <td>{result.class_kind || "-"}</td>
                  )}
                  <td>
                    <button 
                      className="view-details-btn"
                      onClick={() => handleSystemResultClick(result, systemName.toLowerCase())}
                    >
                      View Details
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {systemData.results.length > 10 && (
            <div className="view-more-section">
              <p>Showing 10 of {systemData.results.length} results</p>
              <button 
                className="view-more-btn"
                onClick={() => handleSystemCardClick(systemName.toLowerCase())}
              >
                View All {systemName} Results
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="search-page">
      <div className="container">
        {/* Header with Theme Toggle */}
        <motion.div
          className="hero-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="search-head">Find Traditional Medicine Mappings</h1>
          <p className="hero-subtitle">Discover connections between traditional medicine systems and modern medical classifications</p>
        </motion.div>
        
        <motion.form 
          onSubmit={handleSearch} 
          className="search-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="search-input-container">
            <div className="autocomplete-wrapper" ref={suggestionsRef}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Enter disease or condition (e.g., fever, diabetes)"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="search-input-large"
                required
              />
              
              {/* Combined Suggestions and Recommendations Dropdown */}
              <AnimatePresence>
                {showSuggestions && (suggestions.length > 0 || recommendations.length > 0) && (
                  <motion.div 
                    className="suggestions-dropdown"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {suggestions.length > 0 ? (
                      <>
                        <div className="dropdown-label">Search Suggestions</div>
                        {suggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="suggestion-item"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            <div className="suggestion-content">
                              <span className="suggestion-text">{suggestion.name}</span>
                              <span className="suggestion-type">ICD-11 Term</span>
                            </div>
                            <span className="suggestion-confidence">
                              {Math.round(suggestion.confidence * 100)}%
                            </span>
                          </div>
                        ))}
                      </>
                    ) : recommendations.length > 0 ? (
                      <div className="recommendations-section">
                        <div className="dropdown-label">Top Recommendations</div>
                        {recommendations.map((recommendation, index) => (
                          <div
                            key={index}
                            className="suggestion-item recommendation-item"
                            onClick={() => handleSuggestionClick(recommendation)}
                          >
                            <div className="suggestion-content">
                              <span className="suggestion-text">{recommendation.name}</span>
                              <span className="suggestion-type">Recommended</span>
                            </div>
                            <span className="suggestion-confidence">
                              {Math.round(recommendation.confidence * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <motion.button 
              type="submit" 
              className="search-button-large"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSearching}
            >
              {isSearching ? (
                <div className="loading-spinner"></div>
              ) : (
                <span>Search</span>
              )}
            </motion.button>
          </div>

          <div className="filters-container">
            <div className="filter-group">
              <label className="filter-label">Search Scope</label>
              <div className="filter-buttons">
                {['all', 'combined', 'ayurveda', 'siddha', 'unani', 'icd11'].map((system) => (
                  <button 
                    key={system}
                    type="button"
                    className={`filter-btn ${selectedSystem === system ? 'active' : ''}`}
                    onClick={() => setSelectedSystem(system)}
                  >
                    {system === 'all' ? 'All Systems' : 
                     system === 'combined' ? 'ICD-11 Mappings' :
                     system.charAt(0).toUpperCase() + system.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.form>

        <AnimatePresence>
          {results && (
            <motion.div 
              className="results-section"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="results-header">
                <h2 className="results-title">
                  {totalResults > 0 
                    ? `Found ${totalResults} total results for "${searchTerm}" across all systems`
                    : `No results found for "${searchTerm}"`
                  }
                </h2>
                
                {totalResults > 0 && (
                  <div className="results-overview">
                    <div className="results-summary">
                      {Object.entries(resultCounts).map(([system, count]) => (
                        count > 0 && (
                          <span key={system} className="system-count">
                            {system.charAt(0).toUpperCase() + system.slice(1)}: {count}
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {totalResults > 0 ? (
                <div className="comprehensive-results">
                  {/* Combined/ICD-11 Mappings */}
                  {results.mappingResults.length > 0 && (
                    <div className="mapping-results-section">
                      <h3>ICD-11 Mappings with Traditional Medicine ({results.mappingResults.length})</h3>
                      <div className="table-container">
                        <table className="results-table">
                          <thead>
                            <tr>
                              <th>ICD-11 Term</th>
                              <th>Definition</th>
                              <th>Ayurveda</th>
                              <th>Siddha</th>
                              <th>Unani</th>
                              <th>Confidence</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {results.mappingResults.slice(0, 10).map((mapping, index) => (
                              <motion.tr 
                                key={mapping.mapping_id || index}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="result-row"
                              >
                                <td>
                                  <div className="term-display">
                                    <div className="term-code">{mapping.source_term.code}</div>
                                    <div className="term-name">{mapping.source_term.english_name}</div>
                                  </div>
                                </td>
                                
                                <td>
                                  <div className="definition-preview">
                                    {mapping.icd_mapping.definition 
                                      ? `${mapping.icd_mapping.definition.substring(0, 100)}...`
                                      : 'No definition available'
                                    }
                                  </div>
                                </td>
                                
                                {['ayurveda', 'siddha', 'unani'].map((system) => (
                                  <td key={system}>
                                    {mapping.namaste_terms[system] ? (
                                      <div className="term-display">
                                        <div className="term-code">{mapping.namaste_terms[system].code}</div>
                                        <div className="term-name">{mapping.namaste_terms[system].english_name}</div>
                                        {mapping.namaste_terms[system].local_name && (
                                          <div className="term-translation">{mapping.namaste_terms[system].local_name}</div>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="no-data">-</span>
                                    )}
                                  </td>
                                ))}
                                
                                <td>
                                  <div className="confidence-display">
                                    <div className="confidence-value">{(mapping.confidence_score * 100).toFixed(1)}%</div>
                                    <div className="confidence-bar">
                                      <div 
                                        className="confidence-fill"
                                        style={{ width: `${mapping.confidence_score * 100}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </td>
                                
                                <td>
                                  <button 
                                    className="view-details-btn"
                                    onClick={() => handleRowViewDetails(mapping)}
                                    title={`View details for ${mapping.source_term.english_name}`}
                                  >
                                    View Details
                                  </button>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                        {results.mappingResults.length > 10 && (
                          <div className="view-more-section">
                            <p>Showing 10 of {results.mappingResults.length} mappings</p>
                            <button 
                              className="view-more-btn"
                              onClick={() => handleSystemCardClick('combined')}
                            >
                              View All Mappings
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Individual System Results */}
                  {resultCounts.ayurveda > 0 && renderSystemResults(results.ayurveda, 'Ayurveda')}
                  {resultCounts.unani > 0 && renderSystemResults(results.unani, 'Unani')}
                  {resultCounts.siddha > 0 && renderSystemResults(results.siddha, 'Siddha')}
                  {resultCounts.icd11 > 0 && renderSystemResults(results.icd11, 'ICD-11')}
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

    <motion.div 
  className="quick-access-section"
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  transition={{ duration: 0.8 }}
  viewport={{ once: true }}
>
  <h3 className="section-title">Quick Access</h3>
  <div className="system-grid">
    {[
      { id: "ayurveda", name: "Ayurveda", desc: "Ancient Indian system of natural healing", img: "img1.png" },
      { id: "siddha", name: "Siddha", desc: "Traditional Tamil system of medicine", img: "img2.png" },
      { id: "unani", name: "Unani", desc: "Greco-Arabic system of medicine", img: "img3.png" },
      { id: "icd11", name: "ICD-11", desc: "International Classification of Diseases", img: "img4.png" }
    ].map((system) => (
      <motion.div 
        key={system.id}
        className="system-card"
        whileHover={{ y: -5, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleSystemCardClick(system.id)}
      >
        <img 
          src={system.img} 
          alt={system.name} 
          className="system-icon" 
        />
        <h4>{system.name}</h4>
        <p>{system.desc}</p>
        <div className="system-action">Browse {system.name} →</div>
      </motion.div>
    ))}
  </div>
</motion.div>

      </div>
    </div>
  );
};

export default SearchPage;