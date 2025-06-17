import {
  Box,
  Container,
  Typography,
  Link,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';

interface FooterProps {
  variant?: 'minimal' | 'full';
}

export default function Footer({ variant = 'minimal' }: FooterProps) {
  const currentYear = new Date().getFullYear();

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
                <Link href="#" {...linkProps}>
                  Privacy
                </Link>
                <Link href="#" {...linkProps}>
                  Terms
                </Link>
                <Link href="#" {...linkProps}>
                  Help
                </Link>
                <Link href="#" {...linkProps}>
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
                  Product
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Link href="#" {...linkProps}>
                    Features
                  </Link>
                  <Link href="#" {...linkProps}>
                    Pricing
                  </Link>
                  <Link href="#" {...linkProps}>
                    API
                  </Link>
                  <Link href="#" {...linkProps}>
                    Documentation
                  </Link>
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
                  <Link href="#" {...linkProps}>
                    Help Center
                  </Link>
                  <Link href="#" {...linkProps}>
                    Contact Us
                  </Link>
                  <Link href="#" {...linkProps}>
                    Privacy Policy
                  </Link>
                  <Link href="#" {...linkProps}>
                    Terms of Service
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
    </motion.footer>
  );
}
