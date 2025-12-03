import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import logoImage from '../images/Adobe Express - file.png';

const navItems = [
  { label: 'Home', href: '#top', variant: 'text' },
  { label: 'Browse Notes', href: '#browse', variant: 'outlined' },
  { label: 'HN News', href: '#hn-news', variant: 'outlined' },
  { label: 'About Us', href: '#about', variant: 'outlined' },
  { label: 'Donate / Upload', href: '#donate', variant: 'contained', cta: true },
  { label: 'Feedback', href: '#feedback', variant: 'outlined' }
];

export function Navbar({ mode, onToggleMode }) {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (value) => () => {
    setOpen(value);
  };

  const handleNavClick = (href) => (event) => {
    event.preventDefault();
    setOpen(false);
    // Update URL hash so the app can detect \"HN News\" as a separate view
    if (href.startsWith('#')) {
      window.location.hash = href;
    }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backdropFilter: 'blur(18px)',
        bgcolor: (theme) =>
          theme.palette.mode === 'light'
            ? 'rgba(248,250,252,0.9)'
            : 'rgba(15,23,42,0.96)',
        borderBottom: (theme) =>
          theme.palette.mode === 'light'
            ? '1px solid rgba(148,163,184,0.3)'
            : '1px solid rgba(31,41,55,0.9)'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: 0.5, gap: 1 }}>
          <Box
            component="a"
            href="#top"
            onClick={handleNavClick('#top')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'text.primary',
              flexGrow: { xs: 1, md: 0 },
              gap: 1.2
            }}
          >
            <Box
              component="img"
              src={logoImage}
              alt="HopeNotes Logo"
              sx={{
                width: { xs: 36, sm: 40, md: 44 },
                height: { xs: 36, sm: 40, md: 44 },
                objectFit: 'contain',
                flexShrink: 0
              }}
            />
            <Typography
              variant="h6"
              sx={{ 
                fontWeight: 650, 
                letterSpacing: 0.4, 
                fontSize: { xs: 14, sm: 17, md: 18 },
                display: 'block',
                color: '#facc15'
              }}
            >
              HopeNotes
            </Typography>
          </Box>

          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              gap: 1,
              ml: 'auto',
              alignItems: 'center'
            }}
          >
            {navItems.map((item) => (
              <Button
                key={item.label}
                onClick={handleNavClick(item.href)}
                variant={item.variant}
                sx={{
                  borderRadius: 999,
                  px: { xs: 1.8, sm: 2, md: 2.2 },
                  fontSize: { xs: 12, sm: 13, md: 14 },
                  color: (theme) =>
                    item.cta
                      ? theme.palette.getContrastText(theme.palette.secondary.main)
                      : theme.palette.mode === 'light'
                        ? theme.palette.text.primary
                        : theme.palette.text.primary,
                  ...(item.variant === 'outlined' && {
                    borderColor: 'primary.main',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'light'
                        ? 'rgba(8,145,178,0.06)'
                        : 'rgba(15,23,42,0.9)',
                    '&:hover': {
                      borderColor: 'primary.light',
                      bgcolor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(8,145,178,0.16)'
                          : 'rgba(15,23,42,1)'
                    }
                  }),
                  ...(item.cta && {
                    boxShadow: (theme) =>
                      theme.palette.mode === 'light'
                        ? '0 10px 24px rgba(34,197,94,0.7)'
                        : '0 10px 28px rgba(16,185,129,0.9)',
                    '&:hover': {
                      boxShadow: (theme) =>
                        theme.palette.mode === 'light'
                          ? '0 12px 28px rgba(34,197,94,0.85)'
                          : '0 14px 32px rgba(16,185,129,1)'
                    }
                  })
                }}
              >
                {item.label}
              </Button>
            ))}

            <IconButton
              size="small"
              aria-label="Toggle light / dark mode"
              onClick={onToggleMode}
              sx={{
                ml: 1,
                bgcolor: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'rgba(148,163,184,0.25)'
                    : 'rgba(15,23,42,0.9)',
                '&:hover': {
                  bgcolor: (theme) =>
                    theme.palette.mode === 'light'
                      ? 'rgba(148,163,184,0.45)'
                      : 'rgba(15,23,42,1)'
                }
              }}
            >
              {mode === 'light' ? (
                <DarkModeIcon fontSize="small" />
              ) : (
                <LightModeIcon fontSize="small" />
              )}
            </IconButton>
          </Box>

          <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 0.5, alignItems: 'center' }}>
            <IconButton
              size="small"
              aria-label="Toggle light / dark mode"
              onClick={onToggleMode}
              sx={{
                bgcolor: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'rgba(148,163,184,0.25)'
                    : 'rgba(15,23,42,0.9)',
                '&:hover': {
                  bgcolor: (theme) =>
                    theme.palette.mode === 'light'
                      ? 'rgba(148,163,184,0.45)'
                      : 'rgba(15,23,42,1)'
                }
              }}
            >
              {mode === 'light' ? (
                <DarkModeIcon fontSize="small" />
              ) : (
                <LightModeIcon fontSize="small" />
              )}
            </IconButton>
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
            >
              <MenuIcon sx={{ color: 'text.primary' }} />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 260 }} role="presentation">
          <List>
            {navItems.map((item) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton onClick={handleNavClick(item.href)}>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: item.cta ? 600 : 500,
                      color: item.cta ? 'primary.main' : 'text.primary'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
            <ListItem disablePadding>
              <ListItemButton onClick={onToggleMode}>
                <ListItemText
                  primary={mode === 'light' ? 'Dark Mode' : 'Light Mode'}
                  primaryTypographyProps={{
                    fontWeight: 500
                  }}
                />
                {mode === 'light' ? (
                  <DarkModeIcon sx={{ ml: 'auto' }} />
                ) : (
                  <LightModeIcon sx={{ ml: 'auto' }} />
                )}
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}


