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
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  const API_BASE_URL = "http://localhost:8000";

  // Fetch autocomplete suggestions
  const fetchSuggestions = async (term) => {
    if (!term || term.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const data = await fetchData(
        `${API_BASE_URL}/terminologies/mappings/?system=${selectedSystem}&q=${encodeURIComponent(term)}&min_confidence=${minConfidence}&limit=10`
      );

      if (data) {
        // Combine results and fuzzy matches, sort by confidence/similarity
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
        
        // Set recommendations for display below search
        setRecommendations(allSuggestions.slice(0, 5));
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
        console.log("API Response:", data);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSystem, minConfidence]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, 200);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedSystem, minConfidence]);

  const handleViewDetails = async (mapping) => {
    setIsSearching(true);
    const termToSearch = mapping.source_term.english_name || searchTerm;
    
    try {
      // Fetch data from all endpoints
      const [ayurvedaData, unaniData, siddhaData, icd11Data] = await Promise.all([
        fetchData(`${API_BASE_URL}/terminologies/ayurveda/search/?q=${encodeURIComponent(termToSearch)}`),
        fetchData(`${API_BASE_URL}/terminologies/unani/search/?q=${encodeURIComponent(termToSearch)}`),
        fetchData(`${API_BASE_URL}/terminologies/siddha/search/?q=${encodeURIComponent(termToSearch)}`),
        fetchData(`${API_BASE_URL}/terminologies/icd11/search/?q=${encodeURIComponent(termToSearch)}&fuzzy=true&threshold=0.3`)
      ]);

      navigate('/mapping-details', { 
        state: { 
          mapping, 
          searchParams: {
            system: selectedSystem,
            query: searchTerm,
            min_confidence: minConfidence
          },
          additionalData: {
            ayurveda: ayurvedaData,
            unani: unaniData,
            siddha: siddhaData,
            icd11: icd11Data
          },
          searchTerm: termToSearch
        } 
      });
    } catch (error) {
      console.error("Error fetching additional data:", error);
      // Navigate anyway with just the mapping data
      navigate('/mapping-details', { 
        state: { 
          mapping, 
          searchParams: {
            system: selectedSystem,
            query: searchTerm,
            min_confidence: minConfidence
          },
          searchTerm: termToSearch
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

  const handleRecommendationClick = (recommendation) => {
    setSearchTerm(recommendation.name);
    setShowSuggestions(false);
    performSearch({ term: recommendation.name, system: selectedSystem, confidence: minConfidence });
    
    // Scroll to results section
    setTimeout(() => {
      document.querySelector('.results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  };

  const filteredResults = results && results.results ? 
    results.results.filter(item => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'high-confidence') return item.confidence_score >= 0.7;
      if (activeFilter === 'medium-confidence') return item.confidence_score >= 0.4 && item.confidence_score < 0.7;
      if (activeFilter === 'icd-mapped') return item.icd_mapping !== null;
      return true;
    }) : [];

  return (
    <div className="search-page">
      <div className="container">
        <motion.div
          className="hero-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className='search-head'>Find Traditional Medicine Mappings</h1>
          <p>Discover connections between traditional medicine systems and modern medical classifications</p>
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
              {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onMouseDown={() => handleSuggestionClick(suggestion)}
                    >
                      <span>{suggestion.name}</span>
                      <span className="suggestion-confidence">
                        {Math.round(suggestion.confidence * 100)}% match
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <motion.button 
              type="submit" 
              className="search-button-large"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isSearching}
            >
              {isSearching ? (
                <div className="loading-spinner"></div>
              ) : (
                "Search"
              )}
            </motion.button>
          </div>

          <div className="filters-container">
            <div className="filter-group">
              <label>Medical System</label>
              <div className="filter-buttons">
                <button 
                  type="button"
                  className={selectedSystem === 'ayurveda' ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setSelectedSystem('ayurveda')}
                >
                  Ayurveda
                </button>
                <button 
                  type="button"
                  className={selectedSystem === 'siddha' ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setSelectedSystem('siddha')}
                >
                  Siddha
                </button>
                <button 
                  type="button"
                  className={selectedSystem === 'unani' ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setSelectedSystem('unani')}
                >
                  Unani
                </button>
              </div>
            </div>
          </div>
        </motion.form>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <motion.div 
            className="recommendations-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3>Top Recommendations</h3>
            <div className="recommendations-grid">
              {recommendations.map((recommendation, index) => (
                <motion.div 
                  key={index}
                  className="recommendation-card"
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRecommendationClick(recommendation)}
                >
                  <div className="recommendation-content">
                    <h4>{recommendation.name}</h4>
                    <div className="confidence-badge">
                      {Math.round(recommendation.confidence * 100)}% match
                    </div>
                  </div>
                  <div className="recommendation-arrow">→</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {results && (
            <motion.div 
              className="results-section"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="results-header">
                <h2>
                  {filteredResults.length > 0 
                    ? `Found ${filteredResults.length} mapping results for "${searchTerm}"`
                    : results.fuzzy_matches_without_mappings && results.fuzzy_matches_without_mappings.length > 0
                    ? `Found ${results.fuzzy_matches_without_mappings.length} similar terms but no mappings for "${searchTerm}"`
                    : `No results found for "${searchTerm}"`
                  }
                </h2>
                
                {filteredResults.length > 0 && (
                  <div className="results-filters">
                    <span>Filter by:</span>
                    <button 
                      className={activeFilter === 'all' ? 'result-filter active' : 'result-filter'}
                      onClick={() => setActiveFilter('all')}
                    >
                      All
                    </button>
                    <button 
                      className={activeFilter === 'high-confidence' ? 'result-filter active' : 'result-filter'}
                      onClick={() => setActiveFilter('high-confidence')}
                    >
                      High Confidence
                    </button>
                    <button 
                      className={activeFilter === 'medium-confidence' ? 'result-filter active' : 'result-filter'}
                      onClick={() => setActiveFilter('medium-confidence')}
                    >
                      Medium Confidence
                    </button>
                    <button 
                      className={activeFilter === 'icd-mapped' ? 'result-filter active' : 'result-filter'}
                      onClick={() => setActiveFilter('icd-mapped')}
                    >
                      ICD Mapped
                    </button>
                  </div>
                )}
              </div>

              {filteredResults.length > 0 ? (
                <div className="mapping-results">
                  <div className="mapping-table-container">
                    <table className="mapping-table">
                      <thead>
                        <tr>
                          <th>Source System</th>
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
                            className="mapping-row"
                          >
                            <td>
                              <div className="source-term">
                                <div className="term-code">{mapping.source_term.code}</div>
                                <div className="term-name">{mapping.source_term.english_name}</div>
                              </div>
                            </td>
                            <td>
                              {mapping.namaste_terms.ayurveda ? (
                                <div className="system-term">
                                  <div className="term-code">{mapping.namaste_terms.ayurveda.code}</div>
                                  <div className="term-name">{mapping.namaste_terms.ayurveda.english_name}</div>
                                </div>
                              ) : (
                                <span className="no-data">-</span>
                              )}
                            </td>
                            <td>
                              {mapping.namaste_terms.siddha ? (
                                <div className="system-term">
                                  <div className="term-code">{mapping.namaste_terms.siddha.code}</div>
                                  <div className="term-name">{mapping.namaste_terms.siddha.english_name}</div>
                                </div>
                              ) : (
                                <span className="no-data">-</span>
                              )}
                            </td>
                            <td>
                              {mapping.namaste_terms.unani ? (
                                <div className="system-term">
                                  <div className="term-code">{mapping.namaste_terms.unani.code}</div>
                                  <div className="term-name">{mapping.namaste_terms.unani.english_name}</div>
                                </div>
                              ) : (
                                <span className="no-data">-</span>
                              )}
                            </td>
                            <td>
                              {mapping.icd_mapping ? (
                                <div className="system-term">
                                  <div className="term-code">{mapping.icd_mapping.code}</div>
                                  <div className="term-name">{mapping.icd_mapping.title}</div>
                                </div>
                              ) : (
                                <span className="no-data">-</span>
                              )}
                            </td>
                            <td>
                              <div className="confidence-score">
                                <div className="score-value">{(mapping.confidence_score * 100).toFixed(1)}%</div>
                                <div className="score-bar">
                                  <div 
                                    className="score-fill"
                                    style={{ width: `${mapping.confidence_score * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <button 
                                className="view-button"
                                onClick={() => handleViewDetails(mapping)}
                                disabled={isSearching}
                              >
                                {isSearching ? (
                                  <div className="loading-spinner-small"></div>
                                ) : (
                                  "View Details"
                                )}
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {results.pagination && (
                    <div className="pagination-controls">
                      <button 
                        disabled={!results.pagination.has_previous}
                        className="pagination-btn"
                      >
                        Previous
                      </button>
                      <span>Page {results.pagination.page} of {results.pagination.total_pages}</span>
                      <button 
                        disabled={!results.pagination.has_next}
                        className="pagination-btn"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              ) : results.fuzzy_matches_without_mappings && results.fuzzy_matches_without_mappings.length > 0 ? (
                <div className="fuzzy-matches">
                  <h3>Similar Terms Found (No Mappings Available)</h3>
                  <div className="fuzzy-table-container">
                    <table className="fuzzy-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Term Name</th>
                          <th>Similarity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.fuzzy_matches_without_mappings.map((item, index) => (
                          <motion.tr 
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="fuzzy-row"
                          >
                            <td>{item.code}</td>
                            <td>{item.english_name}</td>
                            <td>{(item.similarity * 100).toFixed(1)}%</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : results.results && results.results.length > 0 ? (
                <div className="no-filtered-results">
                  <p>No results match your current filter. Try changing filter settings.</p>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          className="system-cards"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h3>Explore by Medical System</h3>
          <div className="cards-container">
            <motion.div whileHover={{ y: -10, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/ayurveda" className="system-card">
                <div className="system-icon">
                  <img src="https://images.rawpixel.com/image_png_social_landscape/cHJpdmF0ZS9sci9pbWFnZXSvd2Vic2l0ZS8yMDI0LTAxL3Jhd3BpeGVsX29mZmljZV81MV8zZF9yZW5kZXJfb2ZfYXl1cnZlZGFfaXNvbGF0ZWRfb25fd2hiatGVfYmFja19hMzY3ZWI5Ny01NTdmLTQ4ODYtYjg5My1hNGExY2VhZTgzMjAucG5n.png" alt="Ayurveda" />
                </div>
                <h4>Ayurveda</h4>
                <p>Ancient Indian system of natural healing</p>
              </Link>
            </motion.div>

            <motion.div whileHover={{ y: -10, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/siddha" className="system-card">
                <div className="system-icon">
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhUYfEgw1CyfuRMPlcJh6TKJ5z8ULabwA_hUJ2g-0kmFYCrXP_dCagy5L8VGDt5vvjIJA&usqp=CAU" alt="Siddha" />
                </div>
                <h4>Siddha</h4>
                <p>Traditional Tamil system of medicine</p>
              </Link>
            </motion.div>

            <motion.div whileHover={{ y: -10, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/unani" className="system-card">
                <div className="system-icon">
                  <img src="https://naattumarundhukadai.com/cdn/shop/collections/Unani.jpg?v=1531830805" alt="Unani" />
                </div>
                <h4>Unani</h4>
                <p>Greco-Arabic system of medicine</p>
              </Link>
            </motion.div>

            <motion.div whileHover={{ y: -10, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/icd11" className="system-card">
                <div className="system-icon">
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjgf4XbSrEBV3uWXQncHYC_hqLvAiY9SPK8A&s" alt="ICD-11" />
                </div>
                <h4>ICD-11</h4>
                <p>International Classification of Diseases</p>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SearchPage;