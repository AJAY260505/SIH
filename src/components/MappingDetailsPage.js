import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./MappingDetailsPage.css";

const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

const MappingDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mapping, searchParams, systemData, searchTerm, item, system, source } = location.state || {};
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [allData, setAllData] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [detailedData, setDetailedData] = useState(null);
  const [theme, setTheme] = useState('light');

  const API_BASE_URL = "http://localhost:8000";

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

  // Fetch initial search data
  useEffect(() => {
    const fetchAllData = async () => {
      if (searchTerm) {
        setIsLoading(true);
        try {
          const [ayurvedaData, unaniData, siddhaData, icd11Data, mappingData] = await Promise.all([
            fetchData(`${API_BASE_URL}/terminologies/ayurveda/search/?q=${encodeURIComponent(searchTerm)}`),
            fetchData(`${API_BASE_URL}/terminologies/unani/search/?q=${encodeURIComponent(searchTerm)}`),
            fetchData(`${API_BASE_URL}/terminologies/siddha/search/?q=${encodeURIComponent(searchTerm)}`),
            fetchData(`${API_BASE_URL}/terminologies/icd11/search/?q=${encodeURIComponent(searchTerm)}&fuzzy=true&threshold=0.3`),
            fetchData(`${API_BASE_URL}/terminologies/mappings/?system=${system || 'ayurveda'}&q=${encodeURIComponent(searchTerm)}&min_confidence=0.1`)
          ]);

          setAllData({ 
            ayurveda: ayurvedaData, 
            unani: unaniData, 
            siddha: siddhaData, 
            icd11: icd11Data, 
            mapping: mappingData 
          });

          if (mapping) {
            setSelectedResult({ 
              ...mapping.source_term, 
              system: 'Source Term', 
              mappingData: mapping,
              type: 'mapping'
            });
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchAllData();
  }, [searchTerm, system, mapping]);

  // Fetch detailed data when a specific term is selected
  const fetchDetailedData = async (termName) => {
    if (!termName) return;
    
    setIsLoading(true);
    try {
      const [ayurvedaDetail, unaniDetail, siddhaDetail, icd11Detail, mappingDetail] = await Promise.all([
        fetchData(`${API_BASE_URL}/terminologies/ayurveda/search/?q=${encodeURIComponent(termName)}`),
        fetchData(`${API_BASE_URL}/terminologies/unani/search/?q=${encodeURIComponent(termName)}`),
        fetchData(`${API_BASE_URL}/terminologies/siddha/search/?q=${encodeURIComponent(termName)}`),
        fetchData(`${API_BASE_URL}/terminologies/icd11/search/?q=${encodeURIComponent(termName)}&fuzzy=true&threshold=0.3`),
        fetchData(`${API_BASE_URL}/terminologies/mappings/?system=ayurveda&q=${encodeURIComponent(termName)}&min_confidence=0.1`)
      ]);

      setDetailedData({
        ayurveda: ayurvedaDetail,
        unani: unaniDetail,
        siddha: siddhaDetail,
        icd11: icd11Detail,
        mapping: mappingDetail
      });
    } catch (error) {
      console.error("Error fetching detailed data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = async (result, systemName, type = 'system') => {
    const termName = result.english_name || result.title || result.name || result.source_term?.english_name;
    setSelectedResult({ ...result, system: systemName, type, termName });
    setActiveTab('detailed-view');
    await fetchDetailedData(termName);
  };

  const renderSystemResults = (systemData, systemName) => {
    if (!systemData?.results?.length) {
      return (
        <div className="no-results">
          <p>No {systemName} data available for "{searchTerm}".</p>
        </div>
      );
    }

    return (
      <div className="system-results">
        <div className="results-summary">
          <h4>Found {systemData.count} results in {systemName}</h4>
          {systemData.next && <p>Showing first 20 results</p>}
        </div>
        
        <div className="results-table-container">
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
                {systemName === 'ICD-11' && <th>Title</th>}
                {systemName === 'ICD-11' && <th>Class Kind</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {systemData.results.slice(0, 20).map((result, index) => (
                <motion.tr 
                  key={result.id || index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="result-row"
                >
                  <td>{result.code || "N/A"}</td>
                  <td>{result.english_name || result.title || "N/A"}</td>
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
                    <>
                      <td>{result.title || "-"}</td>
                      <td>{result.class_kind || "-"}</td>
                    </>
                  )}
                  <td>
                    <button 
                      className="view-details-btn"
                      onClick={() => handleResultClick(result, systemName)}
                    >
                      View Details
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {systemData.count > 20 && (
            <div className="pagination-info">
              Showing first 20 of {systemData.count} results
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMappings = () => {
    if (!allData?.mapping) {
      return (
        <div className="no-results">
          <p>No mapping data available.</p>
        </div>
      );
    }

    const { results, fuzzy_matches_without_mappings } = allData.mapping;

    return (
      <div className="mappings-section">
        {results && results.length > 0 ? (
          <div className="mapping-results">
            <h3>Direct Mappings</h3>
            {results.map((mapping, index) => (
              <div key={index} className="mapping-card detailed">
                <div className="mapping-header">
                  <h4>Mapping #{index + 1}</h4>
                  <span className="confidence-badge">
                    Confidence: {(mapping.confidence_score * 100).toFixed(1)}%
                  </span>
                </div>
                
                <div className="mapping-details-grid">
                  <div className="mapping-source">
                    <h5>Source Term ({searchParams?.system || 'Ayurveda'})</h5>
                    <div className="term-details">
                      <p><strong>Code:</strong> {mapping.source_term.code}</p>
                      <p><strong>Name:</strong> {mapping.source_term.english_name}</p>
                      {mapping.source_term.hindi_name && (
                        <p><strong>Hindi Name:</strong> {mapping.source_term.hindi_name}</p>
                      )}
                    </div>
                  </div>

                  {mapping.namaste_terms.ayurveda && (
                    <div className="mapping-target">
                      <h5>Ayurveda Mapping</h5>
                      <div className="term-details">
                        <p><strong>Code:</strong> {mapping.namaste_terms.ayurveda.code}</p>
                        <p><strong>Name:</strong> {mapping.namaste_terms.ayurveda.english_name}</p>
                      </div>
                    </div>
                  )}

                  {mapping.namaste_terms.siddha && (
                    <div className="mapping-target">
                      <h5>Siddha Mapping</h5>
                      <div className="term-details">
                        <p><strong>Code:</strong> {mapping.namaste_terms.siddha.code}</p>
                        <p><strong>Name:</strong> {mapping.namaste_terms.siddha.english_name}</p>
                      </div>
                    </div>
                  )}

                  {mapping.namaste_terms.unani && (
                    <div className="mapping-target">
                      <h5>Unani Mapping</h5>
                      <div className="term-details">
                        <p><strong>Code:</strong> {mapping.namaste_terms.unani.code}</p>
                        <p><strong>Name:</strong> {mapping.namaste_terms.unani.english_name}</p>
                      </div>
                    </div>
                  )}

                  {mapping.icd_mapping && (
                    <div className="mapping-target">
                      <h5>ICD-11 Mapping</h5>
                      <div className="term-details">
                        <p><strong>Code:</strong> {mapping.icd_mapping.code}</p>
                        <p><strong>Title:</strong> {mapping.icd_mapping.title}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <button 
                  className="view-full-details-btn"
                  onClick={() => handleResultClick(mapping, 'Mapping', 'mapping')}
                >
                  View Full Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-direct-mappings">
            <p>No direct mappings found for "{searchTerm}".</p>
          </div>
        )}

        {fuzzy_matches_without_mappings && fuzzy_matches_without_mappings.length > 0 && (
          <div className="fuzzy-matches">
            <h3>Similar Terms (No Mappings Available)</h3>
            <div className="fuzzy-table-container">
              <table className="fuzzy-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Term Name</th>
                    <th>Similarity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fuzzy_matches_without_mappings.map((match, index) => (
                    <motion.tr 
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="fuzzy-row"
                    >
                      <td>{match.code}</td>
                      <td>{match.english_name}</td>
                      <td>{(match.similarity * 100).toFixed(1)}%</td>
                      <td>{match.message}</td>
                      <td>
                        <button 
                          className="view-term-btn"
                          onClick={() => handleResultClick(match, 'Fuzzy Match', 'fuzzy')}
                        >
                          View Term
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Find best matching result from detailed data
  const findBestMatch = (data, termName) => {
    if (!data?.results?.length) return null;
    
    const termNameLower = termName.toLowerCase();
    return data.results.find(result => {
      const resultName = (result.english_name || result.title || '').toLowerCase();
      return resultName === termNameLower || resultName.includes(termNameLower);
    }) || data.results[0];
  };

  const renderDetailedView = () => {
    if (!selectedResult) {
      return (
        <div className="no-selection">
          <h3>Select a result to view details</h3>
          <p>Click on any result from the tabs above to view detailed information.</p>
        </div>
      );
    }

    const result = selectedResult;
    const termName = result.termName || result.english_name || result.title || result.name || result.source_term?.english_name;
    
    // Get best matches from detailed data
    const ayurvedaMatch = detailedData ? findBestMatch(detailedData.ayurveda, termName) : null;
    const unaniMatch = detailedData ? findBestMatch(detailedData.unani, termName) : null;
    const siddhaMatch = detailedData ? findBestMatch(detailedData.siddha, termName) : null;
    const icd11Match = detailedData ? findBestMatch(detailedData.icd11, termName) : null;

    return (
      <div className="detailed-view">
        <div className="detail-header">
          <div className="header-main">
            <h3>{termName}</h3>
            <div className="detail-meta">
              <span className="system-tag">{result.system}</span>
              <span className="code-tag">{result.code || result.source_term?.code || 'N/A'}</span>
              {result.confidence_score && (
                <span className="confidence-tag">
                  {(result.confidence_score * 100).toFixed(1)}% Confidence
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="detail-content">
          {/* Ayurveda Details */}
          <div className="detail-section">
            <h4>Ayurveda Details</h4>
            {ayurvedaMatch ? (
              <div className="system-details-grid">
                <div className="detail-item">
                  <label>CODE</label>
                  <span className="highlight-code">{ayurvedaMatch.code || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>ENGLISH NAME</label>
                  <span>{ayurvedaMatch.english_name || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>HINDI NAME</label>
                  <span>{ayurvedaMatch.hindi_name || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>DIACRITICAL NAME</label>
                  <span>{ayurvedaMatch.diacritical_name || 'N/A'}</span>
                </div>
                {ayurvedaMatch.id && (
                  <div className="detail-item">
                    <label>TERM ID</label>
                    <span>{ayurvedaMatch.id}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-data-available">
                <p>No Ayurveda data available for "{termName}"</p>
              </div>
            )}
          </div>

          {/* Unani Details */}
          <div className="detail-section">
            <h4>Unani Details</h4>
            {unaniMatch ? (
              <div className="system-details-grid">
                <div className="detail-item">
                  <label>CODE</label>
                  <span className="highlight-code">{unaniMatch.code || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>ENGLISH NAME</label>
                  <span>{unaniMatch.english_name || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>ARABIC NAME</label>
                  <span>{unaniMatch.arabic_name || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>ROMANIZED NAME</label>
                  <span>{unaniMatch.romanized_name || 'N/A'}</span>
                </div>
                {unaniMatch.id && (
                  <div className="detail-item">
                    <label>TERM ID</label>
                    <span>{unaniMatch.id}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-data-available">
                <p>No Unani data available for "{termName}"</p>
              </div>
            )}
          </div>

          {/* Siddha Details */}
          <div className="detail-section">
            <h4>Siddha Details</h4>
            {siddhaMatch ? (
              <div className="system-details-grid">
                <div className="detail-item">
                  <label>CODE</label>
                  <span className="highlight-code">{siddhaMatch.code || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>ENGLISH NAME</label>
                  <span>{siddhaMatch.english_name || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>TAMIL NAME</label>
                  <span>{siddhaMatch.tamil_name || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>ROMANIZED NAME</label>
                  <span>{siddhaMatch.romanized_name || 'N/A'}</span>
                </div>
                {siddhaMatch.id && (
                  <div className="detail-item">
                    <label>TERM ID</label>
                    <span>{siddhaMatch.id}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-data-available">
                <p>No Siddha data available for "{termName}"</p>
              </div>
            )}
          </div>

          {/* ICD-11 Details */}
          <div className="detail-section">
            <h4>ICD-11 Details</h4>
            {icd11Match ? (
              <div className="system-details-grid">
                <div className="detail-item">
                  <label>CODE</label>
                  <span className="highlight-code icd-code">{icd11Match.code || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>TITLE</label>
                  <span>{icd11Match.title || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>FOUNDATION URI</label>
                  <span className="uri-link">{icd11Match.foundation_uri || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>CLASS KIND</label>
                  <span>{icd11Match.class_kind || 'N/A'}</span>
                </div>
              </div>
            ) : (
              <div className="no-data-available">
                <p>No ICD-11 data available for "{termName}"</p>
              </div>
            )}
          </div>

          {/* Mapping Details (if available) */}
          {result.type === 'mapping' && result.mappingData && (
            <div className="detail-section">
              <h4>Mapping Information</h4>
              <div className="mapping-details-grid">
                <div className="detail-item">
                  <label>MAPPING ID</label>
                  <span>{result.mappingData.mapping_id || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>CONFIDENCE SCORE</label>
                  <span className="confidence-value">
                    {(result.mappingData.confidence_score * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="detail-item">
                  <label>SOURCE SYSTEM</label>
                  <span>{searchParams?.system || 'Ayurveda'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Search Information */}
          {/* <div className="detail-section">
            <h4>Search Information</h4>
            <div className="search-info-grid">
              <div className="detail-item">
                <label>ORIGINAL SEARCH TERM</label>
                <span>{searchTerm}</span>
              </div>
              <div className="detail-item">
                <label>SELECTED TERM</label>
                <span>{termName}</span>
              </div>
              <div className="detail-item">
                <label>DATA SOURCE</label>
                <span>{result.system}</span>
              </div>
              <div className="detail-item">
                <label>SEARCH TIMESTAMP</label>
                <span>{new Date().toLocaleString()}</span>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="mapping-details-page">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading detailed information for "{searchTerm}"...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!searchTerm) {
    return (
      <div className="mapping-details-page">
        <div className="container">
          <div className="error-state">
            <h2>No Term Specified</h2>
            <p>Please go back and select a specific term to view details.</p>
            <Link to="/search" className="back-btn">Back to Search</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mapping-details-page">
      <div className="container">
        <header className="page-header">
          <button onClick={() => navigate(-1)} className="back-btn">← Back to Results</button>
         
        </header>

        <motion.div
          className="page-header-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>{searchTerm}</h1>
          <p className="search-context">Comprehensive medical terminology search results across all systems</p>
        </motion.div>

        <div className="tab-navigation">
          {['overview', 'ayurveda', 'unani', 'siddha', 'icd11', 'mappings', 'detailed-view'].map((tab) => (
            <button 
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {activeTab === "overview" && (
            <motion.div className="overview-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2>Search Results Overview</h2>
              <div className="overview-cards">
                {[
                  { name: 'Ayurveda', data: allData?.ayurveda, color: '#4CAF50', count: allData?.ayurveda?.count || 0 },
                  { name: 'Unani', data: allData?.unani, color: '#FF9800', count: allData?.unani?.count || 0 },
                  { name: 'Siddha', data: allData?.siddha, color: '#9C27B0', count: allData?.siddha?.count || 0 },
                  { name: 'ICD-11', data: allData?.icd11, color: '#2196F3', count: allData?.icd11?.count || 0 },
                  { name: 'Mappings', data: allData?.mapping, color: '#1e88e5', 
                    count: (allData?.mapping?.results?.length || 0) + (allData?.mapping?.fuzzy_matches_without_mappings?.length || 0) 
                  }
                ].map((system) => (
                  <div key={system.name} className="overview-card" onClick={() => setActiveTab(system.name.toLowerCase())}>
                    <div className="card-icon" style={{ backgroundColor: system.color }}>
                      {system.name.charAt(0)}
                    </div>
                    <h3>{system.name}</h3>
                    <div className="count">{system.count}</div>
                    <p>Results Found</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "ayurveda" && (
            <motion.div className="system-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2>Ayurveda Results</h2>
              {renderSystemResults(allData?.ayurveda, 'Ayurveda')}
            </motion.div>
          )}

          {activeTab === "unani" && (
            <motion.div className="system-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2>Unani Results</h2>
              {renderSystemResults(allData?.unani, 'Unani')}
            </motion.div>
          )}

          {activeTab === "siddha" && (
            <motion.div className="system-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2>Siddha Results</h2>
              {renderSystemResults(allData?.siddha, 'Siddha')}
            </motion.div>
          )}

          {activeTab === "icd11" && (
            <motion.div className="system-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2>ICD-11 Results</h2>
              {renderSystemResults(allData?.icd11, 'ICD-11')}
            </motion.div>
          )}

          {activeTab === "mappings" && (
            <motion.div className="mappings-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2>Mapping Results</h2>
              {renderMappings()}
            </motion.div>
          )}

          {activeTab === "detailed-view" && (
            <motion.div className="detailed-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {renderDetailedView()}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MappingDetailsPage;