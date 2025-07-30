import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import StudentManagement from './StudentManagement';
import LoadingSpinner from './LoadingSpinner';

const StudentDashboard: React.FC = () => {
  const { state: authState, login, logout } = useAuth();
  const { state: dataState, fetchStudents, refreshData } = useData();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Google login hook for getting access token
  const googleLogin = useGoogleLogin({
    onSuccess: (response) => {
      // This gives us an access token we can use for API calls
      login(response.access_token, {
        id: 'temp-user-id', // We'll get this from a separate API call if needed
        email: '', // We'll get this from a separate API call if needed
        name: 'User', // We'll get this from a separate API call if needed
        picture: '' // We'll get this from a separate API call if needed
      });
    },
    onError: () => {
      console.error('Login failed');
    },
    scope: 'https://www.googleapis.com/auth/spreadsheets'
  });

  // Load data when user is authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.user?.accessToken && !initialLoadComplete) {
      fetchStudents(authState.user.accessToken)
        .then(() => setInitialLoadComplete(true))
        .catch(console.error);
    }
  }, [authState.isAuthenticated, authState.user?.accessToken, fetchStudents, initialLoadComplete]);

  // Set up polling for real-time updates
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.user?.accessToken) return;

    const interval = setInterval(() => {
      refreshData(authState.user!.accessToken).catch(console.error);
    }, parseInt(import.meta.env.VITE_POLLING_INTERVAL) || 60000); // Default 60 seconds

    return () => clearInterval(interval);
  }, [authState.isAuthenticated, authState.user?.accessToken, refreshData]);

  const handleLogout = () => {
    logout();
    setInitialLoadComplete(false);
  };

  const handleRefresh = async () => {
    if (authState.user?.accessToken) {
      try {
        await refreshData(authState.user.accessToken);
      } catch (error) {
        console.error('Refresh failed:', error);
      }
    }
  };

  // If not authenticated, show login screen
  if (!authState.isAuthenticated) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="sm">
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
              Student Management System
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Sign in with your Google account to access the student database
            </Typography>
            
            {authState.error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {authState.error}
              </Alert>
            )}

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                onClick={() => googleLogin()}
                disabled={authState.loading}
                size="large"
              >
                {authState.loading ? <CircularProgress size={24} /> : 'Sign in with Google'}
              </Button>
            </Box>

            <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
              Note: This application requires access to Google Sheets to manage student data
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  // Show loading screen during initial data load
  if (!initialLoadComplete && dataState.loading) {
    return <LoadingSpinner message="Loading student data..." />;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Student Management System
          </Typography>
          
          {authState.user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">
                Welcome, {authState.user.name || 'User'}
              </Typography>
              <Button color="inherit" onClick={handleRefresh} disabled={dataState.loading}>
                Refresh
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
        {dataState.error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
            {dataState.error}
          </Alert>
        )}

        <StudentManagement />

        {dataState.loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Last updated: {dataState.lastUpdated.toLocaleString()}
            {' | '}
            Showing {dataState.filteredStudents.length} of {dataState.students.length} students
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default StudentDashboard;
