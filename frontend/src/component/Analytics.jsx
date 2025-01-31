import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';
import styles from './Dashboard.module.css';

const Analytics = () => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await analyticsService.getAnalytics();
        
        // Validate response data
        if (!Array.isArray(response)) {
          throw new Error('Invalid data format received');
        }
        
        setAnalytics(response);
      } catch (error) {
        console.error('Error in Analytics component:', error);
        setError(error.message || 'Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!analytics.length) {
    return (
      <div className={styles.emptyContainer}>
        <p>No analytics data available</p>
      </div>
    );
  }

  return (
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
                <td>{item.timestamp || 'N/A'}</td>
                <td className={styles.linkCell}>
                  <span className={styles.truncatedLink}>
                    {item.originalLink || 'N/A'}
                  </span>
                </td>
                <td className={styles.linkCell}>
                  {item.shortLink || 'N/A'}
                </td>
                <td>{item.ipAddress || 'N/A'}</td>
                <td>{item.userDevice || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;