import React, { useEffect, useState } from 'react';
import { fetchWhatsappGroups } from '../services/whatsappGroups.js';
import { Box, Paper, Typography, Button, CircularProgress, Chip } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

export function WhatsappGroups({ groups: propGroups }) {
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
          const data = await fetchWhatsappGroups();
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
          No WhatsApp study groups yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          When volunteers share WhatsApp groups, they&apos;ll appear here so students can join
          and learn together.
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
            p: { xs: 1.2, sm: 1.5, md: 1.5 },
            borderRadius: 2,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: { xs: 1, sm: 1, md: 1 },
            border:
              theme.palette.mode === 'light'
                ? '1px solid rgba(148,163,184,0.4)'
                : '1px solid rgba(30,64,175,0.7)'
          })}
        >
          <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.2, md: 1.2 }, flex: 1 }}>
            <Box
              sx={{
                width: { xs: 28, sm: 32, md: 32 },
                height: { xs: 28, sm: 32, md: 32 },
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#22c55e1a',
                color: '#22c55e',
                flexShrink: 0
              }}
            >
              <WhatsAppIcon sx={{ fontSize: { xs: 18, sm: 20, md: 20 } }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  mb: 0.2,
                  fontSize: { xs: 13, sm: 14, md: 14 },
                  whiteSpace: { xs: 'normal', sm: 'nowrap' },
                  textOverflow: 'ellipsis',
                  overflow: 'hidden'
                }}
              >
                {group.subject || 'WhatsApp Study Group'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: group.description ? 0.2 : 0, flexWrap: 'wrap' }}>
                {group.level === 'university' ? (
                  <>
                    {group.universityName && (
                      <Chip
                        size="small"
                        label={group.universityName}
                        sx={{ height: { xs: 18, sm: 20 }, fontSize: { xs: 10, sm: 11 }, borderRadius: 999 }}
                      />
                    )}
                    {group.year && (
                      <Chip
                        size="small"
                        label={`Year ${group.year}`}
                        sx={{ height: { xs: 18, sm: 20 }, fontSize: { xs: 10, sm: 11 }, borderRadius: 999 }}
                      />
                    )}
                  </>
                ) : (
                  <>
                    {group.grade && (
                      <Chip
                        size="small"
                        label={`Grade ${group.grade}`}
                        sx={{ height: { xs: 18, sm: 20 }, fontSize: { xs: 10, sm: 11 }, borderRadius: 999 }}
                      />
                    )}
                  </>
                )}
                {group.medium && group.medium !== 'all' && (
                  <Chip
                    size="small"
                    label={`Medium: ${group.medium}`}
                    sx={{ height: { xs: 18, sm: 20 }, fontSize: { xs: 10, sm: 11 }, borderRadius: 999 }}
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
            variant="outlined"
            size="small"
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


