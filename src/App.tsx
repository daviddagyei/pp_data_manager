import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import ModernStudentDashboard from './components/ModernStudentDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import theme from './theme';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <DataProvider>
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
              <ModernStudentDashboard />
            </Box>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
