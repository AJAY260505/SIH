import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import './PatientDetail.css';

const PatientDetail = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  /* ----------  data fetch unchanged  ---------- */
  useEffect(() => {
    const fetchPatientData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const patientDoc = await getDoc(doc(db, 'patients', patientId));
        if (patientDoc.exists()) {
          const data = patientDoc.data();
          setPatientData(data);
          setFormData(data);
          if (data.createdBy !== auth.currentUser?.uid) {
            setError('You do not have permission to view this patient record.');
          } else {
            setError('');
          }
        } else {
          setError('Patient record not found.');
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
        setError('Error loading patient data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatientData();
  }, [patientId]);

  /* ----------  form handlers unchanged  ---------- */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setError('');
    try {
      await updateDoc(doc(db, 'patients', patientId), {
        ...formData,
        updatedAt: new Date(),
      });
      setPatientData(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating patient:', error);
      setError('Error updating patient record.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setFormData(patientData);
    setIsEditing(false);
    setError('');
  };

  /* ----------  loading / permission unchanged  ---------- */
  if (isLoading) {
    return (
      <div className="patient-detail">
        <div className="container">
          <div className="loading">Loading patient data...</div>
        </div>
      </div>
    );
  }

  if (error && !isLoading) {
    return (
      <div className="patient-detail">
        <div className="container">
          <div className="error-message">
            <h2>Error</h2>
            <p>{error}</p>
            <Link to="/doctor-dashboard" className="cta-button">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ----------  UI: now theme-aware  ---------- */
  return (
    <div className="patient-detail">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="patient-header"
        >
          <div className="header-content">
            <div className="back-nav">
              <button onClick={() => navigate(-1)} className="back-button">
                ← Back
              </button>
            </div>
            <div className="patient-title">
              <h2>{isEditing ? 'Edit Patient' : 'Patient Details'}</h2>
              <p className="centered-text">{patientData?.fullName}</p>

            </div>
            {!isEditing && patientData?.createdBy === auth.currentUser?.uid && (
              <div className="action-buttons">
                <button onClick={() => setIsEditing(true)} className="edit-button">
                  Edit Patient
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Form or Read-only */}
        {isEditing ? (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="patient-edit-form"
          >
            <div className="form-sections">
              {/* Personal Information */}
              <div className="form-section">
                <h3>Personal Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender *</label>
                    <select
                      name="gender"
                      value={formData.gender || ''}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="form-section">
                <h3>Contact Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="form-section">
                <h3>Medical Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Blood Group</label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup || ''}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label>Allergies</label>
                    <textarea
                      name="allergies"
                      value={formData.allergies || ''}
                      onChange={handleInputChange}
                      rows="3"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Chronic Illnesses</label>
                    <textarea
                      name="chronicIllnesses"
                      value={formData.chronicIllnesses || ''}
                      onChange={handleInputChange}
                      rows="3"
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="cancel-button"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Update Patient'}
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="patient-details-view"
          >
            <div className="details-sections">
              {/* Personal Information */}
              <div className="details-section">
                <h3>Personal Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Full Name:</label>
                    <span>{patientData?.fullName || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Gender:</label>
                    <span>{patientData?.gender || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Date of Birth:</label>
                    <span>{patientData?.dob || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Age:</label>
                    <span>{patientData?.age || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Aadhar No:</label>
                    <span>{patientData?.nationalId || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="details-section">
                <h3>Contact Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Phone:</label>
                    <span>{patientData?.phone || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{patientData?.email || 'Not provided'}</span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Address:</label>
                    <span>{patientData?.address || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>City:</label>
                    <span>{patientData?.city || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>State:</label>
                    <span>{patientData?.state || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>ZIP Code:</label>
                    <span>{patientData?.zip || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Country:</label>
                    <span>{patientData?.country || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="details-section">
                <h3>Medical Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Blood Group:</label>
                    <span>{patientData?.bloodGroup || 'Not provided'}</span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Allergies:</label>
                    <span>{patientData?.allergies || 'None recorded'}</span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Chronic Illnesses:</label>
                    <span>{patientData?.chronicIllnesses || 'None recorded'}</span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Current Medications:</label>
                    <span>{patientData?.currentMedications || 'None recorded'}</span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Past Medical History:</label>
                    <span>{patientData?.pastMedicalHistory || 'None recorded'}</span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Family Medical History:</label>
                    <span>{patientData?.familyMedicalHistory || 'None recorded'}</span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Vaccination History:</label>
                    <span>{patientData?.vaccinationHistory || 'None recorded'}</span>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="details-section">
                <h3>Emergency Contact</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{patientData?.emergencyName || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Relationship:</label>
                    <span>{patientData?.emergencyRelationship || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone:</label>
                    <span>{patientData?.emergencyPhone || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Insurance Information */}
              <div className="details-section">
                <h3>Insurance Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Provider:</label>
                    <span>{patientData?.insuranceProvider || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Policy Number:</label>
                    <span>{patientData?.policyNumber || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Validity:</label>
                    <span>{patientData?.validity || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Contact:</label>
                    <span>{patientData?.insuranceContact || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PatientDetail;