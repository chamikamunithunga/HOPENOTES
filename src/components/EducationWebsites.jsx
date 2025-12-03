import React, { useEffect, useState } from 'react';
import { fetchEducationWebsites } from '../services/educationWebsites.js';
import { Box, Paper, Typography, Button, CircularProgress, Chip } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';

export function EducationWebsites({ websites: propWebsites }) {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (propWebsites && propWebsites.length > 0) {
      setWebsites(propWebsites);
      setLoading(false);
    } else if (propWebsites && propWebsites.length === 0) {
      setWebsites([]);
      setLoading(false);
    } else {
      const load = async () => {
        try {
          const data = await fetchEducationWebsites();
          setWebsites(data);
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [propWebsites]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!websites.length) {
    return (
      <Box
        sx={(theme) => ({
          borderRadius: 2,
          p: 2,
          border:
            theme.palette.mode === 'light'
              ? '1px dashed rgba(148,163,184,0.7)'
              : '1px dashed rgba(148,163,184,0.6)',
          bgcolor:
            theme.palette.mode === 'light'
              ? 'rgba(248,250,252,0.9)'
              : 'rgba(15,23,42,0.95)'
        })}
      >
        <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
          No education websites yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          When volunteers share educational websites, they&apos;ll appear here so students can access
          free online learning resources.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gap: { xs: 1.5, sm: 1.8, md: 2.2 },
        px: { xs: 0.5, sm: 0 },
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        gridTemplateColumns: {
          xs: '1fr',
          sm: '1fr',
          md: 'repeat(2, minmax(0, 1fr))'
        }
      }}
    >
      {websites.map((website) => (
        <Paper
          key={website.id}
          sx={(theme) => ({
            p: { xs: 1.5, sm: 1.8, md: 2 },
            borderRadius: { xs: 2.5, sm: 3, md: 3 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: { xs: 1.5, sm: 1.8, md: 2 },
            border:
              theme.palette.mode === 'light'
                ? '1px solid rgba(249,115,22,0.4)'
                : '1px solid rgba(251,146,60,0.6)',
            bgcolor:
              theme.palette.mode === 'light'
                ? 'rgba(255,247,237,0.6)'
                : 'rgba(77,36,0,0.2)',
            width: '100%',
            maxWidth: '100%',
            boxShadow: (theme) =>
              theme.palette.mode === 'light'
                ? '0 2px 8px rgba(249,115,22,0.15)'
                : '0 2px 8px rgba(0,0,0,0.3)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: (theme) =>
                theme.palette.mode === 'light'
                  ? '0 4px 12px rgba(249,115,22,0.25)'
                  : '0 4px 12px rgba(0,0,0,0.4)',
              transform: 'translateY(-2px)'
            }
          })}
        >
          <Box 
            sx={{ 
              minWidth: 0, 
              display: 'flex', 
              alignItems: { xs: 'flex-start', sm: 'center' }, 
              gap: { xs: 1.2, sm: 1.4, md: 1.5 }, 
              flex: 1,
              width: '100%',
              flexDirection: { xs: 'row', sm: 'row' }
            }}
          >
            <Box
              sx={{
                width: { xs: 36, sm: 40, md: 44 },
                height: { xs: 36, sm: 40, md: 44 },
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                  'radial-gradient(circle at 30% 0%, #fed7aa, #f97316)',
                boxShadow: '0 8px 22px rgba(249,115,22,0.55)',
                color: '#f9fafb',
                flexShrink: 0,
                minWidth: { xs: 36, sm: 40, md: 44 }
              }}
            >
              <LanguageIcon sx={{ fontSize: { xs: 20, sm: 22, md: 24 } }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1, width: '100%' }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  mb: { xs: 0.5, sm: 0.3 },
                  fontSize: { xs: 14, sm: 15, md: 16 },
                  lineHeight: { xs: 1.4, sm: 1.3 },
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  hyphens: 'auto',
                  color: (theme) =>
                    theme.palette.mode === 'light'
                      ? '#1e293b'
                      : '#f1f5f9'
                }}
              >
                {website.subject || 'Education Website'}
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: { xs: 0.5, sm: 0.6, md: 0.8 }, 
                  mb: website.description ? { xs: 0.8, sm: 0.4 } : 0, 
                  flexWrap: 'wrap',
                  mt: { xs: 0.5, sm: 0.3 }
                }}
              >
                {website.level === 'university' ? (
                  <>
                    {website.universityName && (
                      <Chip
                        size="small"
                        label={website.universityName}
                        sx={{ 
                          height: { xs: 20, sm: 22, md: 24 }, 
                          fontSize: { xs: 10.5, sm: 11, md: 11.5 }, 
                          borderRadius: 999,
                          fontWeight: 500,
                          px: { xs: 0.8, sm: 1 }
                        }}
                      />
                    )}
                    {website.year && (
                      <Chip
                        size="small"
                        label={`Year ${website.year}`}
                        sx={{ 
                          height: { xs: 20, sm: 22, md: 24 }, 
                          fontSize: { xs: 10.5, sm: 11, md: 11.5 }, 
                          borderRadius: 999,
                          fontWeight: 500,
                          px: { xs: 0.8, sm: 1 }
                        }}
                      />
                    )}
                  </>
                ) : (
                  <>
                    {website.grade && (
                      <Chip
                        size="small"
                        label={`Grade ${website.grade}`}
                        sx={{ 
                          height: { xs: 20, sm: 22, md: 24 }, 
                          fontSize: { xs: 10.5, sm: 11, md: 11.5 }, 
                          borderRadius: 999,
                          fontWeight: 500,
                          px: { xs: 0.8, sm: 1 }
                        }}
                      />
                    )}
                  </>
                )}
                {website.medium && website.medium !== 'all' && (
                  <Chip
                    size="small"
                    label={`Medium: ${website.medium}`}
                    sx={{ 
                      height: { xs: 20, sm: 22, md: 24 }, 
                      fontSize: { xs: 10.5, sm: 11, md: 11.5 }, 
                      borderRadius: 999,
                      fontWeight: 500,
                      px: { xs: 0.8, sm: 1 }
                    }}
                  />
                )}
              </Box>
              {website.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: 12.5, sm: 13, md: 13.5 },
                    lineHeight: { xs: 1.6, sm: 1.5 },
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    mt: { xs: 0.5, sm: 0.3 },
                    display: { xs: 'block', sm: 'block' },
                    color: (theme) =>
                      theme.palette.mode === 'light'
                        ? '#64748b'
                        : '#94a3b8'
                  }}
                >
                  {website.description}
                </Typography>
              )}
            </Box>
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={() => website.url && window.open(website.url, '_blank', 'noopener')}
            sx={{ 
              alignSelf: { xs: 'stretch', sm: 'center' },
              width: { xs: '100%', sm: 'auto' },
              minWidth: { xs: '100%', sm: 120, md: 140 },
              fontSize: { xs: 13, sm: 13.5, md: 14 },
              fontWeight: 600,
              px: { xs: 2.5, sm: 3, md: 3.5 },
              py: { xs: 1, sm: 0.9, md: 1 },
              borderRadius: { xs: 2, sm: 2.5 },
              borderWidth: { xs: 1.5, sm: 1 },
              borderColor: (theme) =>
                theme.palette.mode === 'light'
                  ? 'rgba(249,115,22,0.5)'
                  : 'rgba(251,146,60,0.6)',
              color: (theme) =>
                theme.palette.mode === 'light'
                  ? '#c2410c'
                  : '#fb923c',
              bgcolor: (theme) =>
                theme.palette.mode === 'light'
                  ? 'rgba(249,115,22,0.05)'
                  : 'rgba(251,146,60,0.08)',
              '&:hover': {
                borderColor: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'rgba(249,115,22,0.8)'
                    : 'rgba(251,146,60,0.9)',
                bgcolor: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'rgba(249,115,22,0.15)'
                    : 'rgba(251,146,60,0.2)',
                transform: 'scale(1.02)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Visit Website
          </Button>
        </Paper>
      ))}
    </Box>
  );
}

