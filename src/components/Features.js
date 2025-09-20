import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import './Features.css';

const Features = () => {
  const ref = useRef();
  const inView = useInView(ref, {
    threshold: 0.15,
    triggerOnce: true
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.7, 
        ease: "easeOut",
        scale: { type: "spring", stiffness: 200 }
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: { duration: 0.6, type: "spring", stiffness: 200 }
    }
  };

  return (
    <section className="features" ref={ref}>
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        Key Features
      </motion.h2>
      <motion.div
        className="features-grid"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        <motion.div className="feature-card" variants={itemVariants}>
          <motion.div className="feature-icon" variants={iconVariants}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
          <h3>Common Search</h3>
          <p>
            Search by symptoms or diseases (e.g., "fever") across all traditional medicine systems.
          </p>
        </motion.div>

        <motion.div className="feature-card" variants={itemVariants}>
          <motion.div className="feature-icon" variants={iconVariants}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 6.25278V19.2528M12 6.25278C10.8321 5.47686 9.24649 5 7.5 5C5.75351 5 4.16789 5.47686 3 6.25278V19.2528C4.16789 18.4769 5.75351 18 7.5 18C9.24649 18 10.8321 18.4769 12 19.2528M12 6.25278C13.1679 5.47686 14.7535 5 16.5 5C18.2465 5 19.8321 5.47686 21 6.25278V19.2528C19.8321 18.4769 18.2465 18 16.5 18C14.7535 18 13.1679 18.4769 12 19.2528" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
          <h3>Knowledge Base</h3>
          <p>
            Ayurveda, Siddha, and Unani medicines mapped to ICD codes for standardized reference.
          </p>
        </motion.div>

        <motion.div className="feature-card" variants={itemVariants}>
          <motion.div className="feature-icon" variants={iconVariants}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 10V3L4 14H11V21L20 10H13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
          <h3>API Ready</h3>
          <p>
            Seamlessly integrate with EMR/EHR systems using our powerful and flexible API.
          </p>
        </motion.div>

        <motion.div className="feature-card" variants={itemVariants}>
          <motion.div className="feature-icon" variants={iconVariants}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 6V4M12 6C10.8954 6 10 6.89543 10 8C10 9.10457 10.8954 10 12 10M12 6C13.1046 6 14 6.89543 14 8C14 9.10457 13.1046 10 12 10M6 18C4.89543 18 4 17.1046 4 16C4 14.8954 4.89543 14 6 14M6 18C7.10457 18 8 17.1046 8 16C8 14.8954 7.10457 14 6 14M6 18V20M6 14V4M12 10V20M18 18C16.8954 18 16 17.1046 16 16C16 14.8954 16.8954 14 18 14M18 18C19.1046 18 20 17.1046 20 16C20 14.8954 19.1046 14 18 14M18 18V20M18 14V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
          <h3>Custom Filters</h3>
          <p>
            Easily filter by medical system of interest and personalize results to your needs.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Features;