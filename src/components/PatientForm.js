import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import './PatientForm.css';


const PatientForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    dob: '',
    age: '',
    nationalId: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    bloodGroup: '',
    allergies: '',
    chronicIllnesses: '',
    currentMedications: '',
    pastMedicalHistory: '',
    familyMedicalHistory: '',
    vaccinationHistory: '',
    emergencyName: '',
    emergencyRelationship: '',
    emergencyPhone: '',
    insuranceProvider: '',
    policyNumber: '',
    validity: '',
    insuranceContact: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'dob' && value) {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setFormData(prev => ({
        ...prev,
        age: age > 0 ? age.toString() : ''
      }));
    }
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('You must be logged in to register a patient');

      await addDoc(collection(db, 'patients'), {
        ...formData,
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });

      setSubmitStatus('success');
      setFormData({
        fullName: '',
        gender: '',
        dob: '',
        age: '',
        nationalId: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        bloodGroup: '',
        allergies: '',
        chronicIllnesses: '',
        currentMedications: '',
        pastMedicalHistory: '',
        familyMedicalHistory: '',
        vaccinationHistory: '',
        emergencyName: '',
        emergencyRelationship: '',
        emergencyPhone: '',
        insuranceProvider: '',
        policyNumber: '',
        validity: '',
        insuranceContact: ''
      });
    } catch (error) {
      console.error('Error submitting patient form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="patient-form-page">
        <div className="container">
          <div className="success-message">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
             <img src="/suc.gif" alt="Success" className="success-gif" />

              <h2>Patient Registered Successfully!</h2>
              <p>The patient information has been saved to the database.</p>
              <div className="success-actions">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSubmitStatus(null)}
                  className="reg-another"
                >
                  Register Another Patient
                </motion.button>
                <Link to="/doctor-dashboard" className="reg-another outline">
                  Go to Dashboard
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-form-page">
          <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="form-header"
        >
          <h2>Patient Registration</h2>
          <div className="step-indicator">
            <span className={currentStep >= 1 ? 'active' : ''}>1. Personal</span>
            <span className={currentStep >= 2 ? 'active' : ''}>2. Contact</span>
            <span className={currentStep >= 3 ? 'active' : ''}>3. Medical</span>
            <span className={currentStep >= 4 ? 'active' : ''}>4. Emergency</span>
            <span className={currentStep >= 5 ? 'active' : ''}>5. Insurance</span>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="patient-form">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="form-step"
            >
              <h3>Personal Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    readOnly
                  />
                </div>
                <div className="form-group full-width">
                  <label>National ID / Passport No</label>
                  <input
                    type="text"
                    name="nationalId"
                    value={formData.nationalId}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-navigation">
                <button type="button" className="next-btn" onClick={nextStep}>
                  Next: Contact Information
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="form-step"
            >
              <h3>Contact Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>ZIP Code *</label>
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Country *</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-navigation">
                <button type="button" className="prev-btn" onClick={prevStep}>
                  Previous: Personal Information
                </button>
                <button type="button" className="next-btn" onClick={nextStep}>
                  Next: Medical Information
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Medical Information */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="form-step"
            >
              <h3>Medical Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
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
                  <label>Known Allergies</label>
                  <textarea
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    placeholder="List any known allergies (medications, foods, environmental, etc.)"
                    rows="3"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Chronic Illnesses</label>
                  <textarea
                    name="chronicIllnesses"
                    value={formData.chronicIllnesses}
                    onChange={handleInputChange}
                    placeholder="e.g., Diabetes, Hypertension, Asthma, etc."
                    rows="3"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Current Medications</label>
                  <textarea
                    name="currentMedications"
                    value={formData.currentMedications}
                    onChange={handleInputChange}
                    placeholder="Medication name, dosage, frequency"
                    rows="3"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Past Medical History</label>
                  <textarea
                    name="pastMedicalHistory"
                    value={formData.pastMedicalHistory}
                    onChange={handleInputChange}
                    placeholder="Surgeries, hospitalizations, major illnesses"
                    rows="3"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Family Medical History (optional)</label>
                  <textarea
                    name="familyMedicalHistory"
                    value={formData.familyMedicalHistory}
                    onChange={handleInputChange}
                    placeholder="Diabetes, heart disease, genetic disorders in family"
                    rows="3"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Vaccination History (optional)</label>
                  <textarea
                    name="vaccinationHistory"
                    value={formData.vaccinationHistory}
                    onChange={handleInputChange}
                    placeholder="COVID-19, hepatitis, flu shots, etc."
                    rows="3"
                  />
                </div>
              </div>
              <div className="form-navigation">
                <button type="button" className="prev-btn" onClick={prevStep}>
                  Previous: Contact Information
                </button>
                <button type="button" className="next-btn" onClick={nextStep}>
                  Next: Emergency Contact
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Emergency Contact */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="form-step"
            >
              <h3>Emergency Contact</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="emergencyName"
                    value={formData.emergencyName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Relationship *</label>
                  <input
                    type="text"
                    name="emergenceRelationship"
                    value={formData.emergenceRelationship}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Spouse, Parent, Sibling"
                  />
                </div>
                <div className="form-group">
                  <label>Contact Number *</label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-navigation">
                <button type="button" className="prev-btn" onClick={prevStep}>
                  Previous: Medical Information
                </button>
                <button type="button" className="next-btn" onClick={nextStep}>
                  Next: Insurance Information
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Insurance Information */}
          {currentStep === 5 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="form-step"
            >
              <h3>Insurance Information (Optional)</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Insurance Provider</label>
                  <input
                    type="text"
                    name="insuranceProvider"
                    value={formData.insuranceProvider}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Policy Number</label>
                  <input
                    type="text"
                    name="policyNumber"
                    value={formData.policyNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Validity</label>
                  <input
                    type="date"
                    name="validity"
                    value={formData.validity}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Insurance Contact Info</label>
                  <input
                    type="text"
                    name="insuranceContact"
                    value={formData.insuranceContact}
                    onChange={handleInputChange}
                    placeholder="Phone number or email"
                  />
                </div>
              </div>
              <div className="form-navigation">
                <button type="button" className="prev-btn" onClick={prevStep}>
                  Previous: Emergency Contact
                </button>
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Register Patient'}
                </button>
              </div>
            </motion.div>
          )}

          {submitStatus === 'error' && (
            <div className="error-message">
              There was an error submitting the form. Please try again.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PatientForm;
