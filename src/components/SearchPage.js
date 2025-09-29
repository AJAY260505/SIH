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
  const [loadingMappingId, setLoadingMappingId] = useState(null);

  const [hasSearched, setHasSearched] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [theme, setTheme] = useState('light');
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const API_BASE_URL = "https://ayushbandan.duckdns.org";

  // Search strategy state
  const [searchStrategy, setSearchStrategy] = useState({
    fuzzy: true,
    fullText: false
  });

  // Progressive loading states
  const [loadingProgress, setLoadingProgress] = useState({
    combined: false,
    suggestions: false
  });

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

  // Toggle search strategies
  const toggleSearchStrategy = (strategy) => {
    if (strategy === 'fuzzy') {
      setSearchStrategy(prev => ({
        fuzzy: !prev.fuzzy,
        fullText: prev.fuzzy ? prev.fullText : false
      }));
    } else if (strategy === 'fullText') {
      setSearchStrategy(prev => ({
        fuzzy: prev.fullText ? prev.fuzzy : false,
        fullText: !prev.fullText
      }));
    }
  };

  // Optimized URL builder with faster parameters
  const buildSearchUrl = (term, endpoint = 'combined') => {
    const baseUrl = `${API_BASE_URL}/terminologies/search/${endpoint}/?q=${encodeURIComponent(term)}`;
    const params = new URLSearchParams();
    
    if (searchStrategy.fuzzy) {
      params.append('fuzzy', 'true');
      params.append('threshold', '0.4'); // Increased threshold for faster, more relevant results
    }
    
    if (searchStrategy.fullText) {
      params.append('use_fts', 'true');
    }
    
    // Reduced page size for faster initial load
    params.append('page_size', '15');
    
    return `${baseUrl}&${params.toString()}`;
  };

  // Ultra-fast suggestions fetch with minimal data
  const fetchSuggestions = async (term) => {
    if (!term || term.length < 2) {
      setSuggestions([]);
      setRecommendations([]);
      return;
    }

    try {
      setLoadingProgress(prev => ({ ...prev, suggestions: true }));
      
      // Use minimal parameters for fastest response
      const url = `${API_BASE_URL}/terminologies/search/combined/?q=${encodeURIComponent(term)}&fuzzy=true&threshold=0.5&page_size=5`;
      const data = await fetchData(url);

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
        // Set recommendations immediately from first 3 results
        setRecommendations(allSuggestions.slice(0, 3));
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
      setRecommendations([]);
    } finally {
      setLoadingProgress(prev => ({ ...prev, suggestions: false }));
    }
  };

  // Optimized search - only load combined data
  const performSearch = async ({ term = searchTerm, system = selectedSystem, confidence = minConfidence } = {}) => {
    if (!term || !term.trim()) return;

    setIsSearching(true);
    
    // Initialize results structure immediately
    setResults({
      combined: { results: [] },
      mappingResults: []
    });

    try {
      // Load only combined data for maximum speed
      setLoadingProgress(prev => ({ ...prev, combined: true }));
      const combinedUrl = buildSearchUrl(term, 'combined');
      const combinedData = await fetchData(combinedUrl);
      
      // Transform and set combined data immediately
      const mappingResults = combinedData?.results ? combinedData.results.map(item => ({
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
      })) : [];

      setResults({
        combined: combinedData || { results: [] },
        mappingResults
      });
      setLoadingProgress(prev => ({ ...prev, combined: false }));
      setHasSearched(true);

    } catch (error) {
      console.error("Search error:", error);
      setResults({ 
        combined: { results: [] },
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

  // Optimized useEffect for search with better debouncing
  useEffect(() => {
    if (!hasSearched) return;
    if (!searchTerm || !searchTerm.trim()) return;

    const debounceMs = 500; // Increased debounce for better performance
    const timer = setTimeout(() => {
      performSearch({ term: searchTerm, system: selectedSystem, confidence: minConfidence });
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [selectedSystem, minConfidence, searchStrategy]);

  // Faster suggestions with optimized debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        fetchSuggestions(searchTerm);
      } else {
        setSuggestions([]);
        setRecommendations([]);
      }
    }, 100); // Reduced debounce for faster suggestions

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Optimized detailed view handler
  const handleViewDetails = async (mapping, systemType = 'combined') => {
    const specificTerm = mapping.source_term?.english_name || mapping.title || mapping.english_name || searchTerm;
    
    // Navigate immediately with available data
    navigate('/mapping-details', { 
      state: { 
        mapping, 
        systemType,
        searchParams: { 
          system: selectedSystem, 
          query: specificTerm, 
          min_confidence: minConfidence,
          search_strategy: searchStrategy 
        },
        searchTerm: specificTerm,
        source: 'comprehensive-search'
      } 
    });
  };

  const handleRowViewDetails = async (mapping) => {
    setLoadingMappingId(mapping.mapping_id);
    await handleViewDetails(mapping, 'mapping');
    setLoadingMappingId(null);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.name);
    setShowSuggestions(false);
    performSearch({ term: suggestion.name, system: selectedSystem, confidence: minConfidence });
  };

  const handleSystemCardClick = (system) => {
    navigate(`/${system}`);
  };

  // Get result count - only combined now
  const getResultCount = () => {
    if (!results) return 0;
    return results.combined?.results?.length || 0;
  };

  const totalResults = getResultCount();

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
                {showSuggestions && (suggestions.length > 0 || recommendations.length > 0 || loadingProgress.suggestions) && (
                  <motion.div 
                    className="suggestions-dropdown"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {loadingProgress.suggestions ? (
                      <div className="suggestions-loading">
                        <div className="spinner-small"></div>
                        <span>Loading suggestions...</span>
                      </div>
                    ) : suggestions.length > 0 ? (
                      <>
                        <div className="dropdown-label">Search Suggestions</div>
                        {suggestions.slice(0, 5).map((suggestion, index) => ( // Limit suggestions for faster render
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

          {/* Search Strategy Filters */}
          <div className="filters-container">
            <div className="filter-group">
              <label className="filter-label">Search Strategy</label>
              <div className="filter-buttons">
                <button 
                  type="button"
                  className={`filter-btn ${searchStrategy.fuzzy ? 'active' : ''}`}
                  onClick={() => toggleSearchStrategy('fuzzy')}
                >
                  Fuzzy Search
                </button>
                <button 
                  type="button"
                  className={`filter-btn ${searchStrategy.fullText ? 'active' : ''}`}
                  onClick={() => toggleSearchStrategy('fullText')}
                >
                  Full-Text Search
                </button>
              </div>
              <div className="search-strategy-info">
                {searchStrategy.fuzzy && searchStrategy.fullText ? (
                  <span className="strategy-info-text">
                    Using both Fuzzy and Full-Text search      
                  </span>
                ) : searchStrategy.fuzzy ? (
                  <span className="strategy-info-text">
                    Using Fuzzy search with trigram similarity   
                  </span>
                ) : searchStrategy.fullText ? (
                  <span className="strategy-info-text">
                    Using Full-Text search with search vector  
                  </span>
                ) : (
                  <span className="strategy-info-text warning">
                    Please select at least one search strategy  
                  </span>
                )}
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
                <div className="active-strategies">
                  {searchStrategy.fuzzy && (
                    <span className="strategy-badge fuzzy">Fuzzy Search</span>
                  )}
                  {searchStrategy.fullText && (
                    <span className="strategy-badge fulltext">Full-Text Search</span>
                  )}
                </div>
                
                {totalResults > 0 && (
                  <div className="results-overview">
                    <div className="results-summary">
                      <span className="system-count">
                        Found {totalResults} results
                        {loadingProgress.combined && <span className="loading-dot"></span>}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {totalResults > 0 ? (
                <div className="comprehensive-results">
                  {/* Combined/ICD-11 Mappings - Show immediately */}
                  {results.mappingResults.length > 0 && (
                    <div className="mapping-results-section">
                      <div className="section-header">
                        <h3>ICD-11 Mappings with Traditional Medicine ({results.mappingResults.length})</h3>
                        {loadingProgress.combined && (
                          <div className="section-loading">
                            <div className="spinner-small"></div>
                            <span>Loading more results...</span>
                          </div>
                        )}
                      </div>
                      <div className="table-container">
                        <table className="results-table">
                          <thead>
                            <tr>
                              <th>ICD-11 code</th>
                              <th>NAME</th>
                              <th>Ayurveda</th>
                              <th>Siddha</th>
                              <th>Unani</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {results.mappingResults.slice(0, 10).map((mapping, index) => ( // Show more results since we're faster
                              <motion.tr 
                                key={mapping.mapping_id || index}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.02 }} // Faster animation
                                className="result-row"
                              >
                                <td>
                                  <div className="term-display">
                                    <div className="term-code">{mapping.source_term.code}</div>
                                  </div>
                                </td>
                                <td>
                                  <div className="term-display">
                                    <div className="term-name">{mapping.source_term.english_name}</div>
                                    {mapping.icd_mapping.definition && (
                                      <div className="term-definition-preview">
                                        {mapping.icd_mapping.definition.substring(0, 80)}...
                                      </div>
                                    )}
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
                                  <button 
                                    className="view-details-btn"
                                    onClick={() => handleRowViewDetails(mapping)}
                                    disabled={loadingMappingId === mapping.mapping_id}
                                    title={`View details for ${mapping.source_term.english_name}`}
                                  >
                                    {loadingMappingId === mapping.mapping_id ? (
                                      <div className="loading-spinner"></div>
                                    ) : (
                                      "View Details"
                                    )}
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
                              onClick={() => performSearch({ term: searchTerm })}
                            >
                              Load More Results
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : hasSearched && !isSearching ? (
                <div className="no-results-message">
                  <h3>No results found for "{searchTerm}"</h3>
                  <p>Try adjusting your search terms or using different search strategies.</p>
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