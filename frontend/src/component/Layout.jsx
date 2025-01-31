import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';

const Layout = ({ children, user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [showNewLinkModal, setShowNewLinkModal] = React.useState(false);

  const handleNavigation = (path) => {
    setActiveTab(path);
    navigate(`/${path}`);
  };

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
    </div>
  );
};

export default Layout;