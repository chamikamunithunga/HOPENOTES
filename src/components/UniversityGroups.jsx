import React, { useEffect, useState } from 'react';
import { fetchUniversityGroups } from '../services/universityGroups.js';
import { Box, Paper, Typography, Button, Chip, CircularProgress } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

export function UniversityGroups({ groups: propGroups }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (propGroups && propGroups.length > 0) {
      // Use data from props (already fetched in App.jsx)
      setGroups(propGroups);
      setLoading(false);
    } else if (propGroups && propGroups.length === 0) {
      // Empty array means data was loaded but no groups exist
      setGroups([]);
      setLoading(false);
    } else {
      // Fallback: fetch if props not provided (backward compatibility)
      const load = async () => {
        try {
          const data = await fetchUniversityGroups();
          setGroups(data);
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [propGroups]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!groups.length) {
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
          No university groups yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          When university volunteers share WhatsApp groups, they&apos;ll appear here so students
          can stay connected with their batch or faculty.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'grid', gap: { xs: 1.2, sm: 1.5, md: 1.5 } }}>
      {groups.map((group) => (
        <Paper
          key={group.id}
          sx={(theme) => ({
            p: { xs: 1.3, sm: 1.6, md: 1.6 },
            borderRadius: 2,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: { xs: 1.2, sm: 1.4, md: 1.4 },
            border:
              theme.palette.mode === 'light'
                ? '1px solid rgba(129,140,248,0.5)'
                : '1px solid rgba(94,234,212,0.7)'
          })}
        >
          <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.1, md: 1.1 }, flex: 1 }}>
            <Box
              sx={{
                width: { xs: 30, sm: 34, md: 34 },
                height: { xs: 30, sm: 34, md: 34 },
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                  'radial-gradient(circle at 30% 0%, #e0f2fe, #6366f1)',
                boxShadow: '0 8px 22px rgba(79,70,229,0.55)',
                color: '#f9fafb',
                flexShrink: 0
              }}
            >
              <SchoolIcon sx={{ fontSize: { xs: 18, sm: 20, md: 20 } }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  mb: { xs: 0.3, sm: 0.4 },
                  fontSize: { xs: 13, sm: 14, md: 14 },
                  whiteSpace: { xs: 'normal', sm: 'nowrap' },
                  textOverflow: 'ellipsis',
                  overflow: 'hidden'
                }}
              >
                {group.universityName || 'University group'}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mb: group.description ? 0.3 : 0 }}>
                {group.year && (
                  <Chip
                    size="small"
                    label={`Year ${group.year}`}
                    sx={{ height: { xs: 20, sm: 22 }, fontSize: { xs: 10, sm: 11 }, borderRadius: 999 }}
                  />
                )}
                {group.medium && (
                  <Chip
                    size="small"
                    label={group.medium}
                    sx={{ height: { xs: 20, sm: 22 }, fontSize: { xs: 10, sm: 11 }, borderRadius: 999 }}
                  />
                )}
              </Box>
              {group.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: 12, sm: 13 },
                    whiteSpace: { xs: 'normal', sm: 'nowrap' }, 
                    textOverflow: 'ellipsis', 
                    overflow: 'hidden' 
                  }}
                >
                  {group.description}
                </Typography>
              )}
            </Box>
          </Box>
          <Button
            variant="contained"
            size="small"
            startIcon={<WhatsAppIcon sx={{ fontSize: { xs: 16, sm: 18, md: 18 } }} />}
            onClick={() => group.url && window.open(group.url, '_blank', 'noopener')}
            sx={{ 
              alignSelf: { xs: 'stretch', sm: 'center' },
              fontSize: { xs: 12, sm: 13, md: 14 },
              px: { xs: 2, sm: 2.5, md: 2.5 }
            }}
          >
            Join group
          </Button>
        </Paper>
      ))}
    </Box>
  );
}


