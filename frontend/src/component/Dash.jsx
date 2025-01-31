import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import { getUser, updateUser, deleteUser } from '../services/authService';
import { linkService } from '../services/linkService';
import {analyticsService} from '../services/analyticsService';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [user, setUser] = useState(null);
  const [links, setLinks] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [showNewLinkModal, setShowNewLinkModal] = useState(false);
  const [newLinkForm, setNewLinkForm] = useState({
    destinationUrl: '',
    comments: '',
    hasExpiration: false,
    expirationDate: ''
  });
  const [statistics, setStatistics] = useState({
    dateWiseClicks: [],
    deviceClicks: []
  });
  const [settings, setSettings] = useState({
    name: '',
    email: '',
    mobile: ''
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUser();
        setUser(userData);
        setSettings({
          name: userData.name,
          email: userData.email,
          mobile: userData.mobile
        });
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const data = await linkService.getLinks();
        setLinks(data);
      } catch (error) {
        console.error('Error fetching links:', error);
      }
    };
    fetchLinks();
  }, [user]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        console.log('Fetching analytics and statistics...');
        const [analyticsData, statisticsData] = await Promise.all([
          analyticsService.getAnalytics(),
          analyticsService.getStatistics()
        ]);
        console.log('Fetched analytics:', analyticsData);
        console.log('Fetched statistics:', statisticsData);
        setAnalytics(analyticsData);
        setStatistics(statisticsData);
      } catch (error) {
        console.error('Dashboard analytics fetch error:', error);
      }
    };
    
    if (user) {
      fetchAnalyticsData();
    }
  }, [user]);
  const handleDelete = async (id) => {
    setDeleteItemId(id);
    setShowDeleteModal(true);
  };
  
  const hourLabels = Array.from({ length: 24 }, (_, i) => 
    `${i.toString().padStart(2, '0')}:00`
  );
  const confirmDelete = async () => {
    if (!deleteItemId) return;
    
    try {
      await linkService.deleteLink(deleteItemId);
      setLinks(links.filter(link => link._id !== deleteItemId));
      setShowDeleteModal(false);
      setDeleteItemId(null);
    } catch (error) {
      console.error('Error deleting link:', error);
      // Optionally add error handling UI here
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateUser(settings);
      setUser(prev => ({ ...prev, ...settings }));
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

  const handleNewLinkChange = (field, value) => {
    setNewLinkForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleNewLinkSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!newLinkForm.destinationUrl) {
      console.error('Destination URL is required');
      return;
    }
  
    try {
      const newLink = await linkService.createLink(newLinkForm);
      
      // Update links state with new link
      setLinks(prevLinks => [...prevLinks, newLink]);
      
      // Reset form and close modal
      setNewLinkForm({
        destinationUrl: '',
        comments: '',
        hasExpiration: false,
        expirationDate: ''
      });
      setShowNewLinkModal(false);
    } catch (error) {
      console.error('Error creating new link:', error);
    }
  };
  


  const totalClicks = statistics.dateWiseClicks.reduce((sum, item) => sum + item.clicks, 0);
  const maxClicks = Math.max(...statistics.dateWiseClicks.map(item => item.clicks));
  const maxDeviceClicks = Math.max(...statistics.deviceClicks.map(item => item.clicks));

  const DashboardContent = () => (
    <>
      <div className={styles.totalClicks}>
        <h3>Total Clicks</h3>
        <div className={styles.clicksNumber}>{totalClicks}</div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3>Date-wise Clicks</h3>
          <div className={styles.horizontalBarChart}>
            {statistics.dateWiseClicks.map((item, index) => (
              <div key={index} className={styles.horizontalBarGroup}>
                <span className={styles.dateLabel}>{item.date}</span>
                <div className={styles.horizontalBarWrapper}>
                  <div 
                    className={styles.horizontalBar}
                    style={{ width: `${(item.clicks / maxClicks) * 100}%` }}
                  >
                    <span className={styles.barValue}>{item.clicks}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>Click Devices</h3>
          <div className={styles.horizontalBarChart}>
            {statistics.deviceClicks.map((item, index) => (
              <div key={index} className={styles.horizontalBarGroup}>
                <span className={styles.deviceLabel}>{item.device}</span>
                <div className={styles.horizontalBarWrapper}>
                  <div 
                    className={styles.horizontalBar}
                    style={{ width: `${(item.clicks / maxDeviceClicks) * 100}%` }}
                  >
                    <span className={styles.barValue}>{item.clicks}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const LinksContent = () => (
    <div className={styles.linksContainer}>
      <div className={styles.linksTable}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Original Link</th>
              <th>Short Link</th>
              <th>Remarks</th>
              <th>Clicks</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <tr key={link._id}>
                <td>{new Date(link.createdAt).toLocaleDateString()}</td>
                <td className={styles.linkCell}>
                  <span className={styles.truncatedLink}>{link.originalLink}</span>
                </td>
                <td className={styles.linkCell}>
                  {link.shortLink}
                  <button 
                    className={styles.copyButton} 
                    title="Copy link"
                    onClick={() => navigator.clipboard.writeText(link.shortLink)}
                  >
                    <span>📋</span>
                  </button>
                </td>
                <td>{link.remarks}</td>
                <td>{link.clicks}</td>
                <td>
                  <span className={`${styles.status} ${styles[link.status]}`}>
                    {link.status}
                  </span>
                </td>
                <td>
                  <div className={styles.actionButtons}>
                    <button className={styles.actionButton} title="Edit">
                      ✏️
                    </button>
                    <button 
                      className={styles.actionButton} 
                      title="Delete" 
                      onClick={() => handleDelete(link._id)}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
     
      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <p>Are you sure you want to remove this link?</p>
            <div className={styles.modalButtons}>
              <button 
                className={styles.modalButtonNo}
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteItemId(null);
                }}
              >
                NO
              </button>
              <button 
                className={styles.modalButtonYes}
                onClick={confirmDelete}
              >
                YES
              </button>
            </div>
          </div>
        </div>
      )}
    </div> 
  );
  

  const AnalyticsContent = () => (
    <div className={styles.analyticsContainer}>
      <div className={styles.analyticsTable}>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Original Link</th>
              <th>Short Link</th>
              <th>IP Address</th>
              <th>User Device</th>
            </tr>
          </thead>
          <tbody>
            {analytics.map((item, index) => (
              <tr key={index}>
                <td>{item.timestamp}</td>
                <td className={styles.linkCell}>
                  <span className={styles.truncatedLink}>{item.originalLink}</span>
                </td>
                <td className={styles.linkCell}>{item.shortLink}</td>
                <td>{item.ipAddress}</td>
                <td>{item.userDevice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const SettingsContent = () => (
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
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>Covette</div>
        <nav className={styles.sideNav}>
          <ul>
            <li 
              className={`${activeTab === 'dashboard' ? styles.active : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <span className={styles.icon}>📊</span>
              Dashboard
            </li>
            <li 
              className={`${activeTab === 'links' ? styles.active : ''}`}
              onClick={() => setActiveTab('links')}
            >
              <span className={styles.icon}>🔗</span>
              Links
            </li>
            <li 
              className={`${activeTab === 'analytics' ? styles.active : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <span className={styles.icon}>📈</span>
              Analytics
            </li>
            <li 
              className={`${activeTab === 'settings' ? styles.active : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <span className={styles.icon}>⚙️</span>
              Settings
            </li>
          </ul>
        </nav>
      </aside>
      
      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Top Header */}
        <header className={styles.header}>
          <div className={styles.welcome}>
            👋 Good morning, Sujith
          </div>
          <div className={styles.headerRight}>
            <button className={styles.createButton} onClick={()=> setShowNewLinkModal(true)}>+ Create new</button>
            <input type="text" className={styles.searchInput} placeholder=" 🔍Search by remarks" />
            <div className={styles.avatar}></div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className={styles.main}>
          {activeTab === 'dashboard' && <DashboardContent />}
          {activeTab === 'links' && <LinksContent />}
          {activeTab === 'settings' && <SettingsContent />}
          {activeTab === 'analytics' && <AnalyticsContent />} 
        </main>
      </div>
      {showNewLinkModal && <NewLinkModal />}  {/* Add this line */}

    </div>
  );
};

export default Dashboard;