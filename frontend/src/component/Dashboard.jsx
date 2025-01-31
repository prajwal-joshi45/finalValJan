import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import { analyticsService } from '../services/analyticsService';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    dateWiseClicks: [],
    deviceClicks: []
  });

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const data = await analyticsService.getStatistics();
        setStatistics(data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStatistics();
  }, []);

  if (loading) return <div>Loading...</div>;

  const totalClicks = statistics.dateWiseClicks.reduce((sum, item) => sum + item.clicks, 0);
  const maxClicks = Math.max(...statistics.dateWiseClicks.map(item => item.clicks));
  const maxDeviceClicks = Math.max(...statistics.deviceClicks.map(item => item.clicks));

  return (
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
};

export default Dashboard;