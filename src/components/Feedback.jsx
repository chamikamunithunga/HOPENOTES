import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Avatar,
  Divider
} from '@mui/material';
import { saveFeedback, fetchFeedbacks } from '../services/feedbacks.js';
import RateReviewIcon from '@mui/icons-material/RateReview';
import PersonIcon from '@mui/icons-material/Person';

export function Feedback() {
  const [name, setName] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      const data = await fetchFeedbacks();
      setFeedbacks(data);
    } catch (err) {
      console.error('Failed to load feedbacks:', err);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('');

    // Rate limiting check
    const clientId = getClientId();
    if (!feedbackRateLimiter.isAllowed(clientId)) {
      const timeUntilReset = Math.ceil(feedbackRateLimiter.getTimeUntilReset(clientId) / 1000);
      setError(
        `Too many feedback submissions. Please wait ${timeUntilReset} seconds before trying again. This helps protect our servers from abuse.`
      );
      return;
    }

    // Sanitize inputs
    const sanitizedName = sanitizeName(name);
    const sanitizedFeedback = sanitizeFeedback(feedback);

    if (!sanitizedName.trim()) {
      setError('Please enter your name.');
      return;
    }

    if (!sanitizedFeedback.trim()) {
      setError('Please enter your feedback.');
      return;
    }

    if (sanitizedFeedback.trim().length < 10) {
      setError('Please provide more detailed feedback (at least 10 characters).');
      return;
    }

    setSubmitting(true);

    try {
      await saveFeedback(sanitizedName, sanitizedFeedback);
      setStatus('Thank you for your feedback! Your message helps us improve HopeNotes for students across Sri Lanka.');
      setName('');
      setFeedback('');
      // Reload feedbacks to show the new one
      await loadFeedbacks();
    } catch (err) {
      setError('Something went wrong while submitting your feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Feedback Form */}
      <Paper
        elevation={4}
        sx={(theme) => ({
          borderRadius: 3,
          p: { xs: 2.5, md: 3.5 },
          boxShadow:
            theme.palette.mode === 'light'
              ? '0 18px 40px rgba(15,23,42,0.12)'
              : '0 26px 60px rgba(0,0,0,0.95)',
          border:
            theme.palette.mode === 'light'
              ? '1px solid rgba(148,163,184,0.25)'
              : '1px solid rgba(30,64,175,0.8)',
          bgcolor:
            theme.palette.mode === 'light'
              ? 'rgba(255,255,255,0.98)'
              : 'rgba(15,23,42,0.98)',
          backgroundImage: (theme) =>
            theme.palette.mode === 'light'
              ? 'radial-gradient(circle at top left, rgba(56,189,248,0.08), transparent 55%)'
              : 'radial-gradient(circle at top left, rgba(8,145,178,0.25), transparent 55%)'
        })}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background:
                'radial-gradient(circle at 30% 0%, #e0f2fe, #0891b2)',
              boxShadow: '0 10px 24px rgba(8,145,178,0.5)',
              color: '#ecfeff'
            }}
          >
            <RateReviewIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.3 }}>
              Share Your Feedback
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Help us improve HopeNotes for students across Sri Lanka
            </Typography>
          </Box>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && (
            <Alert severity="warning" variant="outlined">
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Kamal Perera"
            required
            disabled={submitting}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />

          <TextField
            fullWidth
            label="Your Feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us what you think about HopeNotes, how we can improve, or share your experience..."
            required
            multiline
            minRows={4}
            disabled={submitting}
            helperText={`${feedback.length} characters (minimum 10)`}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            sx={{
              alignSelf: 'flex-start',
              px: 3,
              py: 1.1,
              borderRadius: 999,
              backgroundImage: 'linear-gradient(135deg, #16a34a, #22c55e)',
              boxShadow: (theme) =>
                theme.palette.mode === 'light'
                  ? '0 14px 30px rgba(22,163,74,0.55)'
                  : '0 18px 36px rgba(22,163,74,0.95)',
              '&:hover': {
                backgroundImage: 'linear-gradient(135deg, #15803d, #16a34a)'
              }
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>

          {status && (
            <Alert severity="success" variant="outlined" sx={{ mt: 1 }}>
              {status}
            </Alert>
          )}
        </Box>
      </Paper>

      {/* Display Feedbacks */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: { xs: 1, sm: 1.5 }, fontSize: { xs: 20, sm: 22, md: 24 } }}>
          Community Feedback
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 2, sm: 3 }, fontSize: { xs: 13, sm: 14 } }}>
          See what students, teachers, and volunteers are saying about HopeNotes
        </Typography>

        {loadingFeedbacks ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : feedbacks.length === 0 ? (
          <Paper
            sx={(theme) => ({
              p: 3,
              borderRadius: 2,
              border:
                theme.palette.mode === 'light'
                  ? '1px dashed rgba(148,163,184,0.7)'
                  : '1px dashed rgba(148,163,184,0.6)',
              bgcolor:
                theme.palette.mode === 'light'
                  ? 'rgba(248,250,252,0.9)'
                  : 'rgba(15,23,42,0.95)',
              textAlign: 'center'
            })}
          >
            <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
              No feedback yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Be the first to share your thoughts and help us improve HopeNotes!
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {feedbacks.map((item) => (
              <Paper
                key={item.id}
                sx={(theme) => ({
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 2,
                  border:
                    theme.palette.mode === 'light'
                      ? '1px solid rgba(148,163,184,0.3)'
                      : '1px solid rgba(30,64,175,0.6)',
                  bgcolor:
                    theme.palette.mode === 'light'
                      ? 'rgba(255,255,255,0.98)'
                      : 'rgba(15,23,42,0.95)',
                  boxShadow:
                    theme.palette.mode === 'light'
                      ? '0 4px 12px rgba(15,23,42,0.06)'
                      : '0 6px 16px rgba(0,0,0,0.4)'
                })}
              >
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(8,145,178,0.15)'
                          : 'rgba(8,145,178,0.4)',
                      color: (theme) =>
                        theme.palette.mode === 'light'
                          ? '#0891b2'
                          : '#7dd3fc',
                      width: { xs: 36, sm: 40 },
                      height: { xs: 36, sm: 40 }
                    }}
                  >
                    <PersonIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 0.3, sm: 1 }, mb: { xs: 0.6, sm: 0.8 } }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: { xs: 13, sm: 14 } }}>
                        {item.name || 'Anonymous'}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: { xs: 0, sm: 'auto' }, fontSize: { xs: 11, sm: 12 } }}
                      >
                        {formatDate(item.createdAt)}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.primary',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontSize: { xs: 13, sm: 14 }
                      }}
                    >
                      {item.feedback}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

