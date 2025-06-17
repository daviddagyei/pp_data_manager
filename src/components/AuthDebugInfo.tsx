import React from 'react';
import { Box, Typography, Alert, Card, CardContent, Button } from '@mui/material';

export const AuthDebugInfo: React.FC = () => {
  const currentUrl = window.location.href;
  const urlParams = new URLSearchParams(window.location.search);
  const hasCode = urlParams.has('code');
  const hasError = urlParams.has('error');
  const errorParam = urlParams.get('error');
  const codeParam = urlParams.get('code');

  const clearStoredAuth = () => {
    localStorage.removeItem('studentApp_user');
    sessionStorage.clear();
    console.log('🧹 Cleared all stored authentication data');
    window.location.reload();
  };

  const checkStoredAuth = () => {
    const stored = localStorage.getItem('studentApp_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('📦 Stored auth data:', parsed);
        console.log('🕐 Token expiry:', new Date(parsed.tokenExpiry));
        console.log('🕐 Current time:', new Date());
        console.log('🔍 Is expired:', new Date(parsed.tokenExpiry) < new Date());
      } catch (e) {
        console.log('❌ Error parsing stored auth data');
      }
    } else {
      console.log('📭 No stored auth data found');
    }
  };

  return (
    <Card sx={{ mt: 2, mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🔍 OAuth Debug Information
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Current URL:</strong> {currentUrl}
          </Typography>
        </Box>

        {hasCode && (
          <Alert severity="success" sx={{ mb: 1 }}>
            ✅ Authorization code received: {codeParam?.substring(0, 20)}...
          </Alert>
        )}

        {hasError && (
          <Alert severity="error" sx={{ mb: 1 }}>
            ❌ OAuth Error: {errorParam}
          </Alert>
        )}

        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" onClick={checkStoredAuth}>
            Check Stored Auth
          </Button>
          <Button variant="contained" color="error" size="small" onClick={clearStoredAuth}>
            Clear Stored Auth
          </Button>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Expected Redirect URIs in Google Cloud Console:</strong>
          </Typography>
          <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
            • {window.location.origin}<br/>
            • {window.location.origin}/<br/>
            • http://localhost:5173<br/>
            • http://localhost:5173/<br/>
            • http://127.0.0.1:5173<br/>
            • http://127.0.0.1:5173/
          </Typography>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Required OAuth Scopes:</strong>
          </Typography>
          <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
            • https://www.googleapis.com/auth/spreadsheets<br/>
            • https://www.googleapis.com/auth/userinfo.profile<br/>
            • https://www.googleapis.com/auth/userinfo.email
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
