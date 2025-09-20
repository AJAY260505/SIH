import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './SystemCard.css';

const SystemCard = ({ item, system }) => {
  return (
    <motion.div 
      className="result-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}
    >
      <Link 
        to="/details" 
        state={{ item, system }}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <div className="card-header">
          <h5>{item.english_name || item.display_name || item.title}</h5>
          <span className="icd-code">{item.code || 'No code'}</span>
        </div>

        <div className="card-table">
          <table>
            <tbody>
              {system === 'Ayurveda' && (
                <>
                  {item.hindi_name && (
                    <tr>
                      <td><strong>Hindi</strong></td>
                      <td>{item.hindi_name}</td>
                    </tr>
                  )}
                  {item.diacritical_name && (
                    <tr>
                      <td><strong>Diacritical</strong></td>
                      <td>{item.diacritical_name}</td>
                    </tr>
                  )}
                </>
              )}

              {system === 'Siddha' && (
                <>
                  {item.tamil_name && (
                    <tr>
                      <td><strong>Tamil</strong></td>
                      <td>{item.tamil_name}</td>
                    </tr>
                  )}
                  {item.romanized_name && (
                    <tr>
                      <td><strong>Romanized</strong></td>
                      <td>{item.romanized_name}</td>
                    </tr>
                  )}
                </>
              )}

              {system === 'Unani' && (
                <>
                  {item.arabic_name && (
                    <tr>
                      <td><strong>Arabic</strong></td>
                      <td>{item.arabic_name}</td>
                    </tr>
                  )}
                  {item.romanized_name && (
                    <tr>
                      <td><strong>Romanized</strong></td>
                      <td>{item.romanized_name}</td>
                    </tr>
                  )}
                </>
              )}

              {system === 'ICD-11' && (
                <>
                  {item.title && (
                    <tr>
                      <td><strong>Title</strong></td>
                      <td>{item.title}</td>
                    </tr>
                  )}
                  {item.chapter_no && (
                    <tr>
                      <td><strong>Chapter</strong></td>
                      <td>{item.chapter_no}</td>
                    </tr>
                  )}
                  {item.foundation_uri && (
                    <tr>
                      <td><strong>URI</strong></td>
                      <td className="uri-truncate">{item.foundation_uri}</td>
                    </tr>
                  )}
                  {item.is_leaf !== undefined && (
                    <tr>
                      <td><strong>Is Leaf</strong></td>
                      <td>
                        <span className={`status ${item.is_leaf ? 'active' : 'inactive'}`}>
                          {item.is_leaf ? 'Yes' : 'No'}
                        </span>
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </Link>
    </motion.div>
  );
};

export default SystemCard;
