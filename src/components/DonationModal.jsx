import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import {
  Close as CloseIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  MenuBook as BookIcon,
  Send as SendIcon,
  VolunteerActivism as GiftIcon,
  CardGiftcard as PackageIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

/**
 * A self-contained donation modal for HopeHub requests.
 *
 * Props:
 * - open: boolean
 * - request: {
 *     id, userType, studentName, location, district,
 *     items: string[], story, verificationDoc,
 *     disasterImages?: string[],
 *     donations?: Array<{ donor, contact, location, items }>
 *   }
 * - onClose: function
 * - onSubmitDonation: function(donationPayload, request) -> void|Promise
 */
export default function DonationModal({ open, request, onClose, onSubmitDonation }) {
  const [donationForm, setDonationForm] = useState({
    name: '',
    phone: '',
    location: '',
    items: ''
  });
  const [error, setError] = useState('');

  if (!request) return null;

  const donations = request.donations || [];

  const handleDonate = async (e) => {
    e.preventDefault();
    setError('');
    if (!donationForm.name.trim() || !donationForm.items.trim() || !donationForm.location.trim()) {
      setError('Please fill in name, donation items, and location.');
      return;
    }
    if (onSubmitDonation) {
      await onSubmitDonation(
        {
          donor: donationForm.name.trim(),
          contact: donationForm.phone.trim(),
          location: donationForm.location.trim(),
          items: donationForm.items.trim()
        },
        request
      );
    }
    setDonationForm({ name: '', phone: '', location: '', items: '' });
  };

  const getTypeIcon = () => {
    if (request.userType === 'school') return <SchoolIcon sx={{ color: '#7c3aed' }} />;
    if (request.userType === 'library') return <BookIcon sx={{ color: '#f59e0b' }} />;
    return <PersonIcon sx={{ color: '#06b6d4' }} />;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                bgcolor: 'rgba(14,165,233,0.12)',
                display: 'grid',
                placeItems: 'center'
              }}
            >
              {getTypeIcon()}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {request.studentName}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
                <LocationIcon sx={{ fontSize: 16 }} />
                <Typography variant="body2">
                  {request.location}, {request.district}
                </Typography>
              </Stack>
            </Box>
          </Stack>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Main content */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <PackageIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Needs Support For
                </Typography>
              </Stack>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {request.items?.map((item, idx) => (
                  <Chip key={idx} label={item} size="small" />
                ))}
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Verification & Evidence
              </Typography>
              {request.userType === 'student' ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' },
                    gap: 1
                  }}
                >
                  {request.disasterImages && request.disasterImages.length > 0 ? (
                    request.disasterImages.map((img, idx) => (
                      <Box
                        key={idx}
                        component="img"
                        src={img}
                        alt="Evidence"
                        sx={{
                          width: '100%',
                          height: 110,
                          objectFit: 'cover',
                          borderRadius: 1,
                          border: '1px solid rgba(0,0,0,0.1)'
                        }}
                      />
                    ))
                  ) : (
                    <Box
                      sx={{
                        gridColumn: '1 / -1',
                        height: 120,
                        bgcolor: 'grey.100',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'text.secondary',
                        fontSize: 12
                      }}
                    >
                      No images provided
                    </Box>
                  )}
                </Box>
              ) : (
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: 'rgba(59,130,246,0.06)',
                    border: '1px solid rgba(59,130,246,0.2)'
                  }}
                >
                  <CheckCircleIcon sx={{ color: '#3b82f6' }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Official Request Letter Verified
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#3b82f6' }}>
                      Reference: {request.verificationDoc || 'Pending'}
                    </Typography>
                  </Box>
                </Stack>
              )}
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                The Story
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  bgcolor: 'grey.50',
                  p: 1.5,
                  borderRadius: 1,
                  border: '1px solid rgba(0,0,0,0.06)',
                  fontStyle: 'italic'
                }}
              >
                "{request.story || request.description || 'No story provided.'}"
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(14,165,233,0.06)',
                border: '1px solid rgba(14,165,233,0.15)'
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <GiftIcon fontSize="small" sx={{ color: '#0ea5e9' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Pledge a Donation
                </Typography>
              </Stack>
              {error && (
                <Typography variant="caption" sx={{ color: '#b91c1c', mb: 1, display: 'block' }}>
                  {error}
                </Typography>
              )}
              <Box component="form" onSubmit={handleDonate} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Your Name"
                    value={donationForm.name}
                    onChange={(e) => setDonationForm((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Your Contact (Mobile)"
                    value={donationForm.phone}
                    onChange={(e) => setDonationForm((prev) => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </Stack>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Your City / Location (e.g. Colombo)"
                  value={donationForm.location}
                  onChange={(e) => setDonationForm((prev) => ({ ...prev, location: e.target.value }))}
                  required
                />
                <TextField
                  fullWidth
                  size="small"
                  placeholder="What would you like to donate? (e.g., 5 Books, Money)"
                  value={donationForm.items}
                  onChange={(e) => setDonationForm((prev) => ({ ...prev, items: e.target.value }))}
                  required
                  multiline
                  minRows={2}
                />
                <Button type="submit" variant="contained" startIcon={<SendIcon />} sx={{ textTransform: 'none' }}>
                  Submit Pledge
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0ea5e9' }}>
                  Recipient Contact:
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 999,
                    border: '1px solid rgba(14,165,233,0.2)',
                    px: 1.5,
                    py: 0.5
                  }}
                >
                  <PhoneIcon sx={{ fontSize: 16, color: '#0ea5e9' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {request.phone || request.contactNumber || 'Not provided'}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Box>

          {/* Sidebar */}
          <Box
            sx={{
              width: { xs: '100%', md: 280 },
              p: 2,
              borderRadius: 2,
              bgcolor: 'grey.50',
              border: '1px solid rgba(0,0,0,0.06)'
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <PersonIcon sx={{ color: '#16a34a' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Community Support
              </Typography>
              <Chip
                label={donations.length}
                size="small"
                sx={{ ml: 'auto', bgcolor: 'rgba(22,163,74,0.12)', color: '#15803d', fontWeight: 700 }}
              />
            </Stack>

            <Stack spacing={1.5}>
              {donations.length > 0 ? (
                donations
                  .slice()
                  .reverse()
                  .map((donation, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 1.2,
                        borderRadius: 1.5,
                        bgcolor: 'white',
                        border: '1px solid rgba(0,0,0,0.06)'
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                        <Typography sx={{ fontWeight: 700 }}>{donation.donor}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          just now
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.secondary', mb: 0.5 }}>
                        <LocationIcon sx={{ fontSize: 14 }} />
                        <Typography variant="caption">{donation.location}</Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Pledged:</strong> {donation.items}
                      </Typography>
                      {donation.contact && (
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                          sx={{
                            color: 'text.secondary',
                            bgcolor: 'grey.100',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1
                          }}
                        >
                          <PhoneIcon sx={{ fontSize: 14 }} />
                          <Typography variant="caption">{donation.contact}</Typography>
                        </Stack>
                      )}
                    </Box>
                  ))
              ) : (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 4,
                    color: 'text.secondary'
                  }}
                >
                  <GiftIcon sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
                  <Typography variant="body2">No donations yet. Be the first to help!</Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

