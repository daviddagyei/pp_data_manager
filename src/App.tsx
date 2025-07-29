import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { SettingsProvider } from './contexts/SettingsContext';
import ModernStudentDashboard from './components/ModernStudentDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import EnvironmentChecker from './components/EnvironmentChecker';
import theme from './theme';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <EnvironmentChecker />
        <AuthProvider>
          <SettingsProvider>
            <DataProvider>
              <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
                <ModernStudentDashboard />
              </Box>
            </DataProvider>
          </SettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
