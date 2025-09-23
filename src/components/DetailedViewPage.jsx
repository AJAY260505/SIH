import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import './DetailedViewPage.css';

const DetailedViewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  if (!state || !state.item) {
    return (
      <div className="detailed-view">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h2>No Details Found</h2>
        <p>Please go back and select a row from the system page.</p>
      </div>
    );
  }

  const { item, system, query } = state;

  return (
    <motion.div 
      className="detailed-view"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      <h2>{system} - Detailed View</h2>
      <p className="query-info">Search Query: <strong>{query}</strong></p>

      <div className="details-card">
        {Object.entries(item).map(([key, value]) => (
          <div key={key} className="detail-row">
            <span className="detail-key">{key}</span>
            <span className="detail-value">{typeof value === "object" ? JSON.stringify(value, null, 2) : value?.toString() ?? "-"}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default DetailedViewPage;
