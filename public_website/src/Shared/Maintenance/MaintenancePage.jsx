import React, { useState, useEffect } from 'react';
import './MaintenancePage.css';
import { Power, Clock } from 'lucide-react';

const MaintenancePage = ({ title, message, expectedBackAt }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!expectedBackAt) return;

    const target = new Date(expectedBackAt).getTime();
    
    const update = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('Any moment now...');
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      let str = '';
      if (h > 0) str += `${h}h `;
      if (m > 0 || h > 0) str += `${m}m `;
      str += `${s}s`;
      
      setTimeLeft(str);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expectedBackAt]);

  return (
    <div className="maintenance-wrapper">
      <div className="maintenance-content">
        <div className="maintenance-icon-wrap">
          <Power size={64} className="maintenance-icon" />
          <div className="maintenance-icon-pulse"></div>
        </div>
        
        <h1 className="maintenance-title">{title || "We'll be back soon"}</h1>
        <p className="maintenance-message">
          {message || "We're performing some scheduled maintenance. We'll be back online shortly."}
        </p>

        {expectedBackAt && (
          <div className="maintenance-timer">
            <div className="timer-label">
              <Clock size={16} />
              <span>Estimated Uptime</span>
            </div>
            <div className="timer-value">{timeLeft}</div>
          </div>
        )}

        <div className="maintenance-footer">
          <div className="footer-line"></div>
          <p>&copy; {new Date().getFullYear()} AnthaTech. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
