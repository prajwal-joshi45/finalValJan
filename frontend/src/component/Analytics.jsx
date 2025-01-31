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
  const generateTestData = async () => {
    try {
      setTestStatus('Generating test data...');
      const response = await fetch('http://localhost:5000/api/analytics/seed-test-data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      setTestStatus(`Test data generated: ${result.insertedCount} records created`);
      
      // Refresh the data
      await fetchData();
    } catch (error) {
      setTestStatus(`Error generating test data: ${error.message}`);
    }
  };

  // Add verification function
  const verifyData = async () => {
    try {
      setTestStatus('Verifying data...');
      const response = await fetch('http://localhost:5000/api/analytics/verify-data', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      console.log('Verification data:', data);
      setTestStatus(`Verification complete: ${data.counts.analytics} analytics records, ${data.counts.links} links`);
    } catch (error) {
      setTestStatus(`Error verifying data: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className={styles.analyticsContainer}>
      {/* Add test controls */}
      <div className={styles.testControls}>
        <button onClick={generateTestData} className={styles.testButton}>
          Generate Test Data
        </button>
        <button onClick={verifyData} className={styles.testButton}>
          Verify Data
        </button>
        {testStatus && (
          <div className={styles.testStatus}>
            {testStatus}
          </div>
        )}
      </div>

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