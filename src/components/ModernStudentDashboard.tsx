import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  Chip,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  School,
  Logout,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Navigation from './Navigation';
import DashboardCard from './DashboardCard';
import DashboardLayout, { DashboardGridItem } from './DashboardLayout';
import Footer from './Footer';
import StudentManagement from './StudentManagement';
import GraduationYearChart from './GraduationYearChart';
import HighSchoolChart from './HighSchoolChart';
import LoadingSpinner from './LoadingSpinner';
import GoogleOAuthButton from './GoogleOAuthButton';
import SignInSheetSection from './SignInSheetSection';
import SettingsPage from './Settings/SettingsPage';
import { colorTokens } from '../theme';

const ModernStudentDashboard: React.FC = () => {
  const theme = useTheme();
  const { state: authState, logout } = useAuth();
  const { state: dataState, fetchStudents } = useData();
  const [currentPage, setCurrentPage] = useState('dashboard');
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
    if (authState.isAuthenticated && authState.user?.accessToken && !initialLoadComplete) {
      fetchStudents(authState.user.accessToken)
        .then(() => {
          setInitialLoadComplete(true);
        })
        .catch((error: Error) => {
          console.error('❌ Failed to fetch students:', error);
          setInitialLoadComplete(true);
        });
    }
  }, [authState.isAuthenticated, authState.user?.accessToken, fetchStudents, initialLoadComplete]);

  // Authentication check
  if (!authState.isAuthenticated || !authState.user) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${colorTokens.primary[50]} 0%, ${colorTokens.secondary[50]} 100%)`,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            sx={{
              maxWidth: 480,
              mx: 'auto',
              p: 4,
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: theme.shadows[16],
            }}
          >
            <CardContent>
              <School
                sx={{
                  fontSize: 64,
                  color: 'primary.main',
                  mb: 2,
                }}
              />
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  background: `linear-gradient(135deg, ${colorTokens.primary[600]}, ${colorTokens.secondary[600]})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Palouse Pathways Student Manager
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 4, lineHeight: 1.6 }}
              >
                Sign in with Google to get started.
              </Typography>
              
              {loginError && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    '& .MuiAlert-message': {
                      width: '100%',
                    }
                  }}
                >
                  {loginError}
                </Alert>
              )}
              
              <GoogleOAuthButton
                onLoginSuccess={handleLoginSuccess}
                onLoginError={handleLoginError}
              />
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    );
  }

  // Loading state
  if (!initialLoadComplete) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navigation
          currentPage={currentPage}
          user={{
            name: authState.user.name || 'User',
            email: authState.user.email || '',
            avatar: authState.user.picture,
          }}
          onNavigate={setCurrentPage}
        />
        <Container 
          maxWidth="xl" 
          sx={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            py: 8,
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <LoadingSpinner message="Loading your dashboard..." />
          </motion.div>
        </Container>
        <Footer variant="minimal" />
      </Box>
    );
  }

  // Calculate statistics
  const totalStudents = dataState.filteredStudents.length;

  // Main Dashboard Content
  const DashboardContent = () => (
    <DashboardLayout>
      {/* Welcome Section */}
      <DashboardGridItem xs={12}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                mb: 1,
                background: `linear-gradient(135deg, ${colorTokens.primary[600]}, ${colorTokens.secondary[600]})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Welcome back, {authState.user?.name?.split(' ')[0]}!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Here's an overview of your student management system.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Button
                variant="outlined"
                onClick={logout}
                startIcon={<Logout />}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                }}
              >
                Sign Out
              </Button>
              <Chip
                label={`${totalStudents} Total Students`}
                color="primary"
                variant="outlined"
                sx={{ borderRadius: 2 }}
              />
            </Box>
          </Box>
        </motion.div>
      </DashboardGridItem>

      {/* Analytics Section */}
      <DashboardGridItem xs={12} md={6}>
        <DashboardCard title="Graduation Year Distribution" subtitle="Student count by graduation year">
          <GraduationYearChart />
        </DashboardCard>
      </DashboardGridItem>

      <DashboardGridItem xs={12} md={6}>
        <DashboardCard title="High School Distribution" subtitle="Student distribution across schools">
          <HighSchoolChart />
        </DashboardCard>
      </DashboardGridItem>

      {/* Student Management with Search/Filter */}
      <DashboardGridItem xs={12}>
        <DashboardCard title="Student Management" subtitle="Search, filter, and manage student records">
          <StudentManagement />
        </DashboardCard>
      </DashboardGridItem>
    </DashboardLayout>
  );

  // Students Tab Content (without charts)
  const StudentsContent = () => (
    <DashboardLayout>
      {/* Header Section */}
      <DashboardGridItem xs={12}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                mb: 1,
                background: `linear-gradient(135deg, ${colorTokens.primary[600]}, ${colorTokens.secondary[600]})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Student Management
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Search, filter, and manage your student records.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Chip
                label={`${totalStudents} Total Students`}
                color="primary"
                variant="outlined"
                sx={{ borderRadius: 2 }}
              />
            </Box>
          </Box>
        </motion.div>
      </DashboardGridItem>

      {/* Student Management Interface */}
      <DashboardGridItem xs={12}>
        <DashboardCard title="Student Records" subtitle="Search, filter, and manage student information">
          <StudentManagement />
        </DashboardCard>
      </DashboardGridItem>
    </DashboardLayout>
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation
        currentPage={currentPage}
        user={{
          name: authState.user.name || 'User',
          email: authState.user.email || '',
          avatar: authState.user.picture,
        }}
        onNavigate={setCurrentPage}
      />

      <Box component="main" sx={{ flex: 1 }}>
        <AnimatePresence mode="wait">
          {currentPage === 'dashboard' && <DashboardContent />}
          {currentPage === 'students' && <StudentsContent />}
          {currentPage === 'signins' && <SignInSheetSection />}
          {currentPage === 'settings' && (
            <Container maxWidth="xl" sx={{ py: 4 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <SettingsPage />
              </motion.div>
            </Container>
          )}
        </AnimatePresence>
      </Box>

      <Footer variant="minimal" />
    </Box>
  );
};

export default ModernStudentDashboard;
