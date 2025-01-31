import React, { useState } from 'react';
import { useNavigate} from 'react-router-dom';
import styles from './Dashboard.module.css';
import { linkService } from '../services/linkService';


const Layout = ({ children, user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNewLinkModal, setShowNewLinkModal] = useState(false);
  const [newLinkForm, setNewLinkForm] = useState({
    destinationUrl: '',
    comments: '',
    hasExpiration: false,
    expirationDate: ''
  });
  

  const handleNewLinkChange = (field, value) => {
    setNewLinkForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNewLinkSubmit = async (e) => {
    e.preventDefault();
    try {
      await linkService.createLink(newLinkForm);
      setShowNewLinkModal(false);
      setNewLinkForm({
        destinationUrl: '',
        comments: '',
        hasExpiration: false,
        expirationDate: ''
      });
    } catch (error) {
      console.error('Error creating link:', error);
    }
  };


  const handleNavigation = (path) => {
    setActiveTab(path);
    navigate(`/${path}`);
  };
  const NewLinkModal = () => (
    <div className={styles.modalOverlay}>
      <div className={styles.newLinkModal}>
        <div className={styles.modalHeader}>
          <h2>New Link</h2>
          <button 
            className={styles.closeButton} 
            onClick={() => setShowNewLinkModal(false)}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleNewLinkSubmit}>
          <div className={styles.formGroup}>
            <label>Destination Url *</label>
            <input
              type="url"
              value={newLinkForm.destinationUrl}
              onChange={(e) => handleNewLinkChange('destinationUrl', e.target.value)}
              placeholder="https://web.whatsapp.com/"
              required
            /> 
            </div>

          <div className={styles.formGroup}>
            <label>Comments *</label>
            <textarea
              value={newLinkForm.comments}
              onChange={(e) => handleNewLinkChange('comments', e.target.value)}
              placeholder="Add remarks"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.expirationToggle}>
              <label>Link Expiration</label>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={newLinkForm.hasExpiration}
                  onChange={(e) => handleNewLinkChange('hasExpiration', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
            {newLinkForm.hasExpiration && (
              <input
                type="datetime-local"
                value={newLinkForm.expirationDate}
                onChange={(e) => handleNewLinkChange('expirationDate', e.target.value)}
                className={styles.dateInput}
              />
            )}
          </div>

          <div className={styles.modalActions}>
            <button 
              type="button" 
              className={styles.clearButton}
              onClick={() => setShowNewLinkModal(false)}
            >
              Clear
            </button>
            <button type="submit" className={styles.createButton}>
              Create new
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>Covette</div>
        <nav className={styles.sideNav}>
          <ul>
            <li 
              className={`${activeTab === 'dashboard' ? styles.active : ''}`}
              onClick={() => handleNavigation('dashboard')}
            >
              <span className={styles.icon}>📊</span>
              Dashboard
            </li>
            <li 
              className={`${activeTab === 'links' ? styles.active : ''}`}
              onClick={() => handleNavigation('links')}
            >
              <span className={styles.icon}>🔗</span>
              Links
            </li>
            <li 
              className={`${activeTab === 'analytics' ? styles.active : ''}`}
              onClick={() => handleNavigation('analytics')}
            >
              <span className={styles.icon}>📈</span>
              Analytics
            </li>
            <li 
              className={`${activeTab === 'settings' ? styles.active : ''}`}
              onClick={() => handleNavigation('settings')}
            >
              <span className={styles.icon}>⚙️</span>
              Settings
            </li>
          </ul>
        </nav>
      </aside>
      
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.welcome}>
            👋 Good morning, {user?.name || 'User'}
          </div>
          <div className={styles.headerRight}>
            <button 
              className={styles.createButton}
              onClick={() => setShowNewLinkModal(true)}
            >
              + Create new
            </button>
            <input 
              type="text" 
              className={styles.searchInput} 
              placeholder=" 🔍Search by remarks" 
            />
            <div className={styles.avatar}></div>
          </div>
        </header>
        <main className={styles.main}>
          {children}
        </main>
      </div>
      {showNewLinkModal && <NewLinkModal />}

    </div>
  );
};

export default Layout;