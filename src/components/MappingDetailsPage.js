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

// Function to fetch all paginated data
const fetchAllPaginatedData = async (baseUrl, searchTerm, system = null) => {
  let allResults = [];
  let nextUrl = system === 'combined' 
    ? `${baseUrl}/terminologies/search/combined/?q=${encodeURIComponent(searchTerm)}&fuzzy=true&threshold=0.2`
    : system === 'icd11'
    ? `${baseUrl}/terminologies/icd11/search/?q=${encodeURIComponent(searchTerm)}&fuzzy=true&threshold=0.2`
    : `${baseUrl}/terminologies/${system}/search/?q=${encodeURIComponent(searchTerm)}&threshold=0.1`;
  
  try {
    while (nextUrl) {
      const data = await fetchData(nextUrl);
      if (data && data.results) {
        allResults = [...allResults, ...data.results];
        nextUrl = data.next;
      } else {
        break;
      }
    }
    return { results: allResults, count: allResults.length };
  } catch (error) {
    console.error("Error fetching paginated data:", error);
    return { results: [], count: 0 };
  }
};

const MappingDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mapping, searchParams, additionalData, searchTerm, item, system, source, systemType } = location.state || {};
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [allData, setAllData] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [detailedData, setDetailedData] = useState(null);
  const [theme, setTheme] = useState('light');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const API_BASE_URL = "https://ayushbandan.duckdns.org";

  // Sync theme with localStorage and header
  useEffect(() => {
    const updateTheme = () => {
      const savedTheme = localStorage.getItem('theme') || 'light';
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    };

    updateTheme();

    const handleStorageChange = (e) => {
      if (e.key === 'theme') {
        updateTheme();
      }
    };

    const handleThemeChange = (e) => {
      if (e.detail && e.detail.theme) {
        setTheme(e.detail.theme);
        localStorage.setItem('theme', e.detail.theme);
        document.documentElement.setAttribute('data-theme', e.detail.theme);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChange', handleThemeChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  // Pagination functions
  const getCurrentPageData = (data) => {
    if (!data?.results?.length) return [];
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.results.slice(startIndex, endIndex);
  };

  const getTotalPages = (data) => {
    if (!data?.results?.length) return 0;
    return Math.ceil(data.results.length / itemsPerPage);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = (data) => {
    const totalPages = getTotalPages(data);
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="pagination">
        <button 
          className="pagination-btn"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          First
        </button>
        
        <button 
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        
        {startPage > 1 && (
          <span className="pagination-ellipsis">...</span>
        )}
        
        {pageNumbers.map(number => (
          <button
            key={number}
            className={`pagination-btn ${currentPage === number ? 'active' : ''}`}
            onClick={() => handlePageChange(number)}
          >
            {number}
          </button>
        ))}
        
        {endPage < totalPages && (
          <span className="pagination-ellipsis">...</span>
        )}
        
        <button 
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
        
        <button 
          className="pagination-btn"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          Last
        </button>
        
        <span className="pagination-info">
          Page {currentPage} of {totalPages} ({data.results.length} total items)
        </span>
      </div>
    );
  };

  // Fetch initial search data with all pages
  useEffect(() => {
    const fetchAllData = async () => {
      if (searchTerm) {
        setIsLoading(true);
        try {
          const [combinedData, ayurvedaData, unaniData, siddhaData, icd11Data] = await Promise.all([
            fetchAllPaginatedData(API_BASE_URL, searchTerm, 'combined'),
            fetchAllPaginatedData(API_BASE_URL, searchTerm, 'ayurveda'),
            fetchAllPaginatedData(API_BASE_URL, searchTerm, 'unani'),
            fetchAllPaginatedData(API_BASE_URL, searchTerm, 'siddha'),
            fetchAllPaginatedData(API_BASE_URL, searchTerm, 'icd11')
          ]);

          setAllData({ 
            combined: combinedData,
            ayurveda: ayurvedaData, 
            unani: unaniData, 
            siddha: siddhaData,
            icd11: icd11Data
          });

          // Set initial selected result based on what was passed in
          if (mapping) {
            setSelectedResult({ 
              ...mapping, 
              system: systemType || 'Combined', 
              type: 'mapping',
              termName: mapping.source_term?.english_name || mapping.title || searchTerm
            });
          } else if (item) {
            setSelectedResult({
              ...item,
              system: systemType || 'System',
              type: 'item',
              termName: item.english_name || item.title || searchTerm
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
  }, [searchTerm, mapping, item, systemType]);

  // Reset to page 1 when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Fetch detailed data when a specific term is selected
  const fetchDetailedData = async (termName) => {
    if (!termName) return;
    
    setIsLoading(true);
    try {
      const [combinedDetail, ayurvedaDetail, unaniDetail, siddhaDetail, icd11Detail] = await Promise.all([
        fetchAllPaginatedData(API_BASE_URL, termName, 'combined'),
        fetchAllPaginatedData(API_BASE_URL, termName, 'ayurveda'),
        fetchAllPaginatedData(API_BASE_URL, termName, 'unani'),
        fetchAllPaginatedData(API_BASE_URL, termName, 'siddha'),
        fetchAllPaginatedData(API_BASE_URL, termName, 'icd11')
      ]);

      setDetailedData({
        combined: combinedDetail,
        ayurveda: ayurvedaDetail,
        unani: unaniDetail,
        siddha: siddhaDetail,
        icd11: icd11Detail
      });
    } catch (error) {
      console.error("Error fetching detailed data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = async (result, systemName, type = 'system') => {
    const termName = result.english_name || result.title || result.name || result.source_term?.english_name;
    setSelectedResult({ 
      ...result, 
      system: systemName, 
      type, 
      termName,
      definition: result.definition
    });
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

    const currentData = getCurrentPageData(systemData);
    const totalPages = getTotalPages(systemData);

    return (
      <div className="system-results">
        <div className="results-summary">
          <h4>Found {systemData.count} results in {systemName}</h4>
          <p>Showing {Math.min(itemsPerPage, currentData.length)} of {systemData.results.length} results (Page {currentPage} of {totalPages})</p>
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
                {systemName === 'ICD-11' && <th>Class Kind</th>}
                {systemName === 'Combined' && <th>Definition</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((result, index) => (
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
                    <td>{result.class_kind || "-"}</td>
                  )}
                  {systemName === 'Combined' && (
                    <td className="definition-cell">
                      {result.definition ? `${result.definition.substring(0, 100)}...` : "-"}
                    </td>
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
          {renderPagination(systemData)}
        </div>
      </div>
    );
  };

  const renderCombinedResults = () => {
    if (!allData?.combined?.results?.length) {
      return (
        <div className="no-results">
          <p>No combined search data available.</p>
        </div>
      );
    }

    const currentResults = getCurrentPageData(allData.combined);

    return (
      <div className="combined-results">
        <h3>ICD-11 Terms with Traditional Medicine Mappings</h3>
        {currentResults.map((result, index) => (
          <div key={index} className="combined-card detailed">
            <div className="combined-header">
              <h4>{result.title}</h4>
              <div className="combined-meta">
                <span className="code-badge">Code: {result.code}</span>
                {result.search_score && (
                  <span className="score-badge">
                    Search Score: {(result.search_score * 100).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            
            <div className="combined-content">
              <div className="icd-section">
                <h5>ICD-11 Details</h5>
                <div className="definition-section">
                  <strong>Definition:</strong>
                  <p>{result.definition || "No definition available"}</p>
                </div>
                <div className="icd-meta">
                  <span><strong>Class Kind:</strong> {result.class_kind || "N/A"}</span>
                  <span><strong>Foundation URI:</strong> {result.foundation_uri ? 
                    <a href={result.foundation_uri} target="_blank" rel="noopener noreferrer">View</a> : "N/A"}</span>
                </div>
              </div>

              <div className="mappings-section">
                <h5>Traditional Medicine Mappings</h5>
                <div className="mapping-grid">
                  {['ayurveda', 'siddha', 'unani'].map(system => (
                    <div key={system} className="mapping-item">
                      <h6>{system.charAt(0).toUpperCase() + system.slice(1)}</h6>
                      {result[`related_${system}`] ? (
                        <div className="mapping-details">
                          <p><strong>Code:</strong> {result[`related_${system}`].code}</p>
                          <p><strong>Name:</strong> {result[`related_${system}`].english_name}</p>
                          {result[`related_${system}`].local_name && (
                            <p><strong>Local Name:</strong> {result[`related_${system}`].local_name}</p>
                          )}
                        </div>
                      ) : (
                        <p className="no-mapping">No mapping available</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {result.mapping_info && (
                <div className="mapping-info-section">
                  <h5>Mapping Information</h5>
                  <div className="mapping-info-grid">
                    <span><strong>Confidence:</strong> {(result.mapping_info.confidence_score * 100).toFixed(1)}%</span>
                    <span><strong>Source System:</strong> {result.mapping_info.source_system}</span>
                    {result.mapping_info.icd_similarity && (
                      <span><strong>ICD Similarity:</strong> {(result.mapping_info.icd_similarity * 100).toFixed(1)}%</span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <button 
              className="view-full-details-btn"
              onClick={() => handleResultClick(result, 'Combined', 'combined')}
            >
              View Full Details
            </button>
          </div>
        ))}
        {renderPagination(allData.combined)}
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
    const combinedMatch = detailedData ? findBestMatch(detailedData.combined, termName) : null;
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
              {result.search_score && (
                <span className="score-tag">
                  {(result.search_score * 100).toFixed(1)}% Search Score
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="detail-content">
          {/* ICD-11/Combined Details */}
          <div className="detail-section">
            <h4>ICD-11 Details</h4>
            {combinedMatch ? (
              <div className="system-details-grid">
                <div className="detail-item">
                  <label>CODE</label>
                  <span className="highlight-code">{combinedMatch.code || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>TITLE</label>
                  <span>{combinedMatch.title || 'N/A'}</span>
                </div>
                <div className="detail-item full-width">
                  <label>DEFINITION</label>
                  <div className="definition-content">
                    {combinedMatch.definition || 'No definition available'}
                  </div>
                </div>
                <div className="detail-item">
                  <label>CLASS KIND</label>
                  <span>{combinedMatch.class_kind || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>FOUNDATION URI</label>
                  <span className="uri-link">
                    {combinedMatch.foundation_uri ? 
                      <a href={combinedMatch.foundation_uri} target="_blank" rel="noopener noreferrer">
                        View in ICD-11 Browser
                      </a> : 'N/A'
                    }
                  </span>
                </div>
                {combinedMatch.search_score && (
                  <div className="detail-item">
                    <label>SEARCH SCORE</label>
                    <span className="score-value">{(combinedMatch.search_score * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-data-available">
                <p>No ICD-11 data available for "{termName}"</p>
              </div>
            )}
          </div>

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

          {/* ICD-11 Details (separate from combined) */}
          <div className="detail-section">
            <h4>ICD-11 Direct Search Results</h4>
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
                  <span className="uri-link">
                    {icd11Match.foundation_uri ? 
                      <a href={icd11Match.foundation_uri} target="_blank" rel="noopener noreferrer">
                        View
                      </a> : 'N/A'
                    }
                  </span>
                </div>
                <div className="detail-item">
                  <label>CLASS KIND</label>
                  <span>{icd11Match.class_kind || 'N/A'}</span>
                </div>
              </div>
            ) : (
              <div className="no-data-available">
                <p>No ICD-11 direct search data available for "{termName}"</p>
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
                  <span>{searchParams?.system || 'ICD-11'}</span>
                </div>
              </div>
            </div>
          )}
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
          <h1 className="page-title">{searchTerm}</h1>
          <p className="search-context">Comprehensive medical terminology search results across all systems</p>
        </motion.div>

        <div className="tab-navigation">
          {['overview', 'ayurveda', 'unani', 'siddha', 'icd11', 'detailed-view'].map((tab) => (
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
                  { name: 'Combined', data: allData?.combined, color: '#2196F3', count: allData?.combined?.count || 0 },
                  { name: 'Ayurveda', data: allData?.ayurveda, color: '#4CAF50', count: allData?.ayurveda?.count || 0 },
                  { name: 'Unani', data: allData?.unani, color: '#FF9800', count: allData?.unani?.count || 0 },
                  { name: 'Siddha', data: allData?.siddha, color: '#9C27B0', count: allData?.siddha?.count || 0 },
                  { name: 'ICD-11', data: allData?.icd11, color: '#F44336', count: allData?.icd11?.count || 0 }
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

          {activeTab === "combined" && (
          <motion.div
  className="combined-tab"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
>
  <div className="combined-header-row">
    <h2>ICD-11 ↔ Traditional Medicine Mappings</h2>
    <p className="results-count">{allData.combined.count} mapped terms</p>
  </div>

  <div className="combined-grid">
    {getCurrentPageData(allData.combined).map((m, i) => (
      <motion.div
        key={m.id || i}
        className="combined-card"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: i * 0.06 }}
      >
        {/* ICD-11 block */}
        <div className="icd-block">
          <div className="block-header">
            <span className="sys-badge icd">ICD-11</span>
            <span className="code">{m.code}</span>
          </div>
          <h3>{m.title}</h3>
          <p className="def">{m.definition ? `${m.definition.slice(0, 120)}…` : '—'}</p>
          <a
            href={m.foundation_uri}
            target="_blank"
            rel="noreferrer"
            className="external-link"
          >
            Open browser ↗
          </a>
        </div>

        {/* Mappings row */}
        <div className="mappings-row">
          {['ayurveda', 'siddha', 'unani'].map(sys => (
            <div className="map-cell" key={sys}>
              <span className="sys-badge">{sys.charAt(0).toUpperCase() + sys.slice(1)}</span>
              {m[`related_${sys}`] ? (
                <>
                  <p className="local">{m[`related_${sys}`].local_name || '—'}</p>
                  <p className="eng">{m[`related_${sys}`].english_name}</p>
                  <p className="code-sub">{m[`related_${sys}`].code}</p>
                </>
              ) : (
                <p className="no-map">No mapping</p>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="card-footer">
          {m.search_score && (
            <span className="score">Score {(m.search_score * 100).toFixed(1)}%</span>
          )}
          <Link
            to="/mapping-details"
            state={{ mapping: m, systemType: 'combined', searchTerm: m.title }}
            className="details-btn"
          >
            Full details →
          </Link>
        </div>
      </motion.div>
    ))}
  </div>

  {/* pagination stays identical */}
  {renderPagination(allData.combined)}
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