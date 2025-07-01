import React from 'react';

const EnvironmentChecker: React.FC = () => {
  const envVars = {
    VITE_GOOGLE_API_KEY: import.meta.env.VITE_GOOGLE_API_KEY,
    VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    VITE_GOOGLE_SHEETS_ID: import.meta.env.VITE_GOOGLE_SHEETS_ID,
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
    VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION,
    VITE_POLLING_INTERVAL: import.meta.env.VITE_POLLING_INTERVAL,
    VITE_MAX_RETRIES: import.meta.env.VITE_MAX_RETRIES,
  };

  const missingVars = Object.entries(envVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  // Only show this in development or when there are missing variables
  if (import.meta.env.PROD && missingVars.length === 0) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: missingVars.length > 0 ? '#dc3545' : '#28a745',
      color: 'white',
      padding: '10px',
      zIndex: 9999,
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <strong>Environment Variables Status:</strong>
      {missingVars.length > 0 ? (
        <div>
          ❌ Missing: {missingVars.join(', ')}
          <br />
          📝 Configure these in your Netlify dashboard under Site Settings → Environment Variables
        </div>
      ) : (
        <div>✅ All environment variables are configured</div>
      )}
      <details style={{ marginTop: '5px' }}>
        <summary>View all variables</summary>
        <pre>{JSON.stringify(envVars, null, 2)}</pre>
      </details>
    </div>
  );
};

export default EnvironmentChecker;
