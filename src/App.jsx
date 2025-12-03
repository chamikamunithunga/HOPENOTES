import React, { useState, useMemo, useEffect } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  TextField
} from '@mui/material';
import { Navbar } from './components/Navbar.jsx';
import { Hero } from './components/Hero.jsx';
import { NotesGrid } from './components/NotesGrid.jsx';
import { UploadForm } from './components/UploadForm.jsx';
import { WhatsappGroups } from './components/WhatsappGroups.jsx';
import { UniversityGroups } from './components/UniversityGroups.jsx';
import { TelegramGroups } from './components/TelegramGroups.jsx';
import { WhatsappChannels } from './components/WhatsappChannels.jsx';
import { YoutubeChannels } from './components/YoutubeChannels.jsx';
import { EducationWebsites } from './components/EducationWebsites.jsx';
import { Feedback } from './components/Feedback.jsx';
import { ScrollToTop } from './components/ScrollToTop.jsx';
import { getAppTheme } from './theme.js';
import { fetchDriveLinks } from './services/driveLinks.js';
import { fetchOneDriveLinks } from './services/oneDriveLinks.js';
import { fetchWhatsappGroups } from './services/whatsappGroups.js';
import { fetchUniversityGroups } from './services/universityGroups.js';
import { fetchTelegramGroups } from './services/telegramGroups.js';
import { fetchWhatsappChannels } from './services/whatsappChannels.js';
import { fetchYoutubeChannels } from './services/youtubeChannels.js';
import { fetchEducationWebsites } from './services/educationWebsites.js';
import { fetchFileUploads } from './services/fileUploads.js';
import { fetchNews, addNewsItem } from './services/news.js';
import footerLogoImage from './images/Gemini_Generated_Image_d5zif3d5zif3d5zi.png';
import newsBackgroundImage from './images/Gemini_Generated_Image_y686jby686jby686.png';
import { uploadFileToCloudinary } from './utils/cloudinaryUpload.js';

