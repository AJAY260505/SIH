import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import "./MappingDetailsPage.css";

const MappingDetailsPage = () => {
  const location = useLocation();
  const { mapping, searchParams, additionalData, searchTerm, item, system, source } = location.state || {};
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [itemDetails, setItemDetails] = useState(null);

  // If we're coming from SystemPage, we have an item but not a mapping
  useEffect(() => {
    if (source === 'system-page' && item) {
      setItemDetails(item);
      setActiveTab(system);
    }
  }, [source, item, system]);

  if (!mapping && !item) {
    return (
      <div className="mapping-details-page">
        <div className="container">
          <div className="error-message">
            <h2>No Details Available</h2>
            <p>Please go back and select a result to view details.</p>
            <Link to="/search" className="back-button">
              Back to Search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render item details if we're coming from SystemPage
  if (source === 'system-page' && itemDetails) {
    return (
      <div className="mapping-details-page">
        <div className="container">
          <Link to={`/${system}`} className="back-button">
            ← Back to {system.charAt(0).toUpperCase() + system.slice(1)} Results
          </Link>

          <motion.div
            className="details-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="header-content">
              <h1>{itemDetails.english_name || itemDetails.title || itemDetails.code}</h1>
              <div className="badges">
                <span className="system-badge">{system}</span>
                <span className="code-badge">{itemDetails.code}</span>
              </div>
            </div>
          </motion.div>

          <div className="item-details-section">
            <h2>Full Details</h2>
            <div className="detail-cards-container">
              {Object.entries(itemDetails).map(([key, value]) => (
                <div key={key} className="detail-card">
                  <h3>{key.replace(/_/g, ' ').toUpperCase()}</h3>
                  <p>{value || '-'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Original mapping details view for search results
  return (
    <div className="mapping-details-page">
      <div className="container">
        <Link to="/search" className="back-button">
          ← Back to Results
        </Link>

        {mapping && (
          <>
            <motion.div
              className="details-header"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="header-content">
                <h1>{searchTerm || mapping.source_term.english_name}</h1>
                <div className="badges">
                  <span className="system-badge">{searchParams.system}</span>
                  <span className="code-badge">{mapping.source_term.code}</span>
                  <span className="confidence-badge">
                    Confidence: {(mapping.confidence_score * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </motion.div>

            <div className="tabs">
              <button 
                className={activeTab === "overview" ? "tab active" : "tab"}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </button>
              <button 
                className={activeTab === "ayurveda" ? "tab active" : "tab"}
                onClick={() => setActiveTab("ayurveda")}
              >
                Ayurveda
              </button>
              <button 
                className={activeTab === "unani" ? "tab active" : "tab"}
                onClick={() => setActiveTab("unani")}
              >
                Unani
              </button>
              <button 
                className={activeTab === "siddha" ? "tab active" : "tab"}
                onClick={() => setActiveTab("siddha")}
              >
                Siddha
              </button>
              <button 
                className={activeTab === "icd11" ? "tab active" : "tab"}
                onClick={() => setActiveTab("icd11")}
              >
                ICD-11
              </button>
            </div>

            <div className="tab-content">
              {activeTab === "overview" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="overview-section"
                >
                  <h2>Mapping Overview</h2>
                  <div className="mapping-details">
                    <div className="detail-card">
                      <h3>Source Term</h3>
                      <p><strong>Code:</strong> {mapping.source_term.code}</p>
                      <p><strong>Name:</strong> {mapping.source_term.english_name}</p>
                      {mapping.source_term.hindi_name && (
                        <p><strong>Hindi Name:</strong> {mapping.source_term.hindi_name}</p>
                      )}
                      {mapping.source_term.diacritical_name && (
                        <p><strong>Diacritical Name:</strong> {mapping.source_term.diacritical_name}</p>
                      )}
                    </div>

                    {mapping.namaste_terms.ayurveda && (
                      <div className="detail-card">
                        <h3>Ayurveda Mapping</h3>
                        <p><strong>Code:</strong> {mapping.namaste_terms.ayurveda.code}</p>
                        <p><strong>Name:</strong> {mapping.namaste_terms.ayurveda.english_name}</p>
                      </div>
                    )}

                    {mapping.namaste_terms.siddha && (
                      <div className="detail-card">
                        <h3>Siddha Mapping</h3>
                        <p><strong>Code:</strong> {mapping.namaste_terms.siddha.code}</p>
                        <p><strong>Name:</strong> {mapping.namaste_terms.siddha.english_name}</p>
                      </div>
                    )}

                    {mapping.namaste_terms.unani && (
                      <div className="detail-card">
                        <h3>Unani Mapping</h3>
                        <p><strong>Code:</strong> {mapping.namaste_terms.unani.code}</p>
                        <p><strong>Name:</strong> {mapping.namaste_terms.unani.english_name}</p>
                      </div>
                    )}

                    {mapping.icd_mapping && (
                      <div className="detail-card">
                        <h3>ICD-11 Mapping</h3>
                        <p><strong>Code:</strong> {mapping.icd_mapping.code}</p>
                        <p><strong>Title:</strong> {mapping.icd_mapping.title}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "ayurveda" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="system-section"
                >
                  <h2>Ayurveda Results for "{searchTerm || mapping.source_term.english_name}"</h2>
                  {additionalData && additionalData.ayurveda ? (
                    <div className="results-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Code</th>
                            <th>English Name</th>
                            <th>Hindi Name</th>
                            <th>Diacritical Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          {additionalData.ayurveda.results && additionalData.ayurveda.results.map((item, index) => (
                            <tr key={index}>
                              <td>{item.code}</td>
                              <td>{item.english_name}</td>
                              <td>{item.hindi_name || "-"}</td>
                              <td>{item.diacritical_name || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {additionalData.ayurveda.count > 20 && (
                        <div className="pagination-info">
                          Showing first 20 of {additionalData.ayurveda.count} results
                        </div>
                      )}
                    </div>
                  ) : (
                    <p>No Ayurveda data available</p>
                  )}
                </motion.div>
              )}

              {activeTab === "unani" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="system-section"
                >
                  <h2>Unani Results for "{searchTerm || mapping.source_term.english_name}"</h2>
                  {additionalData && additionalData.unani ? (
                    <div className="results-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Code</th>
                            <th>English Name</th>
                            <th>Arabic Name</th>
                            <th>Romanized Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          {additionalData.unani.results && additionalData.unani.results.map((item, index) => (
                            <tr key={index}>
                              <td>{item.code}</td>
                              <td>{item.english_name}</td>
                              <td>{item.arabic_name || "-"}</td>
                              <td>{item.romanized_name || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {additionalData.unani.count > 20 && (
                        <div className="pagination-info">
                          Showing first 20 of {additionalData.unani.count} results
                        </div>
                      )}
                    </div>
                  ) : (
                    <p>No Unani data available</p>
                  )}
                </motion.div>
              )}

              {activeTab === "siddha" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="system-section"
                >
                  <h2>Siddha Results for "{searchTerm || mapping.source_term.english_name}"</h2>
                  {additionalData && additionalData.siddha ? (
                    <div className="results-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Code</th>
                            <th>English Name</th>
                            <th>Tamil Name</th>
                            <th>Romanized Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          {additionalData.siddha.results && additionalData.siddha.results.map((item, index) => (
                            <tr key={index}>
                              <td>{item.code}</td>
                              <td>{item.english_name}</td>
                              <td>{item.tamil_name || "-"}</td>
                              <td>{item.romanized_name || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {additionalData.siddha.count > 20 && (
                        <div className="pagination-info">
                          Showing first 20 of {additionalData.siddha.count} results
                        </div>
                      )}
                    </div>
                  ) : (
                    <p>No Siddha data available</p>
                  )}
                </motion.div>
              )}

              {activeTab === "icd11" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="system-section"
                >
                  <h2>ICD-11 Results for "{searchTerm || mapping.source_term.english_name}"</h2>
                  {additionalData && additionalData.icd11 ? (
                    <div className="results-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Code</th>
                            <th>Title</th>
                            <th>Definition</th>
                          </tr>
                        </thead>
                        <tbody>
                          {additionalData.icd11.results && additionalData.icd11.results.map((item, index) => (
                            <tr key={index}>
                              <td>{item.code || "N/A"}</td>
                              <td>{item.title}</td>
                              <td>{item.definition || "No definition available"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p>No ICD-11 data available</p>
                  )}
                </motion.div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MappingDetailsPage;