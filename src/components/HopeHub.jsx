import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import {
  PersonOutline as PersonIcon,
  School as SchoolIcon,
  LocalLibrary as LibraryIcon,
  Link as LinkIcon,
  Add as AddIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  WhatsApp as WhatsAppIcon,
  Favorite as FavoriteIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { collection, addDoc, getDocs, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../firebase';
import { uploadFileToCloudinary, validateFile } from '../utils/cloudinaryUpload';
import bannerImage from '../images/gettyimages-531834632-612x612.jpg';

const districtsList = [
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Matale',
  'Nuwara Eliya',
  'Galle',
  'Matara',
  'Hambantota',
  'Jaffna',
  'Kilinochchi',
  'Mannar',
  'Vavuniya',
  'Mullaitivu',
  'Batticaloa',
  'Ampara',
  'Trincomalee',
  'Kurunegala',
  'Puttalam',
  'Anuradhapura',
  'Polonnaruwa',
  'Badulla',
  'Monaragala',
  'Ratnapura',
  'Kegalle'
];

export function HopeHub({ mode = 'light' }) {
  const theme = useTheme();
  const isDark = mode === 'dark';
  const [requestType, setRequestType] = useState('student'); // student | school | library
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState('');
  const [proofFiles, setProofFiles] = useState([]); // Array of File objects
  const [proofUrls, setProofUrls] = useState([]); // Array of Cloudinary URLs (after upload)
  const [proofUploadProgress, setProofUploadProgress] = useState({}); // { fileIndex: progress }
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [campaignPoster, setCampaignPoster] = useState(null);
  const [campaignPosterProgress, setCampaignPosterProgress] = useState(0);
  const [isUploadingCampaign, setIsUploadingCampaign] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [campaignError, setCampaignError] = useState('');
  const [campaignStatus, setCampaignStatus] = useState('');
  const [campaigns, setCampaigns] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [viewProofDialog, setViewProofDialog] = useState({ open: false, urls: [], name: '' });
  const [donationDialog, setDonationDialog] = useState({ open: false, request: null });
  const [donationForm, setDonationForm] = useState({
    donorName: '',
    donorContact: '',
    donorLocation: '',
    donationItems: '',
    message: ''
  });
  const [donationStatus, setDonationStatus] = useState('');
  const [donationError, setDonationError] = useState('');
  const [requestDonations, setRequestDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [otherRequestsDonations, setOtherRequestsDonations] = useState({}); // { requestId: [donations] }

  const [form, setForm] = useState({
    name: '',
    contact: '',
    district: '',
    city: '',
    mapLink: '',
    description: ''
  });
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    organizer: '',
    contact: '',
    district: '',
    city: '',
    goal: '',
    link: '',
    description: ''
  });

  // Load existing requests
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, 'hopehub_requests'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        
        // Load donation counts for each request
        const requestsWithDonations = await Promise.all(
          data.map(async (req) => {
            try {
              const donationsQuery = query(
                collection(db, 'hopehub_donations'),
                where('requestId', '==', req.id)
              );
              const donationsSnap = await getDocs(donationsQuery);
              return { ...req, donationCount: donationsSnap.size };
            } catch {
              return { ...req, donationCount: 0 };
            }
          })
        );
        
        setRequests(requestsWithDonations);

        // Campaigns
        try {
          const cq = query(collection(db, 'hopehub_campaigns'), orderBy('createdAt', 'desc'));
          const csnap = await getDocs(cq);
          const cdata = csnap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setCampaigns(cdata);
        } catch (campaignErr) {
          console.error('Error loading campaigns', campaignErr);
        }
      } catch (err) {
        console.error('Error loading requests', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleFile = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setError('');
    setStatus('');

    // Validate files based on request type
    const allowedTypes = requestType === 'student' 
      ? ['image/jpeg', 'image/png', 'image/jpg']
      : ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setError(requestType === 'student' 
          ? 'Please upload only JPG, PNG, or JPEG images for student requests.'
          : 'Please upload only PDF or DOCX files for school/library requests.');
        return;
      }
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }
    }

    setProofFiles(files);
    setProofUrls([]);
    setProofUploadProgress({});
  };

  const removeProofFile = (index) => {
    setProofFiles((prev) => prev.filter((_, i) => i !== index));
    setProofUrls((prev) => prev.filter((_, i) => i !== index));
    const newProgress = { ...proofUploadProgress };
    delete newProgress[index];
    setProofUploadProgress(newProgress);
  };

  const addItem = () => {
    if (currentItem.trim()) {
      setItems((prev) => [...prev, currentItem.trim()]);
      setCurrentItem('');
    }
  };

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('');

    if (!form.name.trim() || !form.contact.trim() || !form.district || !form.city.trim() || !form.description.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!items.length) {
      setError('Please add at least one item needed.');
      return;
    }
    if (!proofFiles.length) {
      setError('Proof of disaster is required.');
      return;
    }

    try {
      setIsUploadingProof(true);
      setStatus('Uploading proof files...');

      // Upload all proof files to Cloudinary
      const uploadedUrls = [];
      const progressUpdates = {};

      for (let i = 0; i < proofFiles.length; i++) {
        const file = proofFiles[i];
        try {
          setStatus(`Uploading file ${i + 1} of ${proofFiles.length}...`);
          const result = await uploadFileToCloudinary(file, (progress) => {
            progressUpdates[i] = progress;
            setProofUploadProgress({ ...progressUpdates });
          });
          uploadedUrls.push(result.url);
          progressUpdates[i] = 100;
          setProofUploadProgress({ ...progressUpdates });
        } catch (uploadError) {
          console.error(`Error uploading file ${i + 1}:`, uploadError);
          throw new Error(`Failed to upload file "${file.name}": ${uploadError.message}`);
        }
      }

      setStatus('Saving request...');

      // Save to Firestore with Cloudinary URLs
      const payload = {
        requestType,
        name: form.name.trim(),
        contactNumber: form.contact.trim(),
        district: form.district,
        cityTown: form.city.trim(),
        mapLink: form.mapLink.trim() || null,
        items,
        description: form.description.trim(),
        proofFiles: uploadedUrls, // Store Cloudinary URLs
        status: 'open',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'hopehub_requests'), payload);
      
      // Optimistically update UI
      setRequests((prev) => [{ id: docRef.id, ...payload }, ...prev]);
      setStatus('Your request has been submitted successfully! Thank you for reaching out.');
      
      // Reset form
      setForm({ name: '', contact: '', district: '', city: '', mapLink: '', description: '' });
      setItems([]);
      setCurrentItem('');
      setProofFiles([]);
      setProofUrls([]);
      setProofUploadProgress({});
      setRequestType('student');
    } catch (err) {
      console.error('Error submitting request', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsUploadingProof(false);
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return requests.filter((r) => {
      const matchesDistrict = filterDistrict === 'all' || r.district === filterDistrict;
      const matchesSearch =
        !q ||
        r.name?.toLowerCase().includes(q) ||
        r.cityTown?.toLowerCase().includes(q) ||
        (r.items || []).some((item) => item.toLowerCase().includes(q));
      return matchesDistrict && matchesSearch;
    });
  }, [requests, searchQuery, filterDistrict]);

  // Other requests (excluding the one being donated to)
  const otherRequests = useMemo(() => {
    if (!donationDialog.request) return filtered.slice(0, 5);
    return filtered.filter((r) => r.id !== donationDialog.request.id).slice(0, 5);
  }, [filtered, donationDialog.request]);

  // Load donations for other requests when dialog opens
  useEffect(() => {
    if (!donationDialog.open || otherRequests.length === 0) {
      setOtherRequestsDonations({});
      return;
    }

    const loadDonationsForOthers = async () => {
      const donationsMap = {};
      await Promise.all(
        otherRequests.map(async (req) => {
          try {
            // Fetch without orderBy to avoid index requirement, then sort in JavaScript
            const donationsQuery = query(
              collection(db, 'hopehub_donations'),
              where('requestId', '==', req.id)
            );
            const donationsSnap = await getDocs(donationsQuery);
            const donations = donationsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
            // Sort by createdAt descending in JavaScript
            donations.sort((a, b) => {
              const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
              const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
              return bTime - aTime;
            });
            donationsMap[req.id] = donations;
          } catch (err) {
            console.error(`Error loading donations for request ${req.id}:`, err);
            donationsMap[req.id] = [];
          }
        })
      );
      setOtherRequestsDonations(donationsMap);
    };

    loadDonationsForOthers();
  }, [donationDialog.open, otherRequests]);

  const handleDonateClick = async (request) => {
    setDonationDialog({ open: true, request });
    setDonationForm({
      donorName: '',
      donorContact: '',
      donorLocation: '',
      donationItems: '',
      message: ''
    });
    setDonationStatus('');
    setDonationError('');
    setRequestDonations([]);

    // Fetch donations for this request
    try {
      setLoadingDonations(true);
      // Fetch without orderBy to avoid index requirement, then sort in JavaScript
      const donationsQuery = query(
        collection(db, 'hopehub_donations'),
        where('requestId', '==', request.id)
      );
      const donationsSnap = await getDocs(donationsQuery);
      const donationsData = donationsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Sort by createdAt descending in JavaScript
      donationsData.sort((a, b) => {
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return bTime - aTime;
      });
      setRequestDonations(donationsData);
    } catch (err) {
      console.error('Error loading donations', err);
    } finally {
      setLoadingDonations(false);
    }
  };

  const handleDonationSubmit = async (e) => {
    e.preventDefault();
    setDonationError('');
    setDonationStatus('');

    if (!donationForm.donorName.trim() || !donationForm.donorContact.trim() || !donationForm.donationItems.trim()) {
      setDonationError('Please fill in your name, contact, and what you want to donate.');
      return;
    }

    try {
      const payload = {
        requestId: donationDialog.request.id,
        requestName: donationDialog.request.name,
        requestType: donationDialog.request.requestType,
        donorName: donationForm.donorName.trim(),
        donorContact: donationForm.donorContact.trim(),
        donorLocation: donationForm.donorLocation.trim() || null,
        donationItems: donationForm.donationItems.trim(),
        message: donationForm.message.trim() || null,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'hopehub_donations'), payload);
      
      // Add the new donation to the list immediately
      setRequestDonations((prev) => [{ id: docRef.id, ...payload }, ...prev]);
      
      setDonationStatus('Thank you! Your donation offer has been submitted. The requester will contact you soon.');
      setDonationForm({
        donorName: '',
        donorContact: '',
        donorLocation: '',
        donationItems: '',
        message: ''
      });
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        setDonationDialog({ open: false, request: null });
        setDonationStatus('');
        setRequestDonations([]);
      }, 3000);
    } catch (err) {
      console.error('Error submitting donation', err);
      setDonationError('Something went wrong. Please try again.');
    }
  };

  const mapEmbedUrl = useMemo(() => {
    const raw = form.mapLink?.trim();
    if (!raw) return '';

    const buildSearchEmbed = (q) => `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
    const buildCoordsEmbed = (lat, lng) => `https://www.google.com/maps?q=${lat},${lng}&ll=${lat},${lng}&z=14&output=embed`;

    try {
      const u = new URL(raw);

      // If already an embed URL, keep it
      if (u.pathname.includes('/maps/embed')) return raw;

       // Look for @lat,lng in path
      const atCoords = u.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (atCoords) {
        return buildCoordsEmbed(atCoords[1], atCoords[2]);
      }

      // Handle maps.app.goo.gl short links (cannot embed directly; use full URL as search)
      if (u.hostname.includes('maps.app.goo.gl') || u.hostname === 'goo.gl') {
        const code = u.pathname.replace(/\//g, '');
        // Try full short link string first, then fallback to path code
        return buildSearchEmbed(raw || code || 'Sri Lanka');
      }

      // Handle google.com/maps links with ?q= or ?query=
      if (u.hostname.includes('google') && u.searchParams.has('q')) {
        const qVal = u.searchParams.get('q');
        const coordMatch = qVal?.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
        if (coordMatch) return buildCoordsEmbed(coordMatch[1], coordMatch[2]);
        return buildSearchEmbed(u.searchParams.get('q'));
      }
      if (u.hostname.includes('google') && u.searchParams.has('query')) {
        const qVal = u.searchParams.get('query');
        const coordMatch = qVal?.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
        if (coordMatch) return buildCoordsEmbed(coordMatch[1], coordMatch[2]);
        return buildSearchEmbed(qVal);
      }

      // Handle /place/<name>/ paths
      if (u.hostname.includes('google') && u.pathname.includes('/place/')) {
        const place = u.pathname.split('/place/')[1]?.split('/')[0];
        if (place) return buildSearchEmbed(decodeURIComponent(place));
      }

      // Fallback: plain search
      return buildSearchEmbed(raw);
    } catch {
      return buildSearchEmbed(raw);
    }
  }, [form.mapLink]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalRequests = requests.length;
    const activeRequests = requests.filter((r) => r.status !== 'fulfilled').length;
    const totalDonations = requests.reduce((sum, r) => sum + (r.donationCount || 0), 0);
    return { totalRequests, activeRequests, totalDonations };
  }, [requests]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDark
          ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 25%, #fbbf24 50%, #10b981 75%, #059669 100%)'
          : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 25%, #facc15 50%, #059669 75%, #047857 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255,255,255,0.95)',
          zIndex: 0
        },
        '@keyframes gradientShift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: { xs: 4, sm: 6 } }}>
        {/* Beautiful Header */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              mb: 1,
              background: isDark
                ? 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 25%, #fbbf24 50%, #facc15 75%, #3b82f6 100%)'
                : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 25%, #facc15 50%, #fbbf24 75%, #2563eb 100%)',
              backgroundSize: '200% 200%',
              animation: 'gradientText 3s ease infinite',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: { xs: '2rem', sm: '3rem', md: '3.5rem' },
              letterSpacing: '-0.02em',
              '@keyframes gradientText': {
                '0%': { backgroundPosition: '0% 50%' },
                '50%': { backgroundPosition: '100% 50%' },
                '100%': { backgroundPosition: '0% 50%' }
              }
            }}
          >
            මේ ඔබේ උදව් අවශ්‍යම කාලයයි
          </Typography>
          
          {/* Banner Image */}
          <Box
            sx={{
              width: '100%',
              maxWidth: { xs: '100%', sm: '800px', md: '1000px' },
              mx: 'auto',
              mb: 3,
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: isDark
                ? '0 20px 60px rgba(0,0,0,0.5)'
                : '0 20px 60px rgba(0,0,0,0.2)',
              position: 'relative'
            }}
          >
            <Box
              component="img"
              src={bannerImage}
              alt="HopeHub - Connecting students in need with donors"
              sx={{
                width: '100%',
                height: { xs: '250px', sm: '350px', md: '450px' },
                objectFit: 'cover',
                display: 'block'
              }}
            />
          </Box>

          <Typography
            variant="h6"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              mb: 4
            }}
          >
            Connect with students in need. Donate directly. No middleman.
          </Typography>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 5, justifyContent: 'center' }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 4,
                  background: isDark
                    ? 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #fbbf24 100%)'
                    : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #facc15 100%)',
                  color: '#000000',
                  boxShadow: isDark
                    ? '0 10px 30px rgba(59,130,246,0.5)'
                    : '0 10px 30px rgba(37,99,235,0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: isDark
                      ? '0 15px 40px rgba(59,130,246,0.6)'
                      : '0 15px 40px rgba(37,99,235,0.5)'
                  }
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: '#000000' }}>
                  {stats.totalRequests}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#000000' }}>
                  TOTAL REQUESTS
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 4,
                  background: isDark
                    ? 'linear-gradient(135deg, #60a5fa 0%, #fbbf24 50%, #3b82f6 100%)'
                    : 'linear-gradient(135deg, #3b82f6 0%, #facc15 50%, #2563eb 100%)',
                  color: '#000000',
                  boxShadow: isDark
                    ? '0 10px 30px rgba(96,165,250,0.5)'
                    : '0 10px 30px rgba(59,130,246,0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: isDark
                      ? '0 15px 40px rgba(96,165,250,0.6)'
                      : '0 15px 40px rgba(59,130,246,0.5)'
                  }
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: '#000000' }}>
                  {stats.totalDonations}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#000000' }}>
                  DONATIONS PLEDGED
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 4,
                  background: isDark
                    ? 'linear-gradient(135deg, #fbbf24 0%, #60a5fa 50%, #3b82f6 100%)'
                    : 'linear-gradient(135deg, #facc15 0%, #3b82f6 50%, #2563eb 100%)',
                  color: '#000000',
                  boxShadow: isDark
                    ? '0 10px 30px rgba(251,191,36,0.5)'
                    : '0 10px 30px rgba(250,204,21,0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: isDark
                      ? '0 15px 40px rgba(251,191,36,0.6)'
                      : '0 15px 40px rgba(250,204,21,0.5)'
                  }
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: '#000000' }}>
                  {stats.activeRequests}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#000000' }}>
                  ACTIVE NEEDS
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Submit Request Form */}
        <Paper
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: 4,
            mb: 5,
            boxShadow: isDark
              ? '0 20px 60px rgba(0,0,0,0.5)'
              : '0 20px 60px rgba(0,0,0,0.1)',
            background: theme.palette.background.paper,
            border: isDark
              ? '1px solid rgba(59,130,246,0.2)'
              : '1px solid rgba(37,99,235,0.1)'
          }}
        >
          <Stack spacing={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  mb: 1,
              background: isDark
                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: { xs: '1.75rem', sm: '2.25rem' }
                }}
              >
                Submit Your Hope Request
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                ඔබේ ඉල්ලීම අපට සන්නිවේදනය කරන්න
              </Typography>
            </Box>

            {/* Beautiful Tabs */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexDirection: { xs: 'column', sm: 'row' },
                mb: 2,
                p: 1,
                borderRadius: 3,
                bgcolor: isDark ? theme.palette.grey[900] : '#f8fafc',
                border: isDark
                  ? '1px solid rgba(59,130,246,0.2)'
                  : '1px solid rgba(37,99,235,0.1)'
              }}
            >
              {[
                { key: 'student', label: 'Student', sub: 'ශිෂ්‍ය', icon: <PersonIcon />, color: '#2563eb' },
                { key: 'school', label: 'School', sub: 'පාසල්', icon: <SchoolIcon />, color: '#3b82f6' },
                { key: 'library', label: 'Library', sub: 'පොත්ගාර', icon: <LibraryIcon />, color: '#60a5fa' }
              ].map((tab) => {
                const active = requestType === tab.key;
                return (
                  <Button
                    key={tab.key}
                    onClick={() => setRequestType(tab.key)}
                    startIcon={tab.icon}
                    sx={{
                      flex: 1,
                      textTransform: 'none',
                      fontWeight: 700,
                      py: 2,
                      borderRadius: 2,
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      ...(active
                        ? {
                            background: `linear-gradient(135deg, ${tab.color} 0%, ${tab.color}dd 100%)`,
                            color: 'white',
                            boxShadow: `0 8px 20px ${tab.color}40`,
                            transform: 'scale(1.02)'
                          }
                        : {
                            bgcolor: theme.palette.background.paper,
                            color: theme.palette.text.secondary,
                            border: isDark
                              ? '1px solid rgba(255,255,255,0.1)'
                              : '1px solid rgba(0,0,0,0.08)',
                            '&:hover': {
                              bgcolor: theme.palette.background.paper,
                              borderColor: tab.color,
                              color: tab.color,
                              transform: 'translateY(-2px)',
                              boxShadow: `0 4px 12px ${tab.color}20`
                            }
                          })
                    }}
                  >
                    <Box sx={{ textAlign: 'left', flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        {tab.label}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                        {tab.sub}
                      </Typography>
                    </Box>
                  </Button>
                );
              })}
            </Box>

            {/* Beautiful Form */}
            <Grid container spacing={3} component="form" onSubmit={handleSubmit}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={
                    requestType === 'student'
                      ? 'STUDENT NAME ශිෂ්‍ය නම'
                      : requestType === 'school'
                      ? 'SCHOOL NAME පාසලේ නම'
                      : 'LIBRARY NAME පුස්තකාල නම'
                  }
                  placeholder="e.g. Amantha Perera"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          bgcolor: theme.palette.background.paper,
                          '&:hover': {
                            boxShadow: isDark
                              ? '0 4px 12px rgba(59,130,246,0.2)'
                              : '0 4px 12px rgba(37,99,235,0.15)'
                          },
                          '&.Mui-focused': {
                            boxShadow: isDark
                              ? '0 4px 12px rgba(59,130,246,0.3)'
                              : '0 4px 12px rgba(37,99,235,0.25)'
                          }
                        }
                      }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="CONTACT NUMBER දුරකථන අංකය"
                  placeholder="07XXXXXXX"
                  value={form.contact}
                  onChange={(e) => setForm((p) => ({ ...p, contact: e.target.value }))}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          bgcolor: theme.palette.background.paper,
                          '&:hover': {
                            boxShadow: isDark
                              ? '0 4px 12px rgba(59,130,246,0.2)'
                              : '0 4px 12px rgba(37,99,235,0.15)'
                          },
                          '&.Mui-focused': {
                            boxShadow: isDark
                              ? '0 4px 12px rgba(59,130,246,0.3)'
                              : '0 4px 12px rgba(37,99,235,0.25)'
                          }
                        }
                      }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="DISTRICT දිස්ත්‍රික්කය"
                  value={form.district}
                  onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          bgcolor: theme.palette.background.paper,
                          '&:hover': {
                            boxShadow: isDark
                              ? '0 4px 12px rgba(59,130,246,0.2)'
                              : '0 4px 12px rgba(37,99,235,0.15)'
                          },
                          '&.Mui-focused': {
                            boxShadow: isDark
                              ? '0 4px 12px rgba(59,130,246,0.3)'
                              : '0 4px 12px rgba(37,99,235,0.25)'
                          }
                        }
                      }}
                >
                  <MenuItem value="">
                    <em>Select / තෝරන්න</em>
                  </MenuItem>
                  {districtsList.map((d) => (
                    <MenuItem key={d} value={d}>
                      {d}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="CITY / TOWN නගරය / ප්‍රදේශය"
                  placeholder="e.g. Kadawatha"
                  value={form.city}
                  onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          bgcolor: theme.palette.background.paper,
                          '&:hover': {
                            boxShadow: isDark
                              ? '0 4px 12px rgba(59,130,246,0.2)'
                              : '0 4px 12px rgba(37,99,235,0.15)'
                          },
                          '&.Mui-focused': {
                            boxShadow: isDark
                              ? '0 4px 12px rgba(59,130,246,0.3)'
                              : '0 4px 12px rgba(37,99,235,0.25)'
                          }
                        }
                      }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                  <Paper
                  sx={{
                    p: 3,
                    borderRadius: 3,
                            border: isDark
                              ? '1px solid rgba(59,130,246,0.2)'
                              : '1px solid rgba(37,99,235,0.1)',
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' },
                    gap: 2,
                    alignItems: 'stretch',
                    bgcolor: isDark ? theme.palette.grey[900] : '#f8fafc',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                            boxShadow: isDark
                              ? '0 8px 24px rgba(59,130,246,0.15)'
                              : '0 8px 24px rgba(37,99,235,0.1)'
                    }
                  }}
                >
                  <Box>
                    <TextField
                      fullWidth
                      label="LOCATION MAP ස්ථානය (විකල්පයි)"
                      placeholder="Paste Google Maps Link"
                      value={form.mapLink}
                      onChange={(e) => setForm((p) => ({ ...p, mapLink: e.target.value }))}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LinkIcon sx={{ color: isDark ? '#818cf8' : '#667eea' }} />
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: theme.palette.background.paper,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: isDark
                              ? '0 4px 12px rgba(59,130,246,0.2)'
                              : '0 4px 12px rgba(37,99,235,0.15)'
                          },
                          '&.Mui-focused': {
                            boxShadow: isDark
                              ? '0 4px 12px rgba(59,130,246,0.3)'
                              : '0 4px 12px rgba(37,99,235,0.25)'
                          }
                        }
                      }}
                    />
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 1, display: 'block', fontWeight: 500 }}>
                      Link helps donors find you. පිහිටුම සොයීමට ලින්ක් එක උපකාරී වේ.
                    </Typography>
                  </Box>
                  <Paper
                    sx={{
                      border: isDark
                        ? '2px solid rgba(129,140,248,0.3)'
                        : '2px solid rgba(102,126,234,0.2)',
                      bgcolor: theme.palette.background.paper,
                      minHeight: { xs: 220, sm: 260 },
                      borderRadius: 3,
                      overflow: 'hidden',
                      boxShadow: isDark
                        ? '0 4px 12px rgba(0,0,0,0.3)'
                        : '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                  >
                    {mapEmbedUrl ? (
                      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                        <Box
                          component="iframe"
                          title="Location preview"
                          src={mapEmbedUrl}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          allowFullScreen
                          sx={{
                            width: '100%',
                            height: '100%',
                            border: '0',
                            display: 'block'
                          }}
                        />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: 'grid',
                          placeItems: 'center',
                          height: '100%',
                          color: theme.palette.text.secondary,
                          fontWeight: 600,
                          px: 2,
                          textAlign: 'center',
                          bgcolor: isDark ? theme.palette.grey[900] : '#f8fafc'
                        }}
                      >
                        <LocationIcon sx={{ fontSize: 48, color: isDark ? '#818cf8' : '#667eea', mb: 1, opacity: 0.5 }} />
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Paste a Google Maps link to preview location
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 3,
                            border: isDark
                              ? '1px solid rgba(59,130,246,0.2)'
                              : '1px solid rgba(37,99,235,0.1)',
                    bgcolor: isDark ? theme.palette.grey[900] : '#f8fafc',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                            boxShadow: isDark
                              ? '0 8px 24px rgba(59,130,246,0.15)'
                              : '0 8px 24px rgba(37,99,235,0.1)'
                    }
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      color: theme.palette.text.primary,
                      fontSize: '1.1rem'
                    }}
                  >
                    ITEMS NEEDED අවශ්‍ය වස්තු
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      fullWidth
                      placeholder="Type item & Press Enter (e.g. Books)"
                      value={currentItem}
                      onChange={(e) => setCurrentItem(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addItem();
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: theme.palette.background.paper,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: isDark
                              ? '0 4px 12px rgba(59,130,246,0.2)'
                              : '0 4px 12px rgba(37,99,235,0.15)'
                          },
                          '&.Mui-focused': {
                            boxShadow: isDark
                              ? '0 4px 12px rgba(59,130,246,0.3)'
                              : '0 4px 12px rgba(37,99,235,0.25)'
                          }
                        }
                      }}
                    />
                    <IconButton
                      onClick={addItem}
                      sx={{
                        bgcolor: isDark ? '#3b82f6' : '#2563eb',
                        color: 'white',
                        width: 48,
                        height: 48,
                        '&:hover': {
                          bgcolor: isDark ? '#2563eb' : '#1d4ed8',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Stack>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                    {items.map((item, idx) => (
                      <Chip
                        key={idx}
                        label={item}
                        onDelete={() => removeItem(idx)}
                        sx={{
                          bgcolor: theme.palette.background.paper,
                          color: isDark ? '#3b82f6' : '#2563eb',
                          border: `1px solid ${isDark ? '#818cf8' : '#667eea'}`,
                          fontWeight: 600,
                          '& .MuiChip-deleteIcon': {
                            color: isDark ? '#3b82f6' : '#2563eb',
                            '&:hover': { color: isDark ? '#6366f1' : '#5568d3' }
                          }
                        }}
                      />
                    ))}
                  </Box>
                  {items.length === 0 && (
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 1, display: 'block', fontStyle: 'italic' }}>
                      Press Enter to add item
                    </Typography>
                  )}
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  label="DESCRIPTION / STORY විස්තර / කතාව"
                  placeholder="Describe the situation... (අපට කියා දෙන්න)"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          bgcolor: theme.palette.background.paper,
                          '&:hover': {
                            boxShadow: isDark
                              ? '0 4px 12px rgba(59,130,246,0.2)'
                              : '0 4px 12px rgba(37,99,235,0.15)'
                          },
                          '&.Mui-focused': {
                            boxShadow: isDark
                              ? '0 4px 12px rgba(59,130,246,0.3)'
                              : '0 4px 12px rgba(37,99,235,0.25)'
                          }
                        }
                      }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: isDark
                      ? '2px solid rgba(251,191,36,0.3)'
                      : '2px solid rgba(250,204,21,0.3)',
                    bgcolor: isDark
                      ? 'linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(245,158,11,0.1) 100%)'
                      : 'linear-gradient(135deg, rgba(250,204,21,0.08) 0%, rgba(234,179,8,0.08) 100%)',
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(245,158,11,0.08) 100%)'
                      : 'linear-gradient(135deg, rgba(250,204,21,0.08) 0%, rgba(234,179,8,0.08) 100%)',
                    minHeight: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: isDark ? 'rgba(244,114,182,0.5)' : 'rgba(240,147,251,0.5)',
                      boxShadow: isDark
                        ? '0 8px 24px rgba(251,191,36,0.3)'
                        : '0 8px 24px rgba(250,204,21,0.2)'
                    }
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      color: isDark ? '#fbbf24' : '#facc15',
                      mb: 1,
                      fontSize: '1.1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <UploadIcon /> Proof of Disaster (අවශ්‍ය)
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2, fontWeight: 500 }}>
                    {requestType === 'student'
                      ? 'Upload disaster impact photos (JPG/PNG/JPEG only).'
                      : 'Upload signed school/library letter (PDF or DOCX only).'}
                  </Typography>
                  
                  {/* File previews */}
                  {proofFiles.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Stack spacing={1}>
                        {proofFiles.map((file, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              p: 1,
                              border: '1px solid rgba(0,0,0,0.1)',
                              borderRadius: 1,
                              bgcolor: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 1
                            }}
                          >
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {file.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                                {(file.size / 1024).toFixed(1)} KB
                              </Typography>
                              {proofUploadProgress[idx] !== undefined && (
                                <LinearProgress
                                  variant="determinate"
                                  value={proofUploadProgress[idx] || 0}
                                  sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                                />
                              )}
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => removeProofFile(idx)}
                              sx={{ color: 'error.main' }}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadIcon />}
                    disabled={isUploadingProof}
                    sx={{
                      textTransform: 'none',
                      width: '100%',
                      py: 1.5,
                      borderRadius: 2,
                      borderColor: isDark ? '#f472b6' : '#f093fb',
                      color: isDark ? '#fbbf24' : '#facc15',
                      fontWeight: 600,
                      bgcolor: theme.palette.background.paper,
                      '&:hover': {
                        borderColor: isDark ? '#f59e0b' : '#eab308',
                        bgcolor: isDark ? 'rgba(251,191,36,0.1)' : 'rgba(250,204,21,0.05)',
                        transform: 'translateY(-2px)',
                        boxShadow: isDark
                          ? '0 4px 12px rgba(251,191,36,0.4)'
                          : '0 4px 12px rgba(250,204,21,0.3)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {proofFiles.length ? 'Add More Files' : 'Select Files'}
                    <input
                      type="file"
                      hidden
                      multiple
                      accept={requestType === 'student' ? 'image/jpeg,image/png,image/jpg' : 'application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'}
                      onChange={handleFile}
                    />
                  </Button>
                  {proofFiles.length > 0 && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block', textAlign: 'center' }}>
                      {proofFiles.length} file(s) ready to upload
                    </Typography>
                  )}
                </Paper>
              </Grid>

              {error && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" sx={{ color: theme.palette.error.main, fontWeight: 600 }}>
                    {error}
                  </Typography>
                </Grid>
              )}
              {status && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                    {status}
                  </Typography>
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={!proofFiles.length || loading || isUploadingProof}
                  sx={{
                    py: 1.4,
                    textTransform: 'none',
                    fontWeight: 800,
                    bgcolor: proofFiles.length && !isUploadingProof ? '#0ea5e9' : 'rgba(148,163,184,0.6)'
                  }}
                >
                  {isUploadingProof ? 'Uploading...' : 'Submit Request'}
                </Button>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', display: 'block', textAlign: 'center', mt: 0.5 }}
                >
                  ඉල්ලීම സമර්ප කරන්න
                </Typography>
              </Grid>
            </Grid>
          </Stack>
        </Paper>

        {/* Beautiful Board Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              mb: 1,
              background: isDark
                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: { xs: '1.75rem', sm: '2.25rem' }
            }}
          >
            Hope Request Board
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
            Find requests and help those in need
          </Typography>
        </Box>

        {/* Search and Filter */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mb: 4, alignItems: 'stretch' }}
        >
          <TextField
            fullWidth
            placeholder="Search by name, location, or items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: isDark ? '#818cf8' : '#667eea' }} />
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: theme.palette.background.paper,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: isDark
                    ? '0 4px 12px rgba(129,140,248,0.2)'
                    : '0 4px 12px rgba(102,126,234,0.15)'
                },
                '&.Mui-focused': {
                  boxShadow: isDark
                    ? '0 4px 12px rgba(129,140,248,0.3)'
                    : '0 4px 12px rgba(102,126,234,0.25)'
                }
              }
            }}
          />
          <TextField
            select
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
            sx={{
              minWidth: { xs: '100%', sm: 200 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: theme.palette.background.paper,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: isDark
                    ? '0 4px 12px rgba(129,140,248,0.2)'
                    : '0 4px 12px rgba(102,126,234,0.15)'
                },
                '&.Mui-focused': {
                  boxShadow: isDark
                    ? '0 4px 12px rgba(129,140,248,0.3)'
                    : '0 4px 12px rgba(102,126,234,0.25)'
                }
              }
            }}
            label="All Districts"
          >
            <MenuItem value="all">All Districts</MenuItem>
            {districtsList.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <Grid container spacing={2}>
          {loading ? (
              <Grid size={{ xs: 12 }}>
              <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
                Loading requests...
              </Typography>
            </Grid>
          ) : filtered.length ? (
            filtered.map((req) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={req.id}>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: 'none',
                    bgcolor: theme.palette.background.paper,
                    boxShadow: isDark
                      ? '0 4px 12px rgba(0,0,0,0.5)'
                      : '0 4px 12px rgba(0,0,0,0.08)',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: isDark
                        ? '0 8px 24px rgba(0,0,0,0.7)'
                        : '0 8px 24px rgba(0,0,0,0.12)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  {/* Status Tags - Top Left */}
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <Chip
                      size="small"
                      label={req.requestType || 'student'}
                      sx={{
                        bgcolor: theme.palette.background.paper,
                        color: isDark ? '#3b82f6' : '#2563eb',
                        border: `1px solid ${isDark ? '#818cf8' : '#0ea5e9'}`,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 24,
                        borderRadius: '12px'
                      }}
                    />
                    {req.status === 'fulfilled' ? (
                      <Chip
                        size="small"
                        label="Fulfilled"
                        sx={{
                          bgcolor: theme.palette.background.paper,
                          color: theme.palette.success.main,
                          border: `1px solid ${theme.palette.success.main}`,
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 24,
                          borderRadius: '12px'
                        }}
                      />
                    ) : (
                      <Chip
                        size="small"
                        label="Active"
                        sx={{
                          bgcolor: theme.palette.background.paper,
                          color: theme.palette.success.main,
                          border: `1px solid ${theme.palette.success.main}`,
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 24,
                          borderRadius: '12px'
                        }}
                      />
                    )}
                  </Stack>

                  {/* Name */}
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 0.5,
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                      color: theme.palette.text.primary
                    }}
                  >
                    {req.name}
                  </Typography>

                  {/* Location */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      mb: 1.5,
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <LocationIcon sx={{ fontSize: 16 }} />
                    {req.cityTown}, {req.district}
                  </Typography>

                  {/* Donations Offered Badge */}
                  {req.donationCount > 0 && (
                    <Chip
                      label={`${req.donationCount} donation${req.donationCount > 1 ? 's' : ''} offered`}
                      sx={{
                        mb: 1.5,
                        bgcolor: isDark ? '#ec4899' : '#ec4899',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        height: 28,
                        borderRadius: '14px',
                        px: 1
                      }}
                    />
                  )}

                  {/* Needs Support For */}
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      display: 'block',
                      mb: 0.75,
                      color: theme.palette.text.primary,
                      fontSize: '0.875rem'
                    }}
                  >
                    Needs Support For:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                    {(req.items || []).map((item, idx) => (
                      <Chip
                        key={idx}
                        label={item}
                        size="small"
                        sx={{
                          bgcolor: isDark ? theme.palette.grey[800] : '#f1f5f9',
                          color: theme.palette.text.secondary,
                          fontSize: '0.75rem',
                          height: 24,
                          borderRadius: '12px'
                        }}
                      />
                    ))}
                  </Box>

                  {/* Description/Quote */}
                  {req.description && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontStyle: 'italic',
                        mb: 2,
                        fontSize: '0.875rem',
                        lineHeight: 1.5
                      }}
                    >
                      "{req.description}"
                    </Typography>
                  )}

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                    {/* HopeSpot Location Button */}
                    {req.mapLink && (
                      <Button
                        size="medium"
                        variant="outlined"
                        startIcon={<LocationIcon />}
                        href={req.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        fullWidth
                        sx={{
                          textTransform: 'none',
                          borderRadius: '20px',
                          borderColor: isDark ? '#3b82f6' : '#2563eb',
                          color: isDark ? '#3b82f6' : '#2563eb',
                          fontWeight: 600,
                          py: 1,
                          bgcolor: 'transparent',
                          '&:hover': {
                            borderColor: isDark ? '#2563eb' : '#1d4ed8',
                            bgcolor: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(37,99,235,0.05)'
                          }
                        }}
                      >
                        HopeSpot Location
                      </Button>
                    )}

                    {/* Bottom Row: View Proof, Contact, Donate */}
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'stretch', flexWrap: 'wrap' }}>
                      {/* View Proof Button - With Text */}
                      {req.proofFiles && req.proofFiles.length > 0 && (
                        <Button
                          size="medium"
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => setViewProofDialog({ open: true, urls: req.proofFiles, name: req.name })}
                          sx={{
                            flex: { xs: '1 1 100%', sm: '1 1 auto' },
                            textTransform: 'none',
                            borderRadius: '20px',
                            borderColor: isDark ? '#3b82f6' : '#2563eb',
                            color: isDark ? '#3b82f6' : '#2563eb',
                            fontWeight: 600,
                            py: 1,
                            minWidth: { xs: '100%', sm: 140 },
                            bgcolor: 'transparent',
                            '&:hover': {
                              borderColor: isDark ? '#2563eb' : '#1d4ed8',
                              bgcolor: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(37,99,235,0.05)'
                            }
                          }}
                        >
                          View Proof ({req.proofFiles.length})
                        </Button>
                      )}

                      {/* Contact Button - WhatsApp */}
                      <Button
                        size="medium"
                        variant="outlined"
                        startIcon={<WhatsAppIcon />}
                        href={`https://wa.me/${req.contactNumber?.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          flex: { xs: '1 1 100%', sm: 1 },
                          textTransform: 'none',
                          borderRadius: '20px',
                          borderColor: '#25D366',
                          color: '#25D366',
                          fontWeight: 600,
                          py: 1,
                          minWidth: { xs: '100%', sm: 120 },
                          '&:hover': {
                            borderColor: '#20BA5A',
                            bgcolor: 'rgba(37,211,102,0.05)'
                          }
                        }}
                      >
                        Contact
                      </Button>

                      {/* Donate Button - With Text and Icon */}
                      <Button
                        size="medium"
                        variant="contained"
                        startIcon={<FavoriteIcon />}
                        onClick={() => handleDonateClick(req)}
                        sx={{
                          flex: { xs: '1 1 100%', sm: '1 1 auto' },
                          textTransform: 'none',
                          borderRadius: '20px',
                          bgcolor: '#ec4899',
                          color: 'white',
                          fontWeight: 700,
                          py: 1,
                          px: 2,
                          boxShadow: '0 4px 12px rgba(236,72,153,0.4)',
                          minWidth: { xs: '100%', sm: 140 },
                          '&:hover': {
                            bgcolor: '#db2777',
                            boxShadow: '0 6px 16px rgba(236,72,153,0.5)',
                            transform: 'translateY(-1px)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Donate
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))
          ) : (
              <Grid size={{ xs: 12 }}>
              <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
                No requests found.
              </Typography>
            </Grid>
          )}
        </Grid>

        {/* View Proof Dialog */}
        <Dialog
          open={viewProofDialog.open}
          onClose={() => setViewProofDialog({ open: false, urls: [], name: '' })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Proof of Disaster - {viewProofDialog.name}</Typography>
              <IconButton onClick={() => setViewProofDialog({ open: false, urls: [], name: '' })}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              {viewProofDialog.urls.map((url, idx) => (
                <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                  <Paper
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '1px solid rgba(0,0,0,0.1)'
                    }}
                  >
                    {url.match(/\.(pdf|doc|docx)$/i) ? (
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Document {idx + 1}
                        </Typography>
                        <Button
                          variant="outlined"
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ textTransform: 'none' }}
                        >
                          Open Document
                        </Button>
                      </Box>
                    ) : (
                      <Box
                        component="img"
                        src={url}
                        alt={`Proof ${idx + 1}`}
                        sx={{
                          width: '100%',
                          height: 'auto',
                          display: 'block',
                          borderRadius: 1
                        }}
                      />
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
        </Dialog>

        {/* Donation Dialog */}
        <Dialog
          open={donationDialog.open}
          onClose={() => setDonationDialog({ open: false, request: null })}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              height: { xs: '90vh', md: '85vh' },
              maxHeight: { xs: '90vh', md: '85vh' }
            }
          }}
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Donate to {donationDialog.request?.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  {donationDialog.request?.cityTown}, {donationDialog.request?.district}
                </Typography>
              </Box>
              <IconButton onClick={() => setDonationDialog({ open: false, request: null })}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <Grid container sx={{ height: '100%' }}>
              {/* Left Side - Donation Form */}
              <Grid size={{ xs: 12, md: 7 }} sx={{ p: 3, borderRight: { md: '1px solid rgba(0,0,0,0.1)' } }}>
                <Box component="form" onSubmit={handleDonationSubmit}>
                  <Stack spacing={2}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      What can you donate?
                    </Typography>
                    
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      They need: <strong>{(donationDialog.request?.items || []).join(', ')}</strong>
                    </Typography>

                    <TextField
                      fullWidth
                      label="Your Name"
                      placeholder="Enter your name"
                      value={donationForm.donorName}
                      onChange={(e) => setDonationForm((p) => ({ ...p, donorName: e.target.value }))}
                      required
                    />

                    <TextField
                      fullWidth
                      label="Contact Number"
                      placeholder="07XXXXXXX"
                      value={donationForm.donorContact}
                      onChange={(e) => setDonationForm((p) => ({ ...p, donorContact: e.target.value }))}
                      required
                    />

                    <TextField
                      fullWidth
                      label="Your Location (Optional)"
                      placeholder="e.g. Colombo"
                      value={donationForm.donorLocation}
                      onChange={(e) => setDonationForm((p) => ({ ...p, donorLocation: e.target.value }))}
                    />

                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      label="What you want to donate"
                      placeholder="e.g. 5 Books, 2 Notebooks, School supplies"
                      value={donationForm.donationItems}
                      onChange={(e) => setDonationForm((p) => ({ ...p, donationItems: e.target.value }))}
                      required
                      helperText="List the items you can donate to help this request"
                    />

                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      label="Message (Optional)"
                      placeholder="Add a message or note..."
                      value={donationForm.message}
                      onChange={(e) => setDonationForm((p) => ({ ...p, message: e.target.value }))}
                    />

                    {donationError && (
                      <Typography variant="body2" sx={{ color: '#b91c1c', fontWeight: 600 }}>
                        {donationError}
                      </Typography>
                    )}

                    {donationStatus && (
                      <Typography variant="body2" sx={{ color: '#16a34a', fontWeight: 600 }}>
                        {donationStatus}
                      </Typography>
                    )}

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      startIcon={<SendIcon />}
                      sx={{
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 700,
                        bgcolor: '#ec4899',
                        '&:hover': { bgcolor: '#db2777' }
                      }}
                    >
                      Submit Donation Offer
                    </Button>
                  </Stack>
                </Box>

              </Grid>

              {/* Right Side - Donations Offered Sidebar */}
              <Grid 
                size={{ xs: 12, md: 5 }} 
                sx={{ 
                  p: 2, 
                  bgcolor: isDark ? 'rgba(30,41,59,0.8)' : 'rgba(248,250,252,0.5)', 
                  borderRadius: 2,
                  border: isDark ? `1px solid rgba(59,130,246,0.2)` : `1px solid rgba(236,72,153,0.1)`,
                  overflowY: 'auto', 
                  maxHeight: { xs: 'none', md: '100%' } 
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 2, 
                    color: isDark ? '#60a5fa' : '#ec4899' 
                  }}
                >
                  Donations Offered ({requestDonations.length})
                </Typography>
                <Stack spacing={2}>
                  {loadingDonations ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
                      Loading donations...
                    </Typography>
                  ) : requestDonations.length > 0 ? (
                    requestDonations.map((donation) => (
                      <Paper
                        key={donation.id}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: isDark 
                            ? '1px solid rgba(59,130,246,0.3)' 
                            : '1px solid rgba(236,72,153,0.2)',
                          bgcolor: isDark ? theme.palette.grey[800] : 'white',
                          boxShadow: isDark
                            ? '0 2px 8px rgba(0,0,0,0.4)'
                            : '0 2px 8px rgba(236,72,153,0.1)',
                          transition: 'all 0.2s',
                          '&:hover': {
                            boxShadow: isDark
                              ? '0 4px 12px rgba(59,130,246,0.3)'
                              : '0 4px 12px rgba(236,72,153,0.2)',
                            transform: 'translateY(-2px)',
                            borderColor: isDark ? 'rgba(59,130,246,0.5)' : 'rgba(236,72,153,0.4)'
                          }
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <Chip
                            size="small"
                            label={donation.status || 'pending'}
                            color={donation.status === 'fulfilled' ? 'success' : 'default'}
                            sx={{ 
                              fontSize: '0.7rem',
                              bgcolor: isDark ? theme.palette.grey[700] : undefined
                            }}
                          />
                          {donation.createdAt && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', ml: 'auto', fontSize: '0.7rem' }}>
                              {donation.createdAt.toDate ? new Date(donation.createdAt.toDate()).toLocaleDateString() : 'Recently'}
                            </Typography>
                          )}
                        </Stack>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 700, 
                            mb: 0.5, 
                            color: isDark ? '#60a5fa' : '#ec4899' 
                          }}
                        >
                          {donation.donorName}
                        </Typography>
                        {donation.donorLocation && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                            <LocationIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                            {donation.donorLocation}
                          </Typography>
                        )}
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600, 
                            mb: 0.5, 
                            color: isDark ? '#60a5fa' : '#ec4899', 
                            fontSize: '0.85rem' 
                          }}
                        >
                          Donating: {donation.donationItems}
                        </Typography>
                        {donation.message && (
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', mt: 1, fontSize: '0.8rem' }}>
                            "{donation.message}"
                          </Typography>
                        )}
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<WhatsAppIcon />}
                          href={`https://wa.me/${donation.donorContact?.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          fullWidth
                          sx={{
                            textTransform: 'none',
                            mt: 1.5,
                            borderColor: '#25D366',
                            color: '#25D366',
                            bgcolor: isDark ? 'rgba(37,211,102,0.1)' : 'transparent',
                            '&:hover': { 
                              borderColor: '#20BA5A', 
                              bgcolor: isDark ? 'rgba(37,211,102,0.2)' : 'rgba(37,211,102,0.1)' 
                            }
                          }}
                        >
                          Contact Donor
                        </Button>
                      </Paper>
                    ))
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <FavoriteIcon sx={{ fontSize: 48, color: isDark ? 'rgba(96,165,250,0.3)' : 'rgba(236,72,153,0.3)', mb: 1 }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                        No donations yet.
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Be the first to help this request!
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
}

