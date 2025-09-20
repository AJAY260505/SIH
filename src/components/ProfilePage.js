import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile, signOut } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import './ProfilePage.css';

const ProfilePage = ({ user }) => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [imageError, setImageError] = useState(false); // 🔹 Track image load error
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    dob: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    specialty: '',
    education: '',
    experience: '',
    availability: ''
  });

  const navigate = useNavigate();
  const defaultAvatar = 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_incoming&w=740&q=80';

  // 🔹 Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setFormData({
              name: data.name || user.displayName || '',
              email: data.email || user.email || '',
              age: data.age || '',
              gender: data.gender || '',
              dob: data.dob || '',
              phone: data.phone || '',
              address: data.address || '',
              city: data.city || '',
              state: data.state || '',
              zip: data.zip || '',
              specialty: data.specialty || '',
              education: data.education || '',
              experience: data.experience || '',
              availability: data.availability || ''
            });
          } else {
            // Create a new doc if not exists
            const newUser = {
              name: user.displayName || '',
              email: user.email || '',
              createdAt: serverTimestamp()
            };
            await setDoc(doc(db, 'users', user.uid), newUser);
            setUserData(newUser);
            setFormData({ ...formData, ...newUser });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [user]);

  // 🔹 Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 🔹 Save changes
  const handleSave = async () => {
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          ...userData,
          ...formData,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );

      setUserData({ ...userData, ...formData });
      setIsEditing(false);

      // Update auth profile name
      if (formData.name !== user.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: formData.name
        });
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  // 🔹 Logout functionality
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // redirect to home after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="not-signed-in">
            <h2>Please sign in to view your profile</h2>
            <Link to="/" className="cta-button">Go to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="profile-header"
        >
          <div className="profile-avatar">
            <img
              src={user.photoURL || '/default-avatar.png'}
              alt={user.displayName || 'User'}
            />
          </div>
          <div className="profile-info">
            <h2>{userData?.name || user.displayName || 'User'}</h2>
            <p>{userData?.specialty || 'Healthcare Professional'}</p>
            <p>{userData?.email || user.email}</p>
          </div>

          <div className="profile-actions">
            <motion.button
              className="edit-btn"
              onClick={() => setIsEditing(!isEditing)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </motion.button>

            <motion.button
              className="logout-btn"
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Logout
            </motion.button>
          </div>
        </motion.div>

        {/* Profile Details */}
        <div className="profile-content">
          {/* PERSONAL INFO */}
          <div className="profile-section">
            <h3>Personal Information</h3>
            <div className="profile-details">
              <div className="detail-row">
                <label>Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                ) : (
                  <span>{userData?.name || 'Not provided'}</span>
                )}
              </div>
              <div className="detail-row">
                <label>Email</label>
                <span>{userData?.email || user.email || 'Not provided'}</span>
              </div>
              <div className="detail-row">
                <label>Age</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                  />
                ) : (
                  <span>{userData?.age || 'Not provided'}</span>
                )}
              </div>
              <div className="detail-row">
                <label>Gender</label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                ) : (
                  <span>
                    {userData?.gender
                      ? userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1)
                      : 'Not provided'}
                  </span>
                )}
              </div>
              <div className="detail-row">
                <label>Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                  />
                ) : (
                  <span>{userData?.dob || 'Not provided'}</span>
                )}
              </div>
              <div className="detail-row">
                <label>Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                ) : (
                  <span>{userData?.phone || 'Not provided'}</span>
                )}
              </div>
            </div>
          </div>

          {/* ADDRESS INFO */}
          <div className="profile-section">
            <h3>Address Information</h3>
            <div className="profile-details">
              <div className="detail-row">
                <label>Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                ) : (
                  <span>{userData?.address || 'Not provided'}</span>
                )}
              </div>
              <div className="detail-row">
                <label>City</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                ) : (
                  <span>{userData?.city || 'Not provided'}</span>
                )}
              </div>
              <div className="detail-row">
                <label>State</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                ) : (
                  <span>{userData?.state || 'Not provided'}</span>
                )}
              </div>
              <div className="detail-row">
                <label>ZIP Code</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleInputChange}
                  />
                ) : (
                  <span>{userData?.zip || 'Not provided'}</span>
                )}
              </div>
            </div>
          </div>

          {/* SAVE BUTTON */}
          {isEditing && (
            <motion.div
              className="save-section"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.button
                className="save-btn"
                onClick={handleSave}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Save Changes
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
