import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Settings,
  AccountCircle,
  Home,
  NavigateNext,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface NavigationProps {
  currentPage?: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onNavigate?: (page: string) => void;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Dashboard },
  { id: 'students', label: 'Students', icon: People },
  { id: 'signins', label: 'Sign-Ins', icon: AccountCircle },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const breadcrumbMap: Record<string, string[]> = {
  dashboard: ['Home', 'Dashboard'],
  students: ['Home', 'Students'],
  signins: ['Home', 'Sign-Ins'],
  settings: ['Home', 'Settings'],
};

export default function Navigation({ currentPage = 'dashboard', user, onNavigate }: NavigationProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNavigation = (page: string) => {
    onNavigate?.(page);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  const NavigationList = () => (
    <List sx={{ width: 280, pt: 2 }}>
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        
        return (
          <motion.div
            key={item.id}
            whileHover={{ x: 4 }}
            transition={{ type: 'tween', duration: 0.2 }}
          >
            <ListItem disablePadding sx={{ mb: 0.5, mx: 2 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.id)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                  },
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'primary.contrastText' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  <Icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.875rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          </motion.div>
        );
      })}
    </List>
  );

  const UserMenu = () => (
    <Menu
      anchorEl={userMenuAnchor}
      open={Boolean(userMenuAnchor)}
      onClose={handleUserMenuClose}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      PaperProps={{
        sx: {
          mt: 1,
          minWidth: 200,
          borderRadius: 2,
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <MenuItem onClick={handleUserMenuClose}>
        <AccountCircle sx={{ mr: 2 }} />
        Profile
      </MenuItem>
      <MenuItem onClick={handleUserMenuClose}>
        <Settings sx={{ mr: 2 }} />
        Account Settings
      </MenuItem>
      <MenuItem onClick={handleUserMenuClose}>
        Logout
      </MenuItem>
    </Menu>
  );

  return (
    <>
      {/* Main AppBar */}
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ px: { xs: 2, md: 3 } }}>
          {/* Mobile menu button */}
          {isMobile && (
            <IconButton
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, color: 'text.primary' }}
              aria-label="open navigation menu"
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo/Brand */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'tween', duration: 0.2 }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: isMobile ? 1 : 0,
                fontWeight: 700,
                color: 'primary.main',
                cursor: 'pointer',
                mr: 4,
              }}
              onClick={() => handleNavigation('dashboard')}
            >
              Student Manager
            </Typography>
          </motion.div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', ml: 4 }}>
              {navigationItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -2 }}
                    transition={{ type: 'tween', duration: 0.2 }}
                  >
                    <Button
                      onClick={() => handleNavigation(item.id)}
                      sx={{
                        mx: 1,
                        px: 3,
                        py: 1,
                        color: isActive ? 'primary.main' : 'text.primary',
                        fontWeight: isActive ? 600 : 500,
                        borderRadius: 2,
                        position: 'relative',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                        '&::after': isActive ? {
                          content: '""',
                          position: 'absolute',
                          bottom: -8,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 24,
                          height: 2,
                          backgroundColor: 'primary.main',
                          borderRadius: 1,
                        } : {},
                      }}
                    >
                      {item.label}
                    </Button>
                  </motion.div>
                );
              })}
            </Box>
          )}

          {/* User Profile */}
          {user && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'tween', duration: 0.2 }}
            >
              <IconButton
                onClick={handleUserMenuOpen}
                size="small"
                sx={{ ml: 2 }}
                aria-label="user account menu"
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'primary.main',
                    fontSize: '0.875rem',
                  }}
                  src={user.avatar}
                >
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </motion.div>
          )}
        </Toolbar>

        {/* Breadcrumbs */}
        <Box sx={{ px: { xs: 2, md: 3 }, pb: 2 }}>
          <Breadcrumbs
            separator={<NavigateNext fontSize="small" />}
            aria-label="breadcrumb"
          >
            {breadcrumbMap[currentPage]?.map((crumb, index, array) => (
              <Link
                key={crumb}
                underline="hover"
                color={index === array.length - 1 ? 'text.primary' : 'text.secondary'}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: index === array.length - 1 ? 'default' : 'pointer',
                  fontWeight: index === array.length - 1 ? 600 : 400,
                  fontSize: '0.875rem',
                }}
                onClick={() => {
                  if (index === 0) handleNavigation('dashboard');
                }}
              >
                {index === 0 && <Home sx={{ mr: 0.5, fontSize: '1rem' }} />}
                {crumb}
              </Link>
            ))}
          </Breadcrumbs>
        </Box>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileDrawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            borderRadius: 0,
          },
        }}
      >
        <AnimatePresence>
          {mobileDrawerOpen && (
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Student Manager
                </Typography>
              </Box>
              <NavigationList />
            </motion.div>
          )}
        </AnimatePresence>
      </Drawer>

      {/* User Menu */}
      <UserMenu />
    </>
  );
}
