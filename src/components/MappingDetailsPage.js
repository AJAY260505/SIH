import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import "./MappingDetailsPage.css";

const MappingDetailsPage = () => {
  const location = useLocation();
  const { item, system, query } = location.state || {};

  // pick a random image from public folder
  const randomImage = useMemo(() => {
    const images = ["/img1.png", "/img2.png", "/img3.png", "/img5.png"];
    return images[Math.floor(Math.random() * images.length)];
  }, []);

  if (!item) {
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

  return (
    <div
      className="mapping-details-page"
      style={{
        backgroundImage:
          "url('https://static.vecteezy.com/system/resources/thumbnails/060/705/571/small/traditional-mortar-and-pestle-for-grinding-ingredients-photo.jpeg')",
      }}
    >
      <div className="overlay">
        <div className="container">
          <motion.div
            className="details-wrapper"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link to={-1} className="back-button">
              ← Back to Results
            </Link>

            {/* Header with image + title */}
            <div className="details-header">
              <motion.img
                src={randomImage}
                alt="System Illustration"
                className="details-image"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7 }}
              />
              <div className="details-info">
                <h2>{item.english_name ?? item.name ?? item.title ?? "—"}</h2>
                <div className="badges">
                  <span className="system-badge">{system}</span>
                  <span className="code-badge">{item.code ?? item.id ?? "—"}</span>
                  {item.similarity && (
                    <span className="confidence-badge">
                      Similarity: {(item.similarity * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Info grid - show all item keys dynamically */}
            <div className="mapping-details-content">
              <motion.div
                className="details-section"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h3>Details</h3>
                <div className="details-grid">
                  {Object.entries(item).map(([key, value]) => (
                    <div
                      key={key}
                      className={`detail-item ${typeof value === "string" && value.length > 80 ? "full-width" : ""}`}
                    >
                      <span className="detail-label">{key.replace(/_/g, " ")}</span>
                      <span className="detail-value">
                        {typeof value === "object" ? JSON.stringify(value) : value?.toString() ?? "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MappingDetailsPage;
