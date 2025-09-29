import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './HeroSection.css';

const HeroSection = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false
  });

  return (
    <section className="hero" ref={ref}>
      <div className="hero-image hero-image-left">
        <motion.img
          src="/img6.png"
          alt="Left Illustration"
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
        />
      </div>

      <div className="hero-content">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          ICD–TM2 API Integration Platform
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Bridging Modern EHR Systems with Traditional Medicine Knowledge
          (Ayurveda, Siddha, Unani, ICD11)
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="buttons">
            <Link to="/search" className="blob-btn">
              Get Started
              <span className="blob-btn__inner">
                <span className="blob-btn__blobs">
                  <span className="blob-btn__blob"></span>
                  <span className="blob-btn__blob"></span>
                  <span className="blob-btn__blob"></span>
                  <span className="blob-btn__blob"></span>
                </span>
              </span>
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="hero-visual">
        <motion.div
          className="doctor-icon"
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        ></motion.div>

        <motion.div
          className="data-flow"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <motion.div
            className="flow-item"
            whileHover={{
              scale: 1.1,
              backgroundColor: 'var(--primary-color)',
              color: 'white'
            }}
          >
            FHIR
          </motion.div>
          <div className="flow-arrow">→</div>
          <motion.div
            className="flow-item"
            whileHover={{
              scale: 1.1,
              backgroundColor: 'var(--secondary-color)',
              color: 'white'
            }}
          >
            ICD-II
          </motion.div>
          <div className="flow-arrow">→</div>
          <motion.div
            className="flow-item"
            whileHover={{
              scale: 1.1,
              backgroundColor: 'var(--accent-color)',
              color: 'white'
            }}
          >
            NAMASTE
          </motion.div>
          <div className="flow-arrow">→</div>

          <div className="medicine-icons">
            <motion.img
              src="/img5.png"
              alt="Icon 1"
              className="medicine-icon"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, delay: 0 }}
            />
            <motion.img
              src="/img3.png"
              alt="Icon 2"
              className="medicine-icon"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 4, delay: 1 }}
            />
            <motion.img
              src="/img1.png"
              alt="Icon 3"
              className="medicine-icon"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, delay: 2 }}
            />
            <motion.img
              src="/img4.png"
              alt="Icon 4"
              className="medicine-icon"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 4, delay: 3 }}
            />
          </div>
        </motion.div>
      </div>

      <div className="hero-image hero-image-right">
        <motion.img
          src="/img2.png"
          alt="Right Illustration"
          initial={{ opacity: 0, x: 50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
        />
      </div>

      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" className="goo-filter">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="10"></feGaussianBlur>
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 21 -7" result="goo"></feColorMatrix>
            <feBlend in2="goo" in="SourceGraphic" result="mix"></feBlend>
          </filter>
        </defs>
      </svg>
    </section>
  );
};

export default HeroSection;