import React, { useEffect, useState } from 'react';
import { fetchTelegramGroups } from '../services/telegramGroups.js';
import { Box, Paper, Typography, Button, CircularProgress, Chip } from '@mui/material';
import TelegramIcon from '@mui/icons-material/Telegram';

export function TelegramGroups({ groups: propGroups }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if propGroups is defined (not null/undefined)
    if (propGroups !== undefined && propGroups !== null) {
      setGroups(propGroups);
      setLoading(false);
    } else {
      // Fallback: fetch if props not provided (backward compatibility)
      const load = async () => {
        try {
          const data = await fetchTelegramGroups();
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
          No Telegram groups yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          When volunteers share Telegram groups, they&apos;ll appear here so students can join
          and learn together.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'grid', 
      gap: { xs: 1.2, sm: 1.5, md: 1.5 },
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box'
    }}>
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
                ? '1px solid rgba(6,182,212,0.4)'
                : '1px solid rgba(34,211,238,0.6)',
            bgcolor:
              theme.palette.mode === 'light'
                ? 'rgba(240,253,250,0.6)'
                : 'rgba(6,78,59,0.2)',
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
            boxSizing: 'border-box'
          })}
        >
          <Box sx={{ 
            minWidth: 0, 
            display: 'flex', 
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            gap: { xs: 1, sm: 1.1, md: 1.1 }, 
            flex: 1,
            width: '100%',
            overflow: 'hidden'
          }}>
            <Box
              sx={{
                width: { xs: 30, sm: 34, md: 34 },
                height: { xs: 30, sm: 34, md: 34 },
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                  'radial-gradient(circle at 30% 0%, #e0f7fa, #06b6d4)',
                boxShadow: '0 8px 22px rgba(6,182,212,0.55)',
                color: '#f9fafb',
                flexShrink: 0
              }}
            >
              <TelegramIcon sx={{ fontSize: { xs: 18, sm: 20, md: 20 } }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1, width: '100%', overflow: 'hidden' }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  mb: 0.2,
                  fontSize: { xs: 13, sm: 14, md: 14 },
                  whiteSpace: { xs: 'normal', sm: 'nowrap' },
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  wordBreak: { xs: 'break-word', sm: 'normal' },
                  maxWidth: '100%'
                }}
              >
                {group.subject || 'Telegram Study Group'}
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.6, 
                mb: group.description ? 0.2 : 0, 
                flexWrap: 'wrap',
                width: '100%',
                maxWidth: '100%'
              }}>
                {group.level === 'university' ? (
                  <>
                    {group.universityName && (
                      <Chip
                        size="small"
                        label={group.universityName}
                        sx={{ 
                          height: { xs: 18, sm: 20 }, 
                          fontSize: { xs: 10, sm: 11 }, 
                          borderRadius: 999,
                          maxWidth: { xs: '100%', sm: 'none' }
                        }}
                      />
                    )}
                    {group.year && (
                      <Chip
                        size="small"
                        label={`Year ${group.year}`}
                        sx={{ 
                          height: { xs: 18, sm: 20 }, 
                          fontSize: { xs: 10, sm: 11 }, 
                          borderRadius: 999,
                          maxWidth: { xs: '100%', sm: 'none' }
                        }}
                      />
                    )}
                  </>
                ) : (
                  <>
                    {group.grade && (
                      <Chip
                        size="small"
                        label={`Grade ${group.grade}`}
                        sx={{ 
                          height: { xs: 18, sm: 20 }, 
                          fontSize: { xs: 10, sm: 11 }, 
                          borderRadius: 999,
                          maxWidth: { xs: '100%', sm: 'none' }
                        }}
                      />
                    )}
                  </>
                )}
                {group.medium && group.medium !== 'all' && (
                  <Chip
                    size="small"
                    label={`Medium: ${group.medium}`}
                    sx={{ 
                      height: { xs: 18, sm: 20 }, 
                      fontSize: { xs: 10, sm: 11 }, 
                      borderRadius: 999,
                      maxWidth: { xs: '100%', sm: 'none' }
                    }}
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
                    textOverflow: { xs: 'clip', sm: 'ellipsis' }, 
                    overflow: { xs: 'visible', sm: 'hidden' },
                    wordBreak: { xs: 'break-word', sm: 'normal' },
                    maxWidth: '100%'
                  }}
                >
                  {group.description}
                </Typography>
              )}
            </Box>
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={() => group.url && window.open(group.url, '_blank', 'noopener')}
            sx={{ 
              alignSelf: { xs: 'stretch', sm: 'center' },
              fontSize: { xs: 12, sm: 13, md: 14 },
              px: { xs: 2, sm: 2.5, md: 2.5 },
              minWidth: { xs: '100%', sm: 'auto' },
              width: { xs: '100%', sm: 'auto' },
              maxWidth: { xs: '100%', sm: 'none' },
              borderColor: (theme) =>
                theme.palette.mode === 'light'
                  ? 'rgba(6,182,212,0.5)'
                  : 'rgba(34,211,238,0.6)',
              color: (theme) =>
                theme.palette.mode === 'light'
                  ? '#0891b2'
                  : '#22d3ee',
              '&:hover': {
                borderColor: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'rgba(6,182,212,0.8)'
                    : 'rgba(34,211,238,0.9)',
                bgcolor: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'rgba(6,182,212,0.1)'
                    : 'rgba(34,211,238,0.15)'
              }
            }}
          >
            Join Group
          </Button>
        </Paper>
      ))}
    </Box>
  );
}

