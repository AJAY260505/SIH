import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SystemCard from './SystemCard';
import './SystemPage.css';

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

const SystemPage = ({ systemName }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const systemData = {
    ayurveda: {
      title: "Ayurveda",
      description: "Ancient Indian system of natural and holistic healing",
      image: "/img5.png", // Replace 🌿 with img1
      endpoint: "http://localhost:8000/terminologies/ayurveda/search/?q="
    },
    siddha: {
      title: "Siddha",
      description: "One of the oldest traditional medicine systems from South India",
      image: "/img3.png", // Replace 🍃 with img3
      endpoint: "http://localhost:8000/terminologies/siddha/search/?q="
    },
    unani: {
      title: "Unani",
      description: "Greco-Arabic system of medicine based on the teachings of Hippocrates",
      image: "/img3.png", // Replace 🌱 with img4
      endpoint: "http://localhost:8000/terminologies/unani/search/?q="
    },
    icd11: {
      title: "ICD-11",
      description: "International Classification of Diseases 11th Revision",
      image: "/img4.png", // Replace 🏥 with img5
      endpoint: "http://localhost/icd/release/11/2025-01/mms/search?q="
    }
  };

  const system = systemData[systemName];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    
    try {
      const data = await fetchData(`${system.endpoint}${searchTerm}`);
      
      if (data && data.results) {
        setResults(data.results);
        console.log(`${system.title} API Response:`, data);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error(`${system.title} search error:`, error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="system-page">
      <div className="container">
        <motion.div 
          className="system-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="system-icon-large"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: 0 }}
          >
            <img 
              src={system.image} 
              alt={system.title} 
              style={{ width: '120px', height: '120px', objectFit: 'contain',borderRadius:"80px" }}
            />
          </motion.div>
          <div className="system-info">
            <h2>{system.title}</h2>
            <p>{system.description}</p>
          </div>
        </motion.div>

        <motion.form 
          onSubmit={handleSearch} 
          className="search-forms"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <input
            type="text"
            placeholder={`Search ${system.title} treatments (e.g., fever, diabetes)`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-inputs"
          />
          <motion.button 
            type="submit" 
            className="search-buttons"
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
        </motion.form>

        <AnimatePresence>
          {results && results.length === 0 && (
            <motion.div 
              className="no-results"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <p>No {system.title} results found for "{searchTerm}". Try searching for "fever" or "diabetes".</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {results && results.length > 0 && (
            <motion.div 
              className="system-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3>{system.title} Treatments for "{searchTerm}"</h3>
              <motion.div 
                className="results-grid"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { 
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                  }
                }}
                initial="hidden"
                animate="visible"
              >
                {results.map((item, index) => (
                  <SystemCard 
                    key={index} 
                    item={item} 
                    system={system.title}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          className="system-info-content"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h3>About {system.title}</h3>
          <p>
            {system.title} is a {system.title === 'ICD-11' ? 'modern international standard' : 'traditional system of medicine'} with {
              system.title === 'ICD-11' 
                ? 'global recognition for disease classification and health reporting.' 
                : 'historical roots in the Indian subcontinent. The system integrates natural elements and holistic approaches to prevent and treat health conditions.'
            }
          </p>
          <div className="system-benefits">
            <h4>Key Benefits</h4>
            <ul>
              {system.title === 'ICD-11' ? (
                <>
                  <li>Global standard for health reporting</li>
                  <li>Comprehensive disease classification</li>
                  <li>Digital-ready structure</li>
                  <li>Integration with traditional medicine systems</li>
                </>
              ) : (
                <>
                  <li>Holistic approach to wellness</li>
                  <li>Natural and minimal side effects</li>
                  <li>Personalized treatments based on individual constitution</li>
                  <li>Focus on prevention and health maintenance</li>
                </>
              )}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SystemPage;
