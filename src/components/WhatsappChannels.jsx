import React, { useEffect, useState } from 'react';
import { fetchWhatsappChannels } from '../services/whatsappChannels.js';
import { Box, Paper, Typography, Button, CircularProgress, Chip } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

export function WhatsappChannels({ channels: propChannels }) {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (propChannels && propChannels.length > 0) {
      setChannels(propChannels);
      setLoading(false);
    } else if (propChannels && propChannels.length === 0) {
      setChannels([]);
      setLoading(false);
    } else {
      const load = async () => {
        try {
          const data = await fetchWhatsappChannels();
          setChannels(data);
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [propChannels]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!channels.length) {
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
          No WhatsApp Channels yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          When volunteers share WhatsApp Channels, they&apos;ll appear here so students can subscribe
          and receive educational content and updates.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'grid', gap: { xs: 1.2, sm: 1.5, md: 1.5 } }}>
      {channels.map((channel) => (
        <Paper
          key={channel.id}
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
                ? '1px solid rgba(16,185,129,0.4)'
                : '1px solid rgba(52,211,153,0.6)',
            bgcolor:
              theme.palette.mode === 'light'
                ? 'rgba(236,253,245,0.6)'
                : 'rgba(6,78,59,0.2)'
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
                  'radial-gradient(circle at 30% 0%, #d1fae5, #10b981)',
                boxShadow: '0 8px 22px rgba(16,185,129,0.55)',
                color: '#f9fafb',
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
                {channel.subject || 'WhatsApp Channel'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: channel.description ? 0.2 : 0, flexWrap: 'wrap' }}>
                {channel.level === 'university' ? (
                  <>
                    {channel.universityName && (
                      <Chip
                        size="small"
                        label={channel.universityName}
                        sx={{ height: { xs: 18, sm: 20 }, fontSize: { xs: 10, sm: 11 }, borderRadius: 999 }}
                      />
                    )}
                    {channel.year && (
                      <Chip
                        size="small"
                        label={`Year ${channel.year}`}
                        sx={{ height: { xs: 18, sm: 20 }, fontSize: { xs: 10, sm: 11 }, borderRadius: 999 }}
                      />
                    )}
                  </>
                ) : (
                  <>
                    {channel.grade && (
                      <Chip
                        size="small"
                        label={`Grade ${channel.grade}`}
                        sx={{ height: { xs: 18, sm: 20 }, fontSize: { xs: 10, sm: 11 }, borderRadius: 999 }}
                      />
                    )}
                  </>
                )}
                {channel.medium && channel.medium !== 'all' && (
                  <Chip
                    size="small"
                    label={`Medium: ${channel.medium}`}
                    sx={{ height: { xs: 18, sm: 20 }, fontSize: { xs: 10, sm: 11 }, borderRadius: 999 }}
                  />
                )}
              </Box>
              {channel.description && (
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
                  {channel.description}
                </Typography>
              )}
            </Box>
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={() => channel.url && window.open(channel.url, '_blank', 'noopener')}
            sx={{ 
              alignSelf: { xs: 'stretch', sm: 'center' },
              fontSize: { xs: 12, sm: 13, md: 14 },
              px: { xs: 2, sm: 2.5, md: 2.5 },
              borderColor: (theme) =>
                theme.palette.mode === 'light'
                  ? 'rgba(16,185,129,0.5)'
                  : 'rgba(52,211,153,0.6)',
              color: (theme) =>
                theme.palette.mode === 'light'
                  ? '#059669'
                  : '#34d399',
              '&:hover': {
                borderColor: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'rgba(16,185,129,0.8)'
                    : 'rgba(52,211,153,0.9)',
                bgcolor: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'rgba(16,185,129,0.1)'
                    : 'rgba(52,211,153,0.15)'
              }
            }}
          >
            Subscribe
          </Button>
        </Paper>
      ))}
    </Box>
  );
}

