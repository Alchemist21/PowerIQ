import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import BoltIcon from '@mui/icons-material/Bolt';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUserMenuClick = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Contract Analysis', path: '/analysis' },
    { label: 'Risk Reports', path: '/reports' },
    { label: 'History', path: '/history' },
  ];

  return (
    <AppBar position="static">
      <Toolbar>
        <BoltIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
          PowerIQ
        </Typography>

        {isMobile ? (
          // Mobile menu
          <>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuClick}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              {menuItems.map((item) => (
                <MenuItem 
                  key={item.path} 
                  onClick={handleMenuClose}
                >
                  {item.label}
                </MenuItem>
              ))}
            </Menu>
          </>
        ) : (
          // Desktop menu
          <Box sx={{ flexGrow: 1 }}>
            {menuItems.map((item) => (
              <Button 
                color="inherit" 
                key={item.path}
                sx={{ mx: 1 }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}

        {/* User menu - shown on both mobile and desktop */}
        <IconButton
          color="inherit"
          onClick={handleUserMenuClick}
          size="large"
        >
          <AccountCircleIcon />
        </IconButton>
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
        >
          <MenuItem onClick={handleUserMenuClose}>Profile</MenuItem>
          <MenuItem onClick={handleUserMenuClose}>Settings</MenuItem>
          <MenuItem onClick={handleUserMenuClose}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
