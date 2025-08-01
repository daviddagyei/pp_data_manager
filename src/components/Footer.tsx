import {
  Box,
  Container,
  Typography,
  Link,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from '@mui/material';
import { Close, Security, Help, Email } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface FooterProps {
  variant?: 'minimal' | 'full';
}

export default function Footer({ variant = 'minimal' }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const footerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  const linkProps = {
    underline: 'hover' as const,
    color: 'text.secondary',
    sx: {
      transition: 'color 0.2s ease',
      '&:hover': {
        color: 'primary.main',
      },
    },
  };

  if (variant === 'minimal') {
    return (
      <motion.footer
        variants={footerVariants}
        initial="hidden"
        animate="visible"
      >
        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: 'auto',
            backgroundColor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Container maxWidth="xl">
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: { xs: 'center', sm: 'left' } }}
              >
                © {currentYear} Student Manager. Built with care for educational excellence.
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 3,
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                <Link 
                  component="button"
                  onClick={() => setPrivacyOpen(true)}
                  {...linkProps}
                  sx={{ ...linkProps.sx, border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  Privacy
                </Link>
                <Link 
                  component="button"
                  onClick={() => setHelpOpen(true)}
                  {...linkProps}
                  sx={{ ...linkProps.sx, border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  Help
                </Link>
                <Link 
                  component="button"
                  onClick={() => setContactOpen(true)}
                  {...linkProps}
                  sx={{ ...linkProps.sx, border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  Contact
                </Link>
              </Box>
            </Box>
          </Container>
        </Box>
      </motion.footer>
    );
  }

  return (
    <motion.footer
      variants={footerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box
        component="footer"
        sx={{
          py: 6,
          px: 2,
          mt: 'auto',
          backgroundColor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  mb: 2,
                }}
              >
                Student Manager
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2, maxWidth: 400 }}
              >
                A modern, accessible platform for managing student data with 
                beautiful design and intuitive user experience.
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                © {currentYear} Student Manager. All rights reserved.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: 'text.primary',
                  }}
                >
                  Features
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Student Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Event Sign-Ins
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Data Visualization
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Export & Reports
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: 'text.primary',
                  }}
                >
                  Support
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Link 
                    component="button"
                    onClick={() => setHelpOpen(true)}
                    {...linkProps}
                    sx={{ ...linkProps.sx, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    Help Center
                  </Link>
                  <Link 
                    component="button"
                    onClick={() => setContactOpen(true)}
                    {...linkProps}
                    sx={{ ...linkProps.sx, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    Contact Us
                  </Link>
                  <Link 
                    component="button"
                    onClick={() => setPrivacyOpen(true)}
                    {...linkProps}
                    sx={{ ...linkProps.sx, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    Privacy Policy
                  </Link>
                </Box>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Built with React, TypeScript, and Material-UI
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Made with ❤️ for education
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Privacy Dialog */}
      <Dialog 
        open={privacyOpen} 
        onClose={() => setPrivacyOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security color="primary" />
          Privacy & Security
          <IconButton
            onClick={() => setPrivacyOpen(false)}
            sx={{ marginLeft: 'auto' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>
            Your Data is Secure
          </Typography>
          <Typography paragraph>
            This Student Management application is built with security and privacy as top priorities. 
            Here's how we protect your information:
          </Typography>
          
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
            🔐 Authentication & Access
          </Typography>
          <Typography paragraph>
            • Secure Google OAuth authentication ensures only authorized users can access the system
            • Token-based authentication with automatic session management
            • Role-based access control to protect sensitive student information
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
            🛡️ Data Protection
          </Typography>
          <Typography paragraph>
            • All data transmission is encrypted using HTTPS/SSL protocols
            • Google Sheets integration uses secure API connections with proper authorization
            • No sensitive data is stored locally in your browser beyond necessary session information
            • Regular security updates and monitoring
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
            🎯 Data Usage
          </Typography>
          <Typography paragraph>
            • We only collect and process data necessary for student management functions
            • No personal data is shared with third parties
            • Your Google account information is used solely for authentication
            • Student data remains within your authorized Google Sheets
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
            🔄 Data Control
          </Typography>
          <Typography paragraph>
            • You maintain full control over your student data through Google Sheets
            • Data can be exported at any time using built-in export features
            • Account access can be revoked at any time through your Google account settings
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrivacyOpen(false)} variant="contained">
            Got It
          </Button>
        </DialogActions>
      </Dialog>

      {/* Help Dialog */}
      <Dialog 
        open={helpOpen} 
        onClose={() => setHelpOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Help color="primary" />
          Help & Support
          <IconButton
            onClick={() => setHelpOpen(false)}
            sx={{ marginLeft: 'auto' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>
            Common Issues & Solutions
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 3, mb: 1 }}>
            📊 Data Not Appearing After Adding to Google Sheets?
          </Typography>
          <Typography paragraph>
            • <strong>Refresh the app:</strong> Click the refresh button in your browser or press Ctrl+R (Cmd+R on Mac)
            • <strong>Check permissions:</strong> Ensure the app has access to your Google Sheets
            • <strong>Verify sheet format:</strong> Make sure your Google Sheet follows the expected column structure
            • <strong>Wait a moment:</strong> Sometimes there's a brief delay in data synchronization
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
            🔄 Sync Issues?
          </Typography>
          <Typography paragraph>
            • Try logging out and logging back in to refresh your authentication
            • Clear your browser cache and cookies for this site
            • Ensure you have a stable internet connection
            • Check if your Google Sheets are shared with the correct permissions
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
            📱 Display Problems?
          </Typography>
          <Typography paragraph>
            • The app is responsive - try refreshing if layout looks incorrect
            • Use Chrome, Firefox, Safari, or Edge for best compatibility
            • Zoom level should be between 75%-125% for optimal viewing
            • Mobile devices are fully supported
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
            💾 Export Not Working?
          </Typography>
          <Typography paragraph>
            • Check that your browser allows downloads from this site
            • Try a different browser if the export fails
            • Ensure you have write permissions to your Downloads folder
            • Large datasets may take a few seconds to generate
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
            🔍 Can't Find Specific Students?
          </Typography>
          <Typography paragraph>
            • Use the search bar to filter by name, school, or graduation year
            • Check the filter settings - you might have active filters applied
            • Verify the student data exists in your connected Google Sheet
            • Try clearing all filters and searching again
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
            🎯 Quick Tips
          </Typography>
          <Typography paragraph>
            • Keep your Google Sheets organized with clear column headers
            • Regularly backup your data using the export feature
            • Use consistent date formats in your spreadsheets
            • Log out properly when using shared computers
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog 
        open={contactOpen} 
        onClose={() => setContactOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Email color="primary" />
          Contact Us
          <IconButton
            onClick={() => setContactOpen(false)}
            sx={{ marginLeft: 'auto' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>
            Get in Touch
          </Typography>
          <Typography paragraph>
            Need help or have questions about the Student Management system? 
            We're here to assist you!
          </Typography>

          <Box sx={{ 
            bgcolor: 'primary.50', 
            p: 3, 
            borderRadius: 2, 
            border: 1, 
            borderColor: 'primary.200',
            my: 2 
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              📧 Email Support
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              david.agyei@palousepathways.org
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Response time: Usually within 24 hours
            </Typography>
          </Box>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 3, mb: 1 }}>
            📝 When contacting us, please include:
          </Typography>
          <Typography component="div">
            • Description of the issue or question<br />
            • Steps you've already tried<br />
            • Browser and device information<br />
            • Screenshots if applicable
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 3, mb: 1 }}>
            🚀 Feature Requests
          </Typography>
          <Typography paragraph>
            Have ideas for new features or improvements? We'd love to hear them! 
            Send your suggestions to help make this tool even better.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => window.open('mailto:david.agyei@palousepathways.org')}
            variant="outlined"
            startIcon={<Email />}
          >
            Send Email
          </Button>
          <Button onClick={() => setContactOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </motion.footer>
  );
}
