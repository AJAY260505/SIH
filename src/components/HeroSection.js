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

  const [ripples, setRipples] = useState([]);

  const createRipple = (e) => {
    const button = e.currentTarget;
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left - radius;
    const y = e.clientY - rect.top - radius;

    const newRipple = { x, y, size: diameter, key: Date.now() };
    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.key !== newRipple.key));
    }, 600);
  };

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
          <Link to="/search" className="cta-button" onClick={createRipple}>
            Get Started
            {ripples.map((r) => (
              <span
                className="ripple"
                key={r.key}
                style={{
                  width: r.size,
                  height: r.size,
                  left: r.x,
                  top: r.y
                }}
              />
            ))}
          </Link>
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
            FEHR
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
    </section>
  );
};

export default HeroSection;
