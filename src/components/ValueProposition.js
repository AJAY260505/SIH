import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import './ValueProposition.css';

const ValueProposition = () => {
  const ref = useRef();
  const inView = useInView(ref, {
    threshold: 0.1,
    triggerOnce: true
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: { duration: 0.5, type: "spring", stiffness: 150 }
    }
  };

  return (
    <section className="value-proposition" ref={ref}>
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        Why It Matters
      </motion.h2>
      <motion.div 
        className="value-items"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        <motion.div className="value-item" variants={itemVariants}>
          <motion.div className="value-icon" variants={iconVariants}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 12H20M20 12L14 6M20 12L14 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
          <h3>Interoperability with EHR Standards (India)</h3>
          <p>Seamlessly integrates with existing Electronic Health Record systems</p>
        </motion.div>
        
        <motion.div className="value-item" variants={itemVariants}>
          <motion.div className="value-icon" variants={iconVariants}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16L16 12M16 12L12 8M16 12H8M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
          <h3>ICD Classification Integration</h3>
          <p>Ensures accurate diagnoses with standardized coding</p>
        </motion.div>
        
        <motion.div className="value-item" variants={itemVariants}>
          <motion.div className="value-icon" variants={iconVariants}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M12 3C12.5523 3 13 2.55228 13 2C13 1.44772 12.5523 1 12 1C11.4477 1 11 1.44772 11 2C11 2.55228 11.4477 3 12 3ZM12 3C12 3 16 4 16 8C16 12 12 15 12 15C12 15 8 12 8 8C8 4 12 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
          <h3>Traditional Medicine Support</h3>
          <p>Comprehensive support for Ayurveda, Siddha, and Unani systems</p>
        </motion.div>
        
        <motion.div className="value-item" variants={itemVariants}>
          <motion.div className="value-icon" variants={iconVariants}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
          <h3>Unified Search across all systems</h3>
          <p>Find treatments across all traditional medicine systems in one place</p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ValueProposition;