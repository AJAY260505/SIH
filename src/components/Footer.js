import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Footer.css';
const Footer = () => {
  return (
    <motion.footer 
      className="footer"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="containers">
        <div className="footer-content">
          <div className="footer-section">
            <h3>ICD-TM2 Platform</h3>
            <p>Bridging modern healthcare with traditional medicine knowledge systems.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/search">Search</Link></li>
              <li><Link to="/ayurveda">Ayurveda</Link></li>
              <li><Link to="/siddha">Siddha</Link></li>
              <li><Link to="/unani">Unani</Link></li>
              <li><Link to="/icd11">ICD-11</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Email: info@icd-tm2.org</p>
            <p>Phone: +91 9876543210</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2023 ICD-TM2 API Integration Platform. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;