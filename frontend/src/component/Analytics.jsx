import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';
import styles from './Dashboard.module.css';

const Analytics = () => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testStatus, setTestStatus] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getAnalytics();
      setAnalytics(data || []);
    } catch (error) {
      console.error('Analytics fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add test data generation function
 
  return (
    <div className={styles.analyticsContainer}>
      {/* Add test controls */}
      
      {error && (
        <div className={styles.errorContainer}>
          <p>Error: {error}</p>
        </div>
      )}

      {!analytics.length ? (
        <div className={styles.emptyContainer}>
          <p>No analytics data available</p>
        </div>
      ) : (
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
                    <span className={styles.truncatedLink}>
                      {item.originalLink}
                    </span>
                  </td>
                  <td className={styles.linkCell}>{item.shortLink}</td>
                  <td>{item.ipAddress}</td>
                  <td>{item.userDevice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Analytics;
