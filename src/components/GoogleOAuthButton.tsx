import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface GoogleOAuthButtonProps {
  onLoginStart?: () => void;
  onLoginSuccess?: (accessToken: string, userInfo: any) => void;
  onLoginError?: (error: string) => void;
}

const GoogleOAuthButton: React.FC<GoogleOAuthButtonProps> = ({
  onLoginStart,
  onLoginSuccess,
  onLoginError
}) => {
  const { login } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      onLoginStart?.();
      
      // Check if Google APIs are loaded
      if (!window.google?.accounts?.oauth2) {
        throw new Error('Google OAuth library not loaded. Please check your internet connection and try again.');
      }

      console.log('🚀 Initiating Google OAuth...');
      
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email'
        ].join(' '),
        callback: async (response: any) => {
          console.log('📋 OAuth Response:', {
            access_token: response.access_token ? 'Present' : 'Missing',
            token_type: response.token_type,
            expires_in: response.expires_in,
            scope: response.scope,
            error: response.error
          });

          if (response.error) {
            const errorMsg = `OAuth Error: ${response.error}`;
            console.error('❌', errorMsg);
            onLoginError?.(errorMsg);
            return;
          }

          if (!response.access_token) {
            const errorMsg = 'No access token received from Google';
            console.error('❌', errorMsg);
            onLoginError?.(errorMsg);
            return;
          }

          try {
            // Get user info using the access token
            console.log('👤 Fetching user info...');
            const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: {
                'Authorization': `Bearer ${response.access_token}`
              }
            });

            if (!userResponse.ok) {
              throw new Error(`Failed to fetch user info: ${userResponse.status}`);
            }

            const userInfo = await userResponse.json();
            console.log('✅ User info received:', {
              name: userInfo.name,
              email: userInfo.email,
              picture: userInfo.picture
            });

            // Store the user info and token
            login(response.access_token, {
              id: userInfo.id,
              email: userInfo.email,
              name: userInfo.name,
              picture: userInfo.picture
            });

            onLoginSuccess?.(response.access_token, userInfo);
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to fetch user information';
            console.error('❌ Error getting user info:', error);
            onLoginError?.(errorMsg);
          }
        },
        error_callback: (error: any) => {
          const errorMsg = `OAuth initialization error: ${error}`;
          console.error('❌', errorMsg);
          onLoginError?.(errorMsg);
        }
      });

      // Request access token
      client.requestAccessToken();
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to initialize Google OAuth';
      console.error('❌ Google login error:', error);
      onLoginError?.(errorMsg);
    }
  };

  return (
    <Box sx={{ textAlign: 'center', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        
      </Typography>
      <Button
        variant="contained"
        size="large"
        startIcon={<GoogleIcon />}
        onClick={handleGoogleLogin}
        sx={{
          bgcolor: '#4285f4',
          '&:hover': { bgcolor: '#3367d6' },
          borderRadius: 2,
          px: 4,
          py: 1.5
        }}
      >
        Sign in with Google
      </Button>
    </Box>
  );
};

export default GoogleOAuthButton;
