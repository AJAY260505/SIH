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
  const [selectedSystem, setSelectedSystem] = useState('ayurveda');
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

  const API_BASE_URL = "http://localhost:8000";

  // Theme toggle effect
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Fetch autocomplete suggestions
  const fetchSuggestions = async (term) => {
    if (!term || term.length < 2) {
      setSuggestions([]);
      setRecommendations([]);
      return;
    }

    try {
      const data = await fetchData(
        `${API_BASE_URL}/terminologies/mappings/?system=${selectedSystem}&q=${encodeURIComponent(term)}&min_confidence=${minConfidence}&limit=10`
      );

      if (data) {
        const allSuggestions = [
          ...(data.results || []).map(item => ({
            name: item.source_term.english_name,
            type: 'mapped',
            confidence: item.confidence_score,
            id: item.mapping_id
          })),
          ...(data.fuzzy_matches_without_mappings || []).map(item => ({
            name: item.english_name,
            type: 'fuzzy',
            confidence: item.similarity,
            id: item.term_id
          }))
        ]
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 10);

        setSuggestions(allSuggestions);
        setRecommendations(allSuggestions);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
      setRecommendations([]);
    }
  };

  const performSearch = async ({ term = searchTerm, system = selectedSystem, confidence = minConfidence } = {}) => {
    if (!term || !term.trim()) return;

    setIsSearching(true);
    try {
      const data = await fetchData(
        `${API_BASE_URL}/terminologies/mappings/?system=${system}&q=${encodeURIComponent(term)}&min_confidence=${confidence}`
      );

      if (data) {
        setResults(data);
      } else {
        setResults({ results: [], fuzzy_matches_without_mappings: [] });
      }
      setHasSearched(true);
    } catch (error) {
      console.error("Search error:", error);
      setResults({ results: [], fuzzy_matches_without_mappings: [] });
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
  }, [searchTerm, selectedSystem, minConfidence]);

  const handleViewDetails = async (mapping) => {
    setIsSearching(true);
    const specificTerm = mapping.source_term.english_name || searchTerm;
    
    try {
      const [ayurvedaData, unaniData, siddhaData, icd11Data, mappingData] = await Promise.all([
        fetchData(`${API_BASE_URL}/terminologies/ayurveda/search/?q=${encodeURIComponent(specificTerm)}`),
        fetchData(`${API_BASE_URL}/terminologies/unani/search/?q=${encodeURIComponent(specificTerm)}`),
        fetchData(`${API_BASE_URL}/terminologies/siddha/search/?q=${encodeURIComponent(specificTerm)}`),
        fetchData(`${API_BASE_URL}/terminologies/icd11/search/?q=${encodeURIComponent(specificTerm)}&fuzzy=true&threshold=0.3`),
        fetchData(`${API_BASE_URL}/terminologies/mappings/?system=${selectedSystem}&q=${encodeURIComponent(specificTerm)}&min_confidence=${minConfidence}`)
      ]);

      navigate('/mapping-details', { 
        state: { 
          mapping, 
          searchParams: { system: selectedSystem, query: specificTerm, min_confidence: minConfidence },
          additionalData: { ayurveda: ayurvedaData, unani: unaniData, siddha: siddhaData, icd11: icd11Data, mapping: mappingData },
          searchTerm: specificTerm,
          source: 'specific-term'
        } 
      });
    } catch (error) {
      console.error("Error fetching additional data:", error);
      navigate('/mapping-details', { 
        state: { 
          mapping, 
          searchParams: { system: selectedSystem, query: specificTerm, min_confidence: minConfidence },
          searchTerm: specificTerm,
          source: 'specific-term'
        } 
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleRowViewDetails = (mapping) => {
    handleViewDetails(mapping);
  };

  const handleFuzzyViewDetails = async (fuzzyItem) => {
    setIsSearching(true);
    const specificTerm = fuzzyItem.english_name;
    
    try {
      const [ayurvedaData, unaniData, siddhaData, icd11Data, mappingData] = await Promise.all([
        fetchData(`${API_BASE_URL}/terminologies/ayurveda/search/?q=${encodeURIComponent(specificTerm)}`),
        fetchData(`${API_BASE_URL}/terminologies/unani/search/?q=${encodeURIComponent(specificTerm)}`),
        fetchData(`${API_BASE_URL}/terminologies/siddha/search/?q=${encodeURIComponent(specificTerm)}`),
        fetchData(`${API_BASE_URL}/terminologies/icd11/search/?q=${encodeURIComponent(specificTerm)}&fuzzy=true&threshold=0.3`),
        fetchData(`${API_BASE_URL}/terminologies/mappings/?system=${selectedSystem}&q=${encodeURIComponent(specificTerm)}&min_confidence=${minConfidence}`)
      ]);

      navigate('/mapping-details', { 
        state: { 
          item: fuzzyItem,
          source: 'fuzzy-match',
          system: selectedSystem,
          searchTerm: specificTerm,
          additionalData: { ayurveda: ayurvedaData, unani: unaniData, siddha: siddhaData, icd11: icd11Data, mapping: mappingData }
        } 
      });
    } catch (error) {
      console.error("Error fetching fuzzy match data:", error);
      navigate('/mapping-details', { 
        state: { 
          item: fuzzyItem,
          source: 'fuzzy-match',
          system: selectedSystem,
          searchTerm: specificTerm
        } 
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.name);
    setShowSuggestions(false);
    performSearch({ term: suggestion.name, system: selectedSystem, confidence: minConfidence });
  };

  const navigateToSystemPage = (systemId) => {
    navigate(`/${systemId}`, {
      state: { system: systemId, searchTerm: searchTerm || '' }
    });
  };

  const filteredResults = results && results.results ? 
    results.results.filter(item => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'high-confidence') return item.confidence_score >= 0.7;
      if (activeFilter === 'medium-confidence') return item.confidence_score >= 0.4 && item.confidence_score < 0.7;
      if (activeFilter === 'icd-mapped') return item.icd_mapping !== null;
      return true;
    }) : [];

  // System cards data
const systemCards = [
  { 
    id: 'ayurveda', 
    name: 'Ayurveda', 
    desc: 'Ancient Indian system of natural healing with holistic approach to health and wellness', 
    image: '/img5.png'
  },
  { 
    id: 'siddha', 
    name: 'Siddha', 
    desc: 'Traditional Tamil system of medicine emphasizing spiritual enlightenment and longevity', 
    image: '/img1.png'
  },
  { 
    id: 'unani', 
    name: 'Unani', 
    desc: 'Greco-Arabic system of medicine based on the concept of four humors and temperament', 
    image: '/img3.png'
  },
  { 
    id: 'icd11', 
    name: 'ICD-11', 
    desc: 'International Classification of Diseases - global standard for health reporting and statistics', 
    image: '/img4.png'
  }
];
  return (
    <div className="search-page">
      <div className="containers">
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
            <div className="autocomplete-wrapper">
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
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="search-input-large"
                required
              />
              
              {showSuggestions && (suggestions.length > 0 || recommendations.length > 0) && (
                <div className="suggestions-dropdown">
                  {suggestions.length > 0 ? (
                    suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="suggestion-item"
                        onMouseDown={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="suggestion-content">
                          <span className="suggestion-text">{suggestion.name}</span>
                          <span className="suggestion-type">{suggestion.type === 'mapped' ? 'Mapped' : 'Similar'}</span>
                        </div>
                        {/* <span className="suggestion-confidence">
                          {Math.round(suggestion.confidence * 100)}%
                        </span> */}
                      </div>
                    ))
                  ) : recommendations.length > 0 ? (
                    <div className="recommendations-section">
                      <div className="dropdown-label">Top Recommendations</div>
                      {recommendations.map((recommendation, index) => (
                        <div
                          key={index}
                          className="suggestion-item recommendation-item"
                          onMouseDown={() => handleSuggestionClick(recommendation)}
                        >
                          <div className="suggestion-content">
                            <span className="suggestion-text">{recommendation.name}</span>
                            <span className="suggestion-type">Recommended</span>
                          </div>
                          {/* <span className="suggestion-confidence">
                            {Math.round(recommendation.confidence * 100)}%
                          </span> */}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
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
              <label className="filter-label">Medical System</label>
              <div className="filter-buttons">
                {['ayurveda', 'siddha', 'unani'].map((system) => (
                  <button 
                    key={system}
                    type="button"
                    className={`filter-btn ${selectedSystem === system ? 'active' : ''}`}
                    onClick={() => setSelectedSystem(system)}
                  >
                    {system.charAt(0).toUpperCase() + system.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* <div className="filter-group">
              <label className="filter-label">Confidence Level</label>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
                  className="confidence-slider"
                />
                <span className="slider-value">{(minConfidence * 100).toFixed(0)}%</span>
              </div>
            </div> */}
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
                  {filteredResults.length > 0 
                    ? `Found ${filteredResults.length} mapping results for "${searchTerm}"`
                    : results.fuzzy_matches_without_mappings && results.fuzzy_matches_without_mappings.length > 0
                    ? `Found ${results.fuzzy_matches_without_mappings.length} similar terms but no mappings for "${searchTerm}"`
                    : `No results found for "${searchTerm}"`
                  }
                </h2>
                
                {filteredResults.length > 0 && (
                  <div className="results-filters">
                    <span className="filter-label">Filter by:</span>
                    {[
                      { key: 'all', label: 'All' },
                      { key: 'high-confidence', label: 'High Confidence' },
                      { key: 'medium-confidence', label: 'Medium Confidence' },
                      { key: 'icd-mapped', label: 'ICD Mapped' }
                    ].map((filter) => (
                      <button 
                        key={filter.key}
                        className={`result-filter ${activeFilter === filter.key ? 'active' : ''}`}
                        onClick={() => setActiveFilter(filter.key)}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {filteredResults.length > 0 ? (
                <div className="mapping-results">
                  <div className="table-container">
                    <table className="results-table">
                      <thead>
                        <tr>
                          <th>Source Term</th>
                          <th>Ayurveda</th>
                          <th>Siddha</th>
                          <th>Unani</th>
                          <th>ICD-11</th>
                          <th>Confidence</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredResults.map((mapping, index) => (
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
                                {mapping.source_term.hindi_name && (
                                  <div className="term-translation">{mapping.source_term.hindi_name}</div>
                                )}
                              </div>
                            </td>
                            
                            {['ayurveda', 'siddha', 'unani'].map((system) => (
                              <td key={system}>
                                {mapping.namaste_terms[system] ? (
                                  <div className="term-display">
                                    <div className="term-code">{mapping.namaste_terms[system].code}</div>
                                    <div className="term-name">{mapping.namaste_terms[system].english_name}</div>
                                  </div>
                                ) : (
                                  <span className="no-data">-</span>
                                )}
                              </td>
                            ))}
                            
                            <td>
                              {mapping.icd_mapping ? (
                                <div className="term-display">
                                  <div className="term-code">{mapping.icd_mapping.code}</div>
                                  <div className="term-name">{mapping.icd_mapping.title}</div>
                                </div>
                              ) : (
                                <span className="no-data">-</span>
                              )}
                            </td>
                            
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
                  </div>
                </div>
              ) : results.fuzzy_matches_without_mappings && results.fuzzy_matches_without_mappings.length > 0 ? (
                <div className="fuzzy-results">
                  <h3>Similar Terms Found</h3>
                  <div className="table-container">
                    <table className="results-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Term Name</th>
                          <th>Similarity</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.fuzzy_matches_without_mappings.map((item, index) => (
                          <motion.tr 
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="result-row"
                          >
                            <td>{item.code}</td>
                            <td className="term-name">{item.english_name}</td>
                            <td>
                              <div className="similarity-display">
                                {(item.similarity * 100).toFixed(1)}%
                              </div>
                            </td>
                            <td>
                              <button 
                                className="view-details-btn"
                                onClick={() => handleFuzzyViewDetails(item)}
                              >
                                View Details
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
    <div className="system-cards-grid">
  {systemCards.map((system) => (
    <motion.div 
      key={system.id}
      className="system-card"
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigateToSystemPage(system.id)}
    >
      <div className="system-icon">
        <img 
          src={system.image} 
          alt={system.name} 
          className="system-img"
        />
      </div>
      <h4 className="system-name">{system.name}</h4>
      <p className="system-desc">{system.desc}</p>
      <div className="system-action">
        Explore {system.name} →
      </div>
    </motion.div>
  ))}
</div>
        </motion.div>
      </div>
    </div>
  );
};

export default SearchPage;