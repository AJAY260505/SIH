import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut 
} from 'firebase/auth';
import { 
  getDoc, 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from './firebase/config'; // Ensure your firebase config exports both auth and db

import Header from './components/Header';
import AuthModal from './components/AuthModal';
import ProfilePage from './components/ProfilePage';
import PatientForm from './components/PatientForm';
import DoctorDashboard from './components/DoctorDashboard';
import LandingPage from './components/LandingPage';
import SearchPage from './components/SearchPage';
import SystemPage from './components/SystemPage';
import DetailedViewPage from './components/DetailedViewPage'; // New detailed view page
import MappingDetailsPage from './components/MappingDetailsPage';
import Footer from './components/Footer';
import './styles/App.css';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerChildren = {
  visible: { transition: { staggerChildren: 0.1 } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

// API base URL
const API_BASE_URL = "http://localhost:8000";

function App() {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    // Set initial theme based on system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
    
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
    });
    
    return unsubscribe;
  }, []);

  const fetchUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleSignIn = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  const handleEmailAuth = async (email, password, name, mode) => {
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        await setDoc(doc(db, 'users', result.user.uid), {
          name,
          email,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          name: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const switchAuthMode = (mode) => {
    setAuthMode(mode);
  };

  return (
    <Router>
      <div className={`App ${theme}`}>
        <Header 
          theme={theme} 
          toggleTheme={toggleTheme} 
          user={user} 
          handleSignIn={handleSignIn} 
          handleSignOut={handleSignOut} 
        />
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/ayurveda" element={<SystemPage systemName="ayurveda" />} />
            <Route path="/siddha" element={<SystemPage systemName="siddha" />} />
            <Route path="/unani" element={<SystemPage systemName="unani" />} />
            <Route path="/icd11" element={<SystemPage systemName="icd11" />} />
            <Route path="/view-details" element={<DetailedViewPage />} /> {/* New route */}
            <Route path="/details" element={<DetailedViewPage />} />
            <Route path="/mapping-details" element={<MappingDetailsPage />} />
            <Route path="/profile" element={<ProfilePage user={user} />} />
            <Route path="/add-patient" element={<PatientForm />} />
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          </Routes>
        </main>
        <Footer />
        
        <AuthModal 
          isOpen={authModalOpen}
          onClose={closeAuthModal}
          onSwitchMode={switchAuthMode}
          authMode={authMode}
          onAuth={handleEmailAuth}
        />
      </div>
    </Router>
  );
}

export default App;
