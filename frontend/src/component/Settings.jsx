import React, { useState } from 'react';
import styles from './Dashboard.module.css';
import { updateUser, deleteUser } from '../services/authService';

const Settings = ({ user }) => {
  const [settings, setSettings] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || ''
  });

  const handleSettingsChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      await updateUser(settings);
      // Handle success (maybe show a notification)
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteUser();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };
  return (
    <div className={styles.settingsContainer}>
      <div className={styles.settingsForm}>
        <div className={styles.formGroup}>
          <label>Name</label>
          <input
            type="text"
            value={settings.name}
            onChange={(e) => handleSettingsChange('name', e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Email Id</label>
          <input
            type="email"
            value={settings.email}
            onChange={(e) => handleSettingsChange('email', e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Mobile no</label>
          <input
            type="text"
            value={settings.mobile}
            onChange={(e) => handleSettingsChange('mobile', e.target.value)}
          />
        </div>
        <button 
          className={styles.saveButton}
          onClick={handleSaveSettings}
        >
          Save Changes
        </button>
        <button 
          className={styles.deleteAccountButton}
          onClick={handleDeleteAccount}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default Settings;