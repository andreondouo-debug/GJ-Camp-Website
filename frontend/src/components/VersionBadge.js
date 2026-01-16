import React, { useState } from 'react';
import { VERSION_INFO } from '../version';
import '../styles/VersionBadge.css';

const VersionBadge = () => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="version-badge-container">
      <div 
        className="version-badge"
        onClick={() => setShowDetails(!showDetails)}
        title="Cliquez pour plus d'infos"
      >
        🚀 v{VERSION_INFO.version}
      </div>
      
      {showDetails && (
        <div className="version-details">
          <div className="version-detail-item">
            <span className="version-label">📦 Version:</span>
            <span className="version-value">{VERSION_INFO.version}</span>
          </div>
          <div className="version-detail-item">
            <span className="version-label">📅 Build:</span>
            <span className="version-value">{VERSION_INFO.buildDate}</span>
          </div>
          <div className="version-detail-item">
            <span className="version-label">💾 Cache:</span>
            <span className="version-value">{VERSION_INFO.cacheVersion}</span>
          </div>
          <div className="version-detail-item">
            <span className="version-label">🌐 Env:</span>
            <span className="version-value">{process.env.NODE_ENV}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionBadge;
