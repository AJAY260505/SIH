import React from 'react';
import { motion } from 'framer-motion';
import HeroSection from './HeroSection';
import ValueProposition from './ValueProposition';
import Features from './Features';

import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <HeroSection />
      
      <div className="intro-section">
        <div className="container">
          <motion.p 
            className="intro-text"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            This platform integrates NAMASTE and ICD-II via the Traditional Medicine Module 2 (TM2) into EMR systems, enabling healthcare providers to access standardized diagnosis codes and traditional medicine treatments seamlessly.
          </motion.p>
        </div>
      </div>
      <ValueProposition />
      <Features />
    </div>
  );
};

export default LandingPage;