import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import './PatientsPage.css';

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen for auth state
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          const patientsRef = collection(db, 'patients');
          const q = query(patientsRef, where('createdBy', '==', currentUser.uid));
          const snap = await getDocs(q);
          const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setPatients(list);
        } catch (err) {
          console.error('Error fetching patients:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setPatients([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="patients-page">
        <div className="container">
          <div className="loading">Loading patients...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="patients-page">
        <div className="container">
          <p>Please log in to view patients.</p>
          <Link to="/" className="cta-button">Go to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="patients-page">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-header"
        >
          <h2>All Registered Patients</h2>
          <p>Total Patients: {patients.length}</p>
          <Link to="/add-patient" className="add-btn">
            + Add New Patient
          </Link>
        </motion.div>

        {patients.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
            <p>No patients found.</p>
            <Link to="/add-patient" className="cta-button">Register Your First Patient</Link>
          </motion.div>
        ) : (
          <motion.div
            className="patients-grid"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
            }}
          >
            {patients.map((patient) => (
              <motion.div
                key={patient.id}
                className="patient-card"
                variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
              >
                <div className="card-header">
                  <h4>{patient.fullName || 'Unknown Name'}</h4>
                  <span className="badge">{patient.gender || 'N/A'}</span>
                </div>
                <div className="card-body">
                  <p><strong>Age:</strong> {patient.age || 'N/A'}</p>
                  <p><strong>Phone:</strong> {patient.phone || 'N/A'}</p>
                  <p><strong>City:</strong> {patient.city || 'N/A'}, {patient.state || 'N/A'}</p>
                  <p><strong>Blood Group:</strong> {patient.bloodGroup || 'N/A'}</p>
                </div>
                <div className="card-footer">
                  <Link to={`/patient/${patient.id}`} className="view-link">View Details →</Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PatientsPage;
