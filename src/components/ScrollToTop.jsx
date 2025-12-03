import React, { useState, useEffect } from 'react';
import { Box, Fab } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: { xs: 24, sm: 32, md: 40 },
        right: { xs: 16, sm: 24, md: 32 },
        zIndex: 1000,
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? 'visible' : 'hidden',
        transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out',
        transform: isVisible ? 'scale(1)' : 'scale(0.8)',
        transitionProperty: 'opacity, visibility, transform'
      }}
    >
      <Fab
        onClick={scrollToTop}
        size="medium"
        aria-label="scroll to top"
        sx={{
          bgcolor: '#facc15',
          color: '#0f172a',
          '&:hover': {
            bgcolor: '#eab308',
            transform: 'scale(1.1)',
            boxShadow: '0 8px 24px rgba(250, 204, 21, 0.5)'
          },
          boxShadow: (theme) =>
            theme.palette.mode === 'light'
              ? '0 6px 20px rgba(250, 204, 21, 0.4)'
              : '0 6px 20px rgba(250, 204, 21, 0.6)',
          transition: 'all 0.3s ease-in-out',
          width: { xs: 48, sm: 52, md: 56 },
          height: { xs: 48, sm: 52, md: 56 }
        }}
      >
        <KeyboardArrowUpIcon
          sx={{
            fontSize: { xs: 28, sm: 30, md: 32 },
            fontWeight: 'bold'
          }}
        />
      </Fab>
    </Box>
  );
}

