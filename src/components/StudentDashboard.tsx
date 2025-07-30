import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  Alert,
  Paper,
  Avatar
} from '@mui/material';
import { Logout } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useData } from '../contexts/DataContext.tsx';
import StudentManagement from './StudentManagement';
import LoadingSpinner from './LoadingSpinner.tsx';
import GoogleOAuthButton from './GoogleOAuthButton.tsx';
import { AuthDebugInfo } from './AuthDebugInfo.tsx';

const StudentDashboard: React.FC = () => {
  const { state: authState, logout } = useAuth();
  const { state: dataState, fetchStudents } = useData();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Handle login callbacks
  const handleLoginSuccess = (_accessToken: string) => {
    setLoginError(null);
    console.log('✅ Login successful, will fetch data automatically');
  };

  const handleLoginError = (error: string) => {
    setLoginError(error);
    console.error('❌ Login failed:', error);
  };

  // Load data when user is authenticated
  useEffect(() => {
    // console.log('🔍 useEffect triggered with auth state:');
    // console.log('- isAuthenticated:', authState.isAuthenticated);
    // console.log('- user exists:', !!authState.user);
    // console.log('- access token exists:', !!authState.user?.accessToken);
    // console.log('- initial load complete:', initialLoadComplete);
    
    if (authState.isAuthenticated && authState.user?.accessToken && !initialLoadComplete) {
      // console.log('✅ All conditions met, fetching students...');
      fetchStudents(authState.user.accessToken)
        .then(() => {
          // console.log('📊 Student data fetch completed');
          setInitialLoadComplete(true);
        })
        .catch((error) => {
          console.error('❌ Student data fetch failed during initial load:', error);
        });
    } else {
      // console.log('⏳ Not ready to fetch data yet');
    }
  }, [authState.isAuthenticated, authState.user?.accessToken, fetchStudents, initialLoadComplete]);

  // Set up polling for real-time updates - Polling logic removed
  /*
  useEffect(() => {
    if (authState.isAuthenticated && authState.user?.accessToken && initialLoadComplete) {
      const interval = setInterval(() => {
        if (authState.user?.accessToken) {
          fetchStudents(authState.user.accessToken)
            .catch(error => console.error('❌ Student data fetch failed during poll:', error));
        }
      }, 300000); // Poll every 5 minutes (example)

      return () => clearInterval(interval);
    }
  }, [authState.isAuthenticated, authState.user?.accessToken, initialLoadComplete, fetchStudents]);
  */

  const handleLogout = () => {
    logout();
    setInitialLoadComplete(false);
  };

  if (!authState.isAuthenticated) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center', width: '100%' }}>
            {loginError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {loginError}
              </Alert>
            )}
            
            <GoogleOAuthButton
              onLoginSuccess={handleLoginSuccess}
              onLoginError={handleLoginError}
            />
            
            {/* Debug Information */}
            <AuthDebugInfo />
          </Paper>
        </Box>
      </Container>
    );
  }

  if (authState.loading || dataState.loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Student Management System
          </Typography>
          
          {authState.user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={authState.user.picture}
                alt={authState.user.name}
                sx={{ width: 32, height: 32 }}
              />
              <Typography variant="body2">
                {authState.user.name || authState.user.email}
              </Typography>
              <Button
                color="inherit"
                startIcon={<Logout />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {dataState.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {dataState.error}
          </Alert>
        )}

        {/* Student Management */}
        <Paper elevation={1} sx={{ p: 2 }}>
          <StudentManagement />
        </Paper>
      </Container>
    </Box>
  );
};

export default StudentDashboard;
