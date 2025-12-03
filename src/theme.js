import { createTheme } from '@mui/material/styles';

export const getAppTheme = (mode = 'light') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#0891b2'
      },
      secondary: {
        main: '#22c55e'
      },
      background: {
        default: mode === 'light' ? '#f5fbfb' : '#020617',
        paper: mode === 'light' ? '#ffffff' : '#020617'
      },
      text: {
        primary: mode === 'light' ? '#0f172a' : '#e5e7eb',
        secondary: mode === 'light' ? '#64748b' : '#9ca3af'
      }
    },
    shape: {
      borderRadius: 14
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 999
          }
        }
      },
      MuiPaper: {
        defaultProps: {
          elevation: 2
        },
        styleOverrides: {
          root: {
            borderRadius: 20
          }
        }
      }
    },
    typography: {
      fontFamily:
        'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", Roboto, sans-serif',
      h1: {
        fontWeight: 700
      },
      h2: {
        fontWeight: 650
      }
    }
  });