export default function App() {
  const [mode, setMode] = useState('light');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [forceRefresh, setForceRefresh] = useState(0);
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [stats, setStats] = useState({
    notes: 0,
    whatsapp: 0,
    university: 0
  });
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#top');
  const [newsItems, setNewsItems] = useState([]);
  const [newsForm, setNewsForm] = useState({
    title: '',
    description: '',
    secretCode: ''
  });
  const [newsImageFile, setNewsImageFile] = useState(null);
  const [newsUploadProgress, setNewsUploadProgress] = useState(0);
  const [newsSubmitting, setNewsSubmitting] = useState(false);
  const [newsError, setNewsError] = useState('');
  const [newsStatus, setNewsStatus] = useState('');
  const [dataCache, setDataCache] = useState(null);
  const [cacheTimestamp, setCacheTimestamp] = useState(0);
  const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours cache
  const CACHE_KEY = 'hopenotes-cache-v1';
  const [whatsappGroupsData, setWhatsappGroupsData] = useState([]);
  const [universityGroupsData, setUniversityGroupsData] = useState([]);
  const [telegramGroupsData, setTelegramGroupsData] = useState([]);
  const [whatsappChannelsData, setWhatsappChannelsData] = useState([]);
  const [youtubeChannelsData, setYoutubeChannelsData] = useState([]);
  const [educationWebsitesData, setEducationWebsitesData] = useState([]);

  // Memoize arrays to prevent unnecessary re-renders in child components
  const whatsappGroups = useMemo(() => whatsappGroupsData, [whatsappGroupsData]);
  const universityGroups = useMemo(() => universityGroupsData, [universityGroupsData]);
  const telegramGroups = useMemo(() => telegramGroupsData, [telegramGroupsData]);
  const whatsappChannels = useMemo(() => whatsappChannelsData, [whatsappChannelsData]);
  const youtubeChannels = useMemo(() => youtubeChannelsData, [youtubeChannelsData]);
  const educationWebsites = useMemo(() => educationWebsitesData, [educationWebsitesData]);

  const theme = useMemo(() => getAppTheme(mode), [mode]);

  useEffect(() => {
    document.body.dataset.theme = mode;
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Track which hash (section) is active so we can show HN News as a separate view
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#top');
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initialize on first render in case user lands directly on /#hn-news
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Process data function to avoid duplication
  const processData = (links, oneDriveLinks, whatsapp, uni, telegram, whatsappChannels, youtube, websites, fileUploads, news) => {
    // Map Google Drive docs
        const driveNotes = links.map((link) => ({
          id: link.id,
          subject: link.description || 'Google Drive resource',
          grade: link.grade || link.year || '',
          medium: link.medium || '',
          curriculum: 'Google Drive',
          title: link.description || 'Shared resource',
          region: '',
          url: link.url,
          level: link.level || 'school',
          universityName: link.universityName || '',
          type: 'drive',
          provider: 'google'
        }));

        // Map OneDrive docs
        const oneDriveNotes = oneDriveLinks.map((link) => ({
          id: link.id,
          subject: link.description || 'OneDrive resource',
          grade: link.grade || link.year || '',
          medium: link.medium || '',
          curriculum: 'OneDrive',
          title: link.description || 'Shared resource',
          region: '',
          url: link.url,
          level: link.level || 'school',
          universityName: link.universityName || '',
          type: 'drive',
          provider: 'onedrive'
        }));

        // Map telegram groups
        const telegramNotes = telegram.map((group) => ({
          id: group.id,
          subject: group.subject || 'Telegram Group',
          grade: group.level === 'university' ? group.year || '' : group.grade || '',
          medium: group.medium || '',
          curriculum: 'Telegram Group',
          title: group.subject || 'Telegram Study Group',
          region: '',
          url: group.url,
          level: group.level || 'school',
          universityName: group.universityName || '',
          type: 'telegram',
          description: group.description || ''
        }));

        // Map WhatsApp Channels
        const whatsappChannelNotes = whatsappChannels.map((channel) => ({
          id: channel.id,
          subject: channel.subject || 'WhatsApp Channel',
          grade: channel.level === 'university' ? channel.year || '' : channel.grade || '',
          medium: channel.medium || '',
          curriculum: 'WhatsApp Channel',
          title: channel.subject || 'WhatsApp Channel',
          region: '',
          url: channel.url,
          level: channel.level || 'school',
          universityName: channel.universityName || '',
          type: 'whatsappChannel',
          description: channel.description || ''
        }));

        // Map YouTube Channels
        const youtubeNotes = youtube.map((channel) => ({
          id: channel.id,
          subject: channel.subject || 'YouTube Channel',
          grade: channel.level === 'university' ? channel.year || '' : channel.grade || '',
          medium: channel.medium || '',
          curriculum: 'YouTube Channel',
          title: channel.subject || 'YouTube Channel',
          region: '',
          url: channel.url,
          level: channel.level || 'school',
          universityName: channel.universityName || '',
          type: 'youtube',
          description: channel.description || ''
        }));

        // Map Education Websites
        const websiteNotes = websites.map((website) => ({
          id: website.id,
          subject: website.subject || 'Education Website',
          grade: website.level === 'university' ? website.year || '' : website.grade || '',
          medium: website.medium || '',
          curriculum: 'Education Website',
          title: website.subject || 'Education Website',
          region: '',
          url: website.url,
          level: website.level || 'school',
          universityName: website.universityName || '',
          type: 'website',
          description: website.description || ''
        }));

        // Map File Uploads
        const fileUploadNotes = fileUploads.map((file) => ({
          id: file.id,
          subject: file.subject || 'Uploaded File',
          grade: file.grade || '',
          medium: file.medium || '',
          curriculum: 'Uploaded File',
          title: file.subject || file.fileName || 'Uploaded File',
          region: '',
          url: file.url,
          level: 'school', // File uploads are currently school level only
          universityName: '',
          type: 'file',
          description: file.description || '',
          fileName: file.fileName || '',
          fileSize: file.fileSize || 0,
          fileType: file.fileType || ''
        }));

        console.log('=== DATA PROCESSING ===');
        console.log('Drive notes:', driveNotes.length);
        console.log('OneDrive notes:', oneDriveNotes.length);
        console.log('Telegram notes:', telegramNotes.length);
        console.log('WhatsApp Channel notes:', whatsappChannelNotes.length);
        console.log('YouTube notes:', youtubeNotes.length);
        console.log('Website notes:', websiteNotes.length);
        console.log('File uploads fetched:', fileUploads.length);
        console.log('File upload notes mapped:', fileUploadNotes.length);
        if (fileUploadNotes.length > 0) {
          console.log('Sample file upload note:', fileUploadNotes[0]);
        }

        // Combine all notes (Google Drive first, then OneDrive, then others)
        const allNotes = [
          ...driveNotes,
          ...oneDriveNotes,
          ...telegramNotes,
          ...whatsappChannelNotes,
          ...youtubeNotes,
          ...websiteNotes,
          ...fileUploadNotes
        ];
        console.log('=== TOTAL NOTES COMBINED ===');
        console.log('Total notes (including file uploads):', allNotes.length);
        console.log('Notes breakdown:', {
          drive: driveNotes.length,
          oneDrive: oneDriveNotes.length,
          telegram: telegramNotes.length,
          whatsappChannel: whatsappChannelNotes.length,
          youtube: youtubeNotes.length,
          website: websiteNotes.length,
          file: fileUploadNotes.length
        });
        if (allNotes.length > 0) {
          console.log('First 3 notes:', allNotes.slice(0, 3));
        }
        setNotes(allNotes);
        setNewsItems(news || []);

        setStats({
          notes: links.length + fileUploads.length,
          whatsapp: whatsapp.length,
          university: uni.length
        });
        // Store data for child components to prevent duplicate fetches
        // Only update if data actually changed (prevents unnecessary re-renders)
        setWhatsappGroupsData(whatsapp || []);
        setUniversityGroupsData(uni || []);
        setTelegramGroupsData(telegram || []);
        setWhatsappChannelsData(whatsappChannels || []);
        setYoutubeChannelsData(youtube || []);
        setEducationWebsitesData(websites || []);
      };

  useEffect(() => {
    const loadData = async () => {
      const now = Date.now();

      // 1) Try localStorage cache first
      try {
        if (!dataCache && typeof window !== 'undefined') {
          const cachedString = localStorage.getItem(CACHE_KEY);
          if (cachedString) {
            const cached = JSON.parse(cachedString);
            if (cached.timestamp && (now - cached.timestamp) < CACHE_DURATION) {
              console.log('Using localStorage cache');
              setDataCache(cached.data);
              const { links, oneDriveLinks, whatsapp, uni, telegram, whatsappChannels, youtube, websites, fileUploads, news } = cached.data;
              processData(links, oneDriveLinks, whatsapp, uni, telegram, whatsappChannels, youtube, websites, fileUploads, news);
              setLoadingNotes(false);
              return;
            }
          }
        }
      } catch (e) {
        console.warn('Failed to read localStorage cache:', e);
      }

      // 2) In‑memory cache
      if (dataCache && cacheTimestamp > 0 && (now - cacheTimestamp) < CACHE_DURATION) {
        console.log('Using in‑memory cache');
        const { links, oneDriveLinks, whatsapp, uni, telegram, whatsappChannels, youtube, websites, fileUploads, news } = dataCache;
        processData(links, oneDriveLinks, whatsapp, uni, telegram, whatsappChannels, youtube, websites, fileUploads, news);
        setLoadingNotes(false);
        return;
      }

      console.log('Fetching fresh data from Firestore...');
      try {
        const [links, oneDriveLinks, whatsapp, uni, fileUploads, news] = await Promise.all([
          fetchDriveLinks(),
          fetchOneDriveLinks(),
          fetchWhatsappGroups(),
          fetchUniversityGroups(),
          fetchFileUploads(),
          fetchNews()
        ]);

        console.log('Data fetched:', {
          links: links.length,
          oneDriveLinks: oneDriveLinks.length,
          whatsapp: whatsapp.length,
          uni: uni.length,
          telegram: 0,
          whatsappChannels: 0,
          youtube: 0,
          websites: 0,
          fileUploads: fileUploads.length,
          news: news.length
        });

        // Cache the data (initially without lazily‑loaded collections)
        const dataToCache = { links, oneDriveLinks, whatsapp, uni, telegram: [], whatsappChannels: [], youtube: [], websites: [], fileUploads, news };
        setDataCache(dataToCache);
        setCacheTimestamp(now);
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ timestamp: now, data: dataToCache })
            );
          }
        } catch (e) {
          console.warn('Failed to write localStorage cache:', e);
        }

        processData(links, oneDriveLinks, whatsapp, uni, [], [], [], [], fileUploads, news);
      } catch (error) {
        console.error('Error loading data:', error);
        console.error('Error details:', error.message, error.stack);
        // Still set loading to false so UI doesn't hang
        setLoadingNotes(false);
      } finally {
        setLoadingNotes(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Function to refresh data (can be called after uploads)
  const refreshData = () => {
    console.log('Refreshing data after upload...');
    setDataCache(null);
    setCacheTimestamp(0);
    setLoadingNotes(true);
    const loadData = async () => {
      try {
        console.log('Fetching fresh data after upload...');
        const [links, oneDriveLinks, whatsapp, uni, fileUploads, news] = await Promise.all([
          fetchDriveLinks(),
          fetchOneDriveLinks(),
          fetchWhatsappGroups(),
          fetchUniversityGroups(),
          fetchFileUploads(),
          fetchNews()
        ]);

        console.log('Data refreshed:', {
          links: links.length,
          oneDriveLinks: oneDriveLinks.length,
          whatsapp: whatsapp.length,
          uni: uni.length,
          telegram: 0,
          whatsappChannels: 0,
          youtube: 0,
          websites: 0,
          fileUploads: fileUploads.length,
          news: news.length
        });

        const now = Date.now();
        const dataToCache = { links, oneDriveLinks, whatsapp, uni, telegram: [], whatsappChannels: [], youtube: [], websites: [], fileUploads, news };
        setDataCache(dataToCache);
        setCacheTimestamp(now);
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ timestamp: now, data: dataToCache })
            );
          }
        } catch (e) {
          console.warn('Failed to write localStorage cache (refresh):', e);
        }
        processData(links, oneDriveLinks, whatsapp, uni, [], [], [], [], fileUploads, news);
      } catch (error) {
        console.error('Error refreshing data:', error);
        console.error('Error details:', error.message, error.stack);
      } finally {
        setLoadingNotes(false);
      }
    };
    loadData();
  };

  // Lazy loaders for extra collections
  const loadTelegramLazy = async () => {
    if (telegramGroupsData.length > 0) return;
    try {
      const telegram = await fetchTelegramGroups();
      setTelegramGroupsData(telegram);
      // Map into notes without refetching everything
      const telegramNotes = telegram.map((group) => ({
        id: group.id,
        subject: group.subject || 'Telegram Group',
        grade: group.level === 'university' ? group.year || '' : group.grade || '',
        medium: group.medium || '',
        curriculum: 'Telegram Group',
        title: group.subject || 'Telegram Study Group',
        region: '',
        url: group.url,
        level: group.level || 'school',
        universityName: group.universityName || '',
        type: 'telegram',
        description: group.description || ''
      }));
      setNotes((prev) => [...prev, ...telegramNotes]);
    } catch (e) {
      console.error('Error lazy‑loading telegram groups:', e);
    }
  };

  const loadWhatsappChannelsLazy = async () => {
    if (whatsappChannelsData.length > 0) return;
    try {
      const channels = await fetchWhatsappChannels();
      setWhatsappChannelsData(channels);
      const channelNotes = channels.map((channel) => ({
        id: channel.id,
        subject: channel.subject || 'WhatsApp Channel',
        grade: channel.level === 'university' ? channel.year || '' : channel.grade || '',
        medium: channel.medium || '',
        curriculum: 'WhatsApp Channel',
        title: channel.subject || 'WhatsApp Channel',
        region: '',
        url: channel.url,
        level: channel.level || 'school',
        universityName: channel.universityName || '',
        type: 'whatsappChannel',
        description: channel.description || ''
      }));
      setNotes((prev) => [...prev, ...channelNotes]);
    } catch (e) {
      console.error('Error lazy‑loading whatsapp channels:', e);
    }
  };

  const loadYoutubeLazy = async () => {
    if (youtubeChannelsData.length > 0) return;
    try {
      const channels = await fetchYoutubeChannels();
      setYoutubeChannelsData(channels);
      const youtubeNotes = channels.map((channel) => ({
        id: channel.id,
        subject: channel.subject || 'YouTube Channel',
        grade: channel.level === 'university' ? channel.year || '' : channel.grade || '',
        medium: channel.medium || '',
        curriculum: 'YouTube Channel',
        title: channel.subject || 'YouTube Channel',
        region: '',
        url: channel.url,
        level: channel.level || 'school',
        universityName: channel.universityName || '',
        type: 'youtube',
        description: channel.description || ''
      }));
      setNotes((prev) => [...prev, ...youtubeNotes]);
    } catch (e) {
      console.error('Error lazy‑loading youtube channels:', e);
    }
  };

  const loadWebsitesLazy = async () => {
    if (educationWebsitesData.length > 0) return;
    try {
      const websites = await fetchEducationWebsites();
      setEducationWebsitesData(websites);
      const websiteNotes = websites.map((website) => ({
        id: website.id,
        subject: website.subject || 'Education Website',
        grade: website.level === 'university' ? website.year || '' : website.grade || '',
        medium: website.medium || '',
        curriculum: 'Education Website',
        title: website.subject || 'Education Website',
        region: '',
        url: website.url,
        level: website.level || 'school',
        universityName: website.universityName || '',
        type: 'website',
        description: website.description || ''
      }));
      setNotes((prev) => [...prev, ...websiteNotes]);
    } catch (e) {
      console.error('Error lazy‑loading education websites:', e);
    }
  };

  const filteredNotes = useMemo(() => {
    console.log('=== FILTERING NOTES ===');
    console.log('Total notes available:', notes.length);
    console.log('Level filter:', levelFilter);
    console.log('Grade filter:', gradeFilter);
    console.log('Sample notes:', notes.slice(0, 3));
    
    const filtered = notes.filter((note) => {
      const matchesLevel = levelFilter === 'all' || note.level === levelFilter;
      const matchesGrade = gradeFilter === 'all' || String(note.grade) === String(gradeFilter);
      
      if (!matchesLevel) {
        console.log('Note filtered out by level:', note.subject, 'level:', note.level, 'filter:', levelFilter);
      }
      if (!matchesGrade) {
        console.log('Note filtered out by grade:', note.subject, 'grade:', note.grade, 'filter:', gradeFilter);
      }
      
      return matchesLevel && matchesGrade;
    });
    
    console.log('Filtered notes:', filtered.length, 'out of', notes.length);
    console.log('File uploads in filtered:', filtered.filter(n => n.type === 'file').length);
    console.log('Breakdown by type:', {
      drive: filtered.filter(n => n.type === 'drive').length,
      file: filtered.filter(n => n.type === 'file').length,
      telegram: filtered.filter(n => n.type === 'telegram').length,
      whatsappChannel: filtered.filter(n => n.type === 'whatsappChannel').length,
      youtube: filtered.filter(n => n.type === 'youtube').length,
      website: filtered.filter(n => n.type === 'website').length
    });
    
    return filtered;
  }, [notes, levelFilter, gradeFilter]);

  const isStandalonePage = currentHash === '#hn-news' || currentHash === '#about';

  const handleNewsFieldChange = (event) => {
    const { name, value } = event.target;
    setNewsError('');
    setNewsStatus('');
    setNewsForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewsSubmit = async (event) => {
    event.preventDefault();
    setNewsError('');
    setNewsStatus('');

    if (newsForm.secretCode.trim() !== '2525') {
      setNewsError('Secret code is incorrect.');
      return;
    }

    if (!newsForm.title.trim() || !newsForm.description.trim()) {
      setNewsError('Please add a news caption and a short description.');
      return;
    }

    // Optional image upload (PNG/JPG/JPEG only) via Cloudinary
    let uploadedImageUrl = '';
    if (newsImageFile) {
      const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedImageTypes.includes(newsImageFile.type)) {
        setNewsError('Image must be PNG or JPG.');
        return;
      }
      try {
        setNewsUploadProgress(0);
        const uploadResult = await uploadFileToCloudinary(newsImageFile, (p) =>
          setNewsUploadProgress(p)
        );
        uploadedImageUrl = uploadResult.url;
      } catch (err) {
        console.error('Error uploading news image', err);
        setNewsError(err.message || 'Failed to upload news image. Please try again.');
        return;
      } finally {
        setNewsUploadProgress(0);
      }
    }

    setNewsSubmitting(true);
    try {
      await addNewsItem({
        title: newsForm.title.trim(),
        description: newsForm.description.trim(),
        imageUrl: uploadedImageUrl
      });
      const fresh = await fetchNews();
      setNewsItems(fresh);
      setNewsStatus('Thank you for sharing this news. Your story will help others understand what students are facing.');
      setNewsForm({ title: '', description: '', secretCode: '' });
      setNewsImageFile(null);
    } catch (error) {
      console.error('Error submitting news', error);
      setNewsError('Something went wrong while saving this news. Please try again.');
    } finally {
      setNewsSubmitting(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app-shell">
        <Navbar mode={mode} onToggleMode={toggleMode} />

        <main>
          {!isStandalonePage && (
            <>
              <Hero stats={stats} />

          <section id="browse" className="section">
            <div className="section-header">
              <h2>Browse Notes</h2>
              <p className="section-subtitle">
                Find past papers, summaries, and lesson notes from volunteers across Sri Lanka.
              </p>
            </div>

            <Box
              sx={{
                mb: 2.5,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'flex-end',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 1.5
              }}
            >
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  console.log('🔄 Manual refresh triggered - clearing cache and reloading...');
                  setDataCache(null);
                  setCacheTimestamp(0);
                  setLoadingNotes(true);
                  refreshData();
                }}
                sx={{
                  minWidth: { xs: '100%', sm: 'auto' },
                  order: { xs: -1, sm: 0 }
                }}
              >
                🔄 Refresh Data
              </Button>
              <FormControl
                size="small"
                sx={{ minWidth: { xs: '100%', sm: 160 }, width: { xs: '100%', sm: 'auto' } }}
              >
                <InputLabel id="browse-level-filter-label">Level</InputLabel>
                <Select
                  labelId="browse-level-filter-label"
                  id="browse-level-filter"
                  label="Level"
                  value={levelFilter}
                  onChange={(e) => {
                    setLevelFilter(e.target.value);
                    setGradeFilter('all'); // Reset grade filter when level changes
                  }}
                >
                  <MenuItem value="all">
                    <em>All levels</em>
                  </MenuItem>
                  <MenuItem value="school">School</MenuItem>
                  <MenuItem value="university">University</MenuItem>
                </Select>
              </FormControl>

              {levelFilter === 'all' || levelFilter === 'school' ? (
              <FormControl
                size="small"
                  sx={{ minWidth: { xs: '100%', sm: 180 }, width: { xs: '100%', sm: 'auto' } }}
              >
                <InputLabel id="browse-grade-filter-label">Grade</InputLabel>
                <Select
                  labelId="browse-grade-filter-label"
                  id="browse-grade-filter"
                  label="Grade"
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                >
                  <MenuItem value="all">
                    <em>All grades</em>
                  </MenuItem>
                      <MenuItem value="1">Grade 1</MenuItem>
                      <MenuItem value="2">Grade 2</MenuItem>
                      <MenuItem value="3">Grade 3</MenuItem>
                      <MenuItem value="4">Grade 4</MenuItem>
                      <MenuItem value="5">Grade 5</MenuItem>
                      <MenuItem value="6">Grade 6</MenuItem>
                      <MenuItem value="7">Grade 7</MenuItem>
                      <MenuItem value="8">Grade 8</MenuItem>
                      <MenuItem value="9">Grade 9</MenuItem>
                      <MenuItem value="10">Grade 10</MenuItem>
                      <MenuItem value="11">Grade 11</MenuItem>
                      <MenuItem value="12">Grade 12</MenuItem>
                </Select>
              </FormControl>
              ) : null}
            </Box>

            {loadingNotes ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            ) : (
              <NotesGrid notes={filteredNotes} />
            )}
              </section>

              <section id="whatsapp-groups" className="section">
                <div className="section-header">
                  <h2>WhatsApp Study Groups</h2>
                  <p className="section-subtitle">
                    Join community-led WhatsApp groups where volunteers share updates, tips, and
                    extra help after disasters.
                  </p>
                </div>

                <WhatsappGroups groups={whatsappGroups} />
              </section>

              <section id="university-groups" className="section">
                <div className="section-header">
                  <h2>University WhatsApp Groups</h2>
                  <p className="section-subtitle">
                    Find your batch or faculty WhatsApp groups to stay connected, share notes, and
                    support each other through disruptions.
                  </p>
                </div>

                <UniversityGroups groups={universityGroups} />
              </section>

              <section id="telegram-groups" className="section">
                <div className="section-header">
                  <h2>Telegram Study Groups</h2>
                  <p className="section-subtitle">
                    Telegram groups where students and teachers can share files, links, and quick help.
                  </p>
                </div>

                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={loadTelegramLazy}
                    disabled={telegramGroups.length > 0}
                  >
                    {telegramGroups.length > 0 ? 'Telegram groups loaded' : 'Show Telegram groups'}
                  </Button>
                </Box>

                {telegramGroups.length > 0 && <TelegramGroups groups={telegramGroups} />}
              </section>

              <section id="whatsapp-channels" className="section">
                <div className="section-header">
                  <h2>WhatsApp Channels</h2>
                  <p className="section-subtitle">
                    Follow channels that regularly post educational updates, notes, and videos for Sri Lankan students.
                  </p>
                </div>

                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={loadWhatsappChannelsLazy}
                    disabled={whatsappChannels.length > 0}
                  >
                    {whatsappChannels.length > 0 ? 'WhatsApp channels loaded' : 'Show WhatsApp channels'}
                  </Button>
                </Box>

                {whatsappChannels.length > 0 && <WhatsappChannels channels={whatsappChannels} />}
              </section>

              <section id="youtube-channels" className="section">
                <div className="section-header">
                  <h2>YouTube Channels</h2>
                  <p className="section-subtitle">
                    Discover learning-focused YouTube channels that explain concepts, past papers, and more.
                  </p>
                </div>

                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    size="small"
                    color="error"
                    onClick={loadYoutubeLazy}
                    disabled={youtubeChannels.length > 0}
                  >
                    {youtubeChannels.length > 0 ? 'YouTube channels loaded' : 'Show YouTube channels'}
                  </Button>
                </Box>

                {youtubeChannels.length > 0 && <YoutubeChannels channels={youtubeChannels} />}
              </section>

              <section id="education-websites" className="section">
                <div className="section-header">
                  <h2>Education Websites</h2>
                  <p className="section-subtitle">
                    Discover free educational websites that provide learning resources, courses, and study materials to help students continue their education online.
                  </p>
                </div>

                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    size="small"
                    color="secondary"
                    onClick={loadWebsitesLazy}
                    disabled={educationWebsites.length > 0}
                  >
                    {educationWebsites.length > 0 ? 'Websites loaded' : 'Show education websites'}
                  </Button>
                </Box>

                {educationWebsites.length > 0 && <EducationWebsites websites={educationWebsites} />}
          </section>

              <section id="donate" className="section">
            <div className="section-header">
              <h2>Donate / Upload Notes</h2>
              <p className="section-subtitle">
                    Share your notes, links, and study groups so another student can keep learning, even after disaster.
              </p>
            </div>

            <UploadForm onUploadSuccess={refreshData} />
              </section>

              <section id="feedback" className="section">
                <div className="section-header">
                  <h2>Feedback</h2>
                  <p className="section-subtitle">
                    Share your thoughts, suggestions, or a short thank-you so we can keep improving HopeNotes for everyone.
                  </p>
                </div>

                <Feedback />
              </section>
            </>
          )}

          {/* HN News as a separate \"page\" view */}
          <section
            id="hn-news"
            className="section"
            style={{ display: currentHash === '#hn-news' ? 'block' : 'none', paddingTop: 0, paddingBottom: 0 }}
          >
            {/* Hero image */}
            <Box
              sx={{
                position: 'relative',
                height: { xs: 320, sm: 380, md: 420 },
                width: '100vw',
                ml: 'calc(50% - 50vw)',
                overflow: 'hidden',
                mb: { xs: 4, sm: 5 }
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${newsBackgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                  filter: 'brightness(0.7)'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'radial-gradient(circle at 15% 0%, rgba(15,23,42,0.35), transparent 55%), linear-gradient(to bottom, rgba(15,23,42,0.65), rgba(15,23,42,0.9))'
                }}
              />
              <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, py: { xs: 4, md: 6 } }}>
                <Box sx={{ textAlign: 'center', color: '#f9fafb', px: { xs: 2, sm: 3, md: 4 } }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      mb: { xs: 1, sm: 1.5 },
                      fontSize: { xs: 26, sm: 32, md: 38 },
                      letterSpacing: { xs: 1.5, md: 2.5 }
                    }}
                  >
                    HOPE<span style={{ color: '#facc15' }}>NOTES</span> NEWS
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: { xs: 2, sm: 2.5 },
                      fontWeight: 600,
                      fontSize: { xs: 15, sm: 16, md: 18 }
                    }}
                  >
                    Voices from the floods. Stories of courage. Updates from the HopeNotes community.
                  </Typography>
                </Box>
              </Container>
            </Box>

            {/* News grid */}
            <Container maxWidth="lg" sx={{ mt: { xs: 1, sm: 2 }, mb: { xs: 4, sm: 5 } }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: 'repeat(3, minmax(0, 1fr))'
                  },
                  gap: { xs: 2, sm: 3 }
                }}
              >
                {newsItems.slice(0, 6).map((item) => (
                  <Paper
                    key={item.id}
                    elevation={3}
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        pt: '56.25%',
                        backgroundImage: `url(${item.imageUrl || newsBackgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                    <Box sx={{ p: { xs: 1.8, sm: 2.2 } }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 700, mb: 1, fontSize: { xs: 14, sm: 15 } }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: { xs: 13, sm: 13.5 },
                          color: 'text.secondary',
                          mb: 1.5
                        }}
                      >
                        {item.description}
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => {
                          const text = `${item.title}\n\n${item.description}\n\nShared from HopeNotes News.`;
                          const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
                          window.open(url, '_blank', 'noopener');
                        }}
                      >
                        Share on WhatsApp
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </Box>

              {newsItems.length === 0 && (
                <Typography
                  variant="body2"
                  sx={{ textAlign: 'center', color: 'text.secondary', mt: { xs: 1, sm: 2 } }}
                >
                  No news has been posted yet. Be the first to share a story from the ground.
                </Typography>
              )}

              {/* Add news form trigger and form */}
              <Box sx={{ mt: { xs: 4, sm: 5 }, textAlign: 'center' }}>
                <Typography
                  variant="body2"
                  sx={{ mb: 1.5, color: 'text.secondary', fontSize: { xs: 13, sm: 14 } }}
                >
                  Have an update or story to share from your area?
                </Typography>
                <Box
                  component="form"
                  onSubmit={handleNewsSubmit}
                  sx={{
                    maxWidth: 520,
                    mx: 'auto',
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 3,
                    border: (theme) =>
                      theme.palette.mode === 'light'
                        ? '1px solid rgba(148,163,184,0.4)'
                        : '1px solid rgba(148,163,184,0.6)',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'light'
                        ? 'rgba(248,250,252,0.9)'
                        : 'rgba(15,23,42,0.9)'
                  }}
                >
                  {newsError && (
                    <Typography
                      variant="body2"
                      sx={{ mb: 1.5, color: '#b91c1c', fontWeight: 600, fontSize: 13 }}
                    >
                      {newsError}
                    </Typography>
                  )}
                  {newsStatus && (
                    <Typography
                      variant="body2"
                      sx={{ mb: 1.5, color: '#15803d', fontWeight: 600, fontSize: 13 }}
                    >
                      {newsStatus}
                    </Typography>
                  )}

                  <TextField
                    fullWidth
                    label="News caption"
                    name="title"
                    value={newsForm.title}
                    onChange={handleNewsFieldChange}
                    margin="dense"
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="News description"
                    name="description"
                    value={newsForm.description}
                    onChange={handleNewsFieldChange}
                    margin="dense"
                    size="small"
                    multiline
                    minRows={3}
                  />
                  <TextField
                    fullWidth
                    type="file"
                    label="News image (PNG / JPG, optional)"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ accept: 'image/png,image/jpeg,image/jpg' }}
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0];
                      setNewsImageFile(file || null);
                    }}
                    margin="dense"
                    size="small"
                  />
                  {newsUploadProgress > 0 && (
                    <Typography
                      variant="caption"
                      sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}
                    >
                      Uploading image... {newsUploadProgress}%
                    </Typography>
                  )}
                  <TextField
                    fullWidth
                    label="Secret code"
                    name="secretCode"
                    type="password"
                    value={newsForm.secretCode}
                    onChange={handleNewsFieldChange}
                    margin="dense"
                    size="small"
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ mt: 2 }}
                    disabled={newsSubmitting}
                  >
                    {newsSubmitting ? 'Submitting...' : 'Submit News'}
                  </Button>
                </Box>
              </Box>
            </Container>
          </section>

          {/* About Us as a separate \"page\" view */}
          <section
            id="about"
            className="section"
            style={{ display: currentHash === '#about' ? 'block' : 'none' }}
          >
            <Container maxWidth="md">
              <Box
                sx={{
                  mt: { xs: 6, sm: 7, md: 8 },
                  mb: { xs: 6, sm: 7, md: 8 },
                  p: { xs: 2.5, sm: 3, md: 4 },
                  borderRadius: { xs: 3, sm: 3.5, md: 4 },
                  bgcolor: (theme) =>
                    theme.palette.mode === 'light'
                      ? 'rgba(240,253,250,0.95)'
                      : 'rgba(15,23,42,0.96)',
                  border: (theme) =>
                    theme.palette.mode === 'light'
                      ? '1px solid rgba(34,197,94,0.25)'
                      : '1px solid rgba(45,212,191,0.45)',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'light'
                      ? '0 18px 40px rgba(15,23,42,0.14)'
                      : '0 22px 50px rgba(0,0,0,0.6)'
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    mb: { xs: 1.5, sm: 2 },
                    fontSize: { xs: 24, sm: 28, md: 32 },
                    textAlign: 'center'
                  }}
                >
                  About HopeNotes
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: 14, sm: 15, md: 16 },
                    lineHeight: 1.8,
                    mb: 2
                  }}
                >
                  HopeNotes was created to help Sri Lankan students rebuild their education when
                  floods, landslides, and other disasters interrupt school. Volunteers, teachers,
                  and past students can share notes, links, and study groups so that learning never
                  fully stops.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: 14, sm: 15, md: 16 },
                    lineHeight: 1.8
                  }}
                >
                  Every Google Drive folder, OneDrive link, WhatsApp or Telegram group, and uploaded
                  file is a small act of kindness. Together, they become a island-wide library of
                  hope — free for any student who needs a second chance to catch up.
                </Typography>
              </Box>
            </Container>
          </section>
        </main>

        <footer className="footer">
          <Container maxWidth="lg">
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
                px: { xs: 1, sm: 2 }
              }}
            >
              {/* Footer Logo */}
              <Box
                component="img"
                src={footerLogoImage}
                alt="HopeNotes Logo"
                sx={{
                  width: { xs: 70, sm: 90, md: 110, lg: 140 },
                  height: 'auto',
                  borderRadius: { xs: 2, sm: 2.5, md: 3, lg: 4 },
                  boxShadow: (theme) =>
                    theme.palette.mode === 'light'
                      ? '0 8px 24px rgba(15,23,42,0.12)'
                      : '0 12px 32px rgba(0,0,0,0.5)',
                  objectFit: 'contain',
                  border: (theme) =>
                    theme.palette.mode === 'light'
                      ? '2px solid rgba(148,163,184,0.15)'
                      : '2px solid rgba(30,64,175,0.3)'
                }}
              />
              
              <Box sx={{ textAlign: 'center', width: '100%' }}>
          <p>HopeNotes • Rebuilding education, one note at a time.</p>
          <p className="footer-meta">Made with care for students in Sri Lanka.</p>
                <p className="footer-meta">
                  ⚠️ <strong>Disclaimer</strong>: The documents, papers, and short notes available on this
                  website are sent by students and teachers from all over Sri Lanka. We do not claim
                  ownership of any of these materials. All rights belong to their respective owners and
                  authors.
                </p>
              </Box>
            </Box>
          </Container>
        </footer>

        {/* Scroll to Top Button */}
        <ScrollToTop />
      </div>
    </ThemeProvider>
  );
}


