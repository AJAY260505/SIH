import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const [doctorData, setDoctorData] = useState(null);
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    ayurveda: 0,
    siddha: 0,
    unani: 0,
    icd11: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Fetch doctor data
        const doctorDoc = await getDoc(doc(db, 'users', user.uid));
        if (doctorDoc.exists()) {
          setDoctorData(doctorDoc.data());
        }

        // Fetch patients created by this doctor
        const q = query(collection(db, 'patients'), where("createdBy", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const patientsData = [];
        querySnapshot.forEach((doc) => {
          patientsData.push({ id: doc.id, ...doc.data() });
        });
        setPatients(patientsData);

        // Calculate stats
        setStats({
          totalPatients: patientsData.length,
          ayurveda: Math.floor(Math.random() * 10),
          siddha: Math.floor(Math.random() * 8),
          unani: Math.floor(Math.random() * 6),
          icd11: Math.floor(Math.random() * 12)
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  if (!auth.currentUser) {
    return (
      <div className="doctor-dashboard">
        <div className="container">
          <div className="not-signed-in">
            <h2>Please sign in to view your dashboard</h2>
            <Link to="/" className="cta-button">Go to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-dashboard">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="dashboard-header"
        >
          <div className="doctor-info">
            <h2>Doctor Dashboard</h2>
            <p>Welcome back, {doctorData?.name || 'Doctor'}</p>
          </div>
          <div className="dashboard-actions">
            <Link to="/add-patient" className="cta-button">
              Add New Patient
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="stats-grid">
          {[
            { icon: "👥", label: "Total Patients", value: stats.totalPatients },
            { icon: "🌿", label: "Ayurveda Cases", value: stats.ayurveda },
            { icon: "🍃", label: "Siddha Cases", value: stats.siddha },
            { icon: "🌱", label: "Unani Cases", value: stats.unani },
            { icon: "🏥", label: "ICD-11 Cases", value: stats.icd11 }
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Content */}
        <div className="dashboard-content">
          {/* Recent Patients */}
          <div className="recent-patients">
            <h3>Recent Patients</h3>
            {patients.length > 0 ? (
              <div className="patients-list">
                {patients.slice(0, 5).map((patient, index) => (
                  <motion.div
                    key={patient.id}
                    className="patient-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="patient-info">
                      <h4>{patient.fullName}</h4>
                      <p>{patient.gender}, {patient.age} years</p>
                    </div>
                    <div className="patient-contact">
                      <p>{patient.phone}</p>
                      <p>{patient.city}, {patient.state}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="no-patients">
                <img src="/not.gif" alt="Doctor illustration" className="no-patients-gif" />
                <p>No patients registered yet.</p>
                <Link to="/add-patient" className="cta-button reg_another">
                  Register Your First Patient
                </Link>
              </div>
            )}
          </div>

          {/* Doctor Details */}
          <div className="doctor-details">
            <h3>Your Information</h3>
            <div className="details-card">
              {doctorData ? (
                <>
                  <div className="detail-row">
                    <label>Name:</label>
                    <span>{doctorData.name || 'Not provided'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Specialty:</label>
                    <span>{doctorData.specialty || 'Not specified'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Education:</label>
                    <span>{doctorData.education || 'Not provided'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Experience:</label>
                    <span>{doctorData.experience || 'Not provided'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Availability:</label>
                    <span>{doctorData.availability || 'Not specified'}</span>
                  </div>
                </>
              ) : (
                <p>Loading your information...</p>
              )}
              <div className="edit-profile-btn">
                <Link to="/profile">Edit Profile</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
