import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { checkDuplicateDriveLink } from "../services/driveLinks.js";
import { checkDuplicateOneDriveLink } from "../services/oneDriveLinks.js";
import { checkDuplicateWhatsappLink } from "../services/whatsappGroups.js";
import { checkDuplicateUniversityLink } from "../services/universityGroups.js";
import { checkDuplicateTelegramLink } from "../services/telegramGroups.js";
import { checkDuplicateWhatsappChannelLink } from "../services/whatsappChannels.js";
import { checkDuplicateYoutubeChannelLink } from "../services/youtubeChannels.js";
import { checkDuplicateWebsiteLink } from "../services/educationWebsites.js";
import { uploadRateLimiter, getClientId } from "../utils/rateLimiter.js";
import { sanitizeUrl, sanitizeString } from "../utils/inputSanitizer.js";
import { uploadFileToCloudinary, validateFile, formatFileSize } from "../utils/cloudinaryUpload.js";

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import donateImage from '../images/Gemini_Generated_Image_d5zif3d5zif3d5zi.png';

const initialFormState = {
    subject: '',
    grade: '',
    level: 'school',
    medium: '',
    file: null,
    whatsappLink: '',
    driveLink: '',
  oneDriveLink: '',
    universityName: '',
  description: '',
  telegramLink: '',
  whatsappChannelLink: '',
  youtubeChannelLink: '',
  websiteLink: ''
};

export function UploadForm({ onUploadSuccess }) {
  const [form, setForm] = useState(initialFormState);
  const [mode, setMode] = useState('file'); // 'file' | 'links' | 'onedrive' | 'whatsapp' | 'uni' | 'telegram' | 'whatsappChannel' | 'youtube' | 'website'
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    // Clear any previous validation message when user edits fields
    setError('');
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    // Rate limiting check
    const clientId = getClientId();
    if (!uploadRateLimiter.isAllowed(clientId)) {
      const timeUntilReset = Math.ceil(uploadRateLimiter.getTimeUntilReset(clientId) / 1000);
      setError(
        `Too many upload attempts. Please wait ${timeUntilReset} seconds before trying again. This helps protect our servers from abuse.`
      );
      return;
    }

    // Sanitize and validate inputs
    if (mode === 'links') {
      const driveUrl = sanitizeUrl(String(form.driveLink || '').trim());
      const drivePattern = /^https?:\/\/(drive\.google\.com|docs\.google\.com)\//i;
      if (!driveUrl || !drivePattern.test(driveUrl)) {
        setError(
          'Please paste a valid Google Drive link starting with https://drive.google.com or https://docs.google.com.'
        );
        return;
      }
      // Update form with sanitized URL
      form.driveLink = driveUrl;
      if (form.level === 'university' && !form.universityName.trim()) {
        setError('Please enter the University Name.');
        return;
      }
      if (form.level === 'school' && !form.grade) {
        setError('Please select a Grade.');
        return;
      }
    }

    if (mode === 'onedrive') {
      const oneDriveUrl = sanitizeUrl(String(form.oneDriveLink || '').trim());
      // Accept direct OneDrive links and Microsoft Sway pages that host OneDrive content
      const oneDrivePattern = /^https?:\/\/(onedrive\.live\.com|1drv\.ms|sway\.cloud\.microsoft)\//i;
      if (!oneDriveUrl || !oneDrivePattern.test(oneDriveUrl)) {
        setError(
          'Please paste a valid OneDrive or Microsoft Sway link starting with https://onedrive.live.com, https://1drv.ms, or https://sway.cloud.microsoft.'
        );
        return;
      }
      form.oneDriveLink = oneDriveUrl;
      if (form.level === 'university' && !form.universityName.trim()) {
        setError('Please enter the University Name.');
        return;
      }
      if (form.level === 'school' && !form.grade) {
        setError('Please select a Grade.');
        return;
      }
    }

    if (mode === 'whatsapp' || mode === 'uni') {
      const waUrl = sanitizeUrl(String(form.whatsappLink || '').trim());
      const whatsappPattern = /^https?:\/\/(chat\.whatsapp\.com|wa\.me)\//i;
      if (!waUrl || !whatsappPattern.test(waUrl)) {
        setError(
          'Please paste a valid WhatsApp invite link (for example https://chat.whatsapp.com/...).'
        );
        return;
      }
      // Update form with sanitized URL
      form.whatsappLink = waUrl;
    }

    if (mode === 'telegram') {
      const telegramUrl = sanitizeUrl(String(form.telegramLink || '').trim());
      const telegramPattern = /^https?:\/\/(t\.me|telegram\.me)\//i;
      if (!telegramUrl || !telegramPattern.test(telegramUrl)) {
        setError(
          'Please paste a valid Telegram group link (for example https://t.me/... or https://telegram.me/...).'
        );
        return;
      }
      form.telegramLink = telegramUrl;
      if (form.level === 'university' && !form.universityName.trim()) {
        setError('Please enter the University Name.');
        return;
      }
      if (form.level === 'school' && !form.grade) {
        setError('Please select a Grade.');
        return;
      }
    }

    if (mode === 'whatsappChannel') {
      const channelUrl = sanitizeUrl(String(form.whatsappChannelLink || '').trim());
      const channelPattern = /^https?:\/\/(whatsapp\.com\/channel|wa\.me\/channel)\//i;
      if (!channelUrl || !channelPattern.test(channelUrl)) {
        setError(
          'Please paste a valid WhatsApp Channel link (for example https://whatsapp.com/channel/...).'
        );
        return;
      }
      form.whatsappChannelLink = channelUrl;
      if (form.level === 'university' && !form.universityName.trim()) {
        setError('Please enter the University Name.');
        return;
      }
      if (form.level === 'school' && !form.grade) {
        setError('Please select a Grade.');
        return;
      }
    }

    if (mode === 'youtube') {
      const youtubeUrl = sanitizeUrl(String(form.youtubeChannelLink || '').trim());
      const youtubePattern = /^https?:\/\/(www\.)?(youtube\.com\/(channel|c|user|@)|youtu\.be)\//i;
      if (!youtubeUrl || !youtubePattern.test(youtubeUrl)) {
        setError(
          'Please paste a valid YouTube Channel link (for example https://youtube.com/@channel or https://youtube.com/channel/...).'
        );
        return;
      }
      form.youtubeChannelLink = youtubeUrl;
      if (form.level === 'university' && !form.universityName.trim()) {
        setError('Please enter the University Name.');
        return;
      }
      if (form.level === 'school' && !form.grade) {
        setError('Please select a Grade.');
        return;
      }
    }

    if (mode === 'website') {
      const websiteUrl = sanitizeUrl(String(form.websiteLink || '').trim());
      const websitePattern = /^https?:\/\/.+/i;
      if (!websiteUrl || !websitePattern.test(websiteUrl)) {
        setError(
          'Please paste a valid website URL (for example https://example.com).'
        );
        return;
      }
      form.websiteLink = websiteUrl;
      if (form.level === 'university' && !form.universityName.trim()) {
        setError('Please enter the University Name.');
        return;
      }
      if (form.level === 'school' && !form.grade) {
        setError('Please select a Grade.');
        return;
      }
    }

    if (mode === 'whatsapp') {
      if (form.level === 'university' && !form.universityName.trim()) {
        setError('Please enter the University Name.');
        return;
      }
      if (form.level === 'school' && !form.grade) {
        setError('Please select a Grade.');
        return;
      }
    }

    // Sanitize text fields
    if (form.subject) {
      form.subject = sanitizeString(form.subject);
    }
    if (form.description) {
      form.description = sanitizeString(form.description);
    }
    if (form.universityName) {
      form.universityName = sanitizeString(form.universityName);
    }

    // Check for duplicate URLs before submitting
    try {
      if (mode === 'links') {
        const driveUrl = String(form.driveLink || '').trim();
        const isDuplicate = await checkDuplicateDriveLink(driveUrl);
        if (isDuplicate) {
          setError(
            'This Google Drive link has already been uploaded. Please check the Browse Notes section or share a different link.'
          );
          return;
        }
      } else if (mode === 'onedrive') {
        const oneDriveUrl = String(form.oneDriveLink || '').trim();
        const isDuplicate = await checkDuplicateOneDriveLink(oneDriveUrl);
        if (isDuplicate) {
          setError(
            'This OneDrive link has already been uploaded. Please check the Browse Notes section or share a different link.'
          );
          return;
        }
      } else if (mode === 'whatsapp') {
        const waUrl = String(form.whatsappLink || '').trim();
        const isDuplicate = await checkDuplicateWhatsappLink(waUrl);
        if (isDuplicate) {
          setError(
            'This WhatsApp group link has already been uploaded. Please check the WhatsApp Study Groups section or share a different link.'
          );
          return;
        }
      } else if (mode === 'uni') {
        const waUrl = String(form.whatsappLink || '').trim();
        const isDuplicate = await checkDuplicateUniversityLink(waUrl);
        if (isDuplicate) {
          setError(
            'This university WhatsApp group link has already been uploaded. Please check the University WhatsApp Groups section or share a different link.'
          );
          return;
        }
      } else if (mode === 'telegram') {
        const telegramUrl = String(form.telegramLink || '').trim();
        const isDuplicate = await checkDuplicateTelegramLink(telegramUrl);
        if (isDuplicate) {
          setError(
            'This Telegram group link has already been uploaded. Please check the Telegram Groups section or share a different link.'
          );
          return;
        }
      } else if (mode === 'whatsappChannel') {
        const channelUrl = String(form.whatsappChannelLink || '').trim();
        const isDuplicate = await checkDuplicateWhatsappChannelLink(channelUrl);
        if (isDuplicate) {
          setError(
            'This WhatsApp Channel link has already been uploaded. Please share a different link.'
          );
          return;
        }
      } else if (mode === 'youtube') {
        const youtubeUrl = String(form.youtubeChannelLink || '').trim();
        const isDuplicate = await checkDuplicateYoutubeChannelLink(youtubeUrl);
        if (isDuplicate) {
          setError(
            'This YouTube Channel link has already been uploaded. Please share a different link.'
          );
          return;
        }
      } else if (mode === 'website') {
        const websiteUrl = String(form.websiteLink || '').trim();
        const isDuplicate = await checkDuplicateWebsiteLink(websiteUrl);
        if (isDuplicate) {
          setError(
            'This education website link has already been uploaded. Please share a different link.'
          );
          return;
        }
      }
    } catch (checkError) {
      console.error('Error checking for duplicates:', checkError);
      // Continue with submission if duplicate check fails (don't block user)
    }

    // Handle file upload mode
    if (mode === 'file') {
      if (!form.file) {
        setError('Please select a file to upload.');
        return;
      }

      // Validate file
      const validation = validateFile(form.file);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }

      // Validate required fields
      if (!form.subject || !form.subject.trim()) {
        setError('Please enter a subject.');
        return;
      }
      if (!form.grade) {
        setError('Please select a grade.');
        return;
      }
      if (!form.medium) {
        setError('Please select a medium.');
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);
      setError('');

      try {
        // Upload file to Cloudinary
        const uploadResult = await uploadFileToCloudinary(form.file, (progress) => {
          setUploadProgress(progress);
        });

        // Get file extension from original file name
        const fileName = form.file.name;
        const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
        
        // Map file extensions to readable types
        const fileTypeMap = {
          'pdf': 'PDF',
          'doc': 'DOC',
          'docx': 'DOCX',
          'ppt': 'PPT',
          'pptx': 'PPTX',
          'jpg': 'JPG',
          'jpeg': 'JPG',
          'png': 'PNG'
        };
        
        const readableFileType = fileTypeMap[fileExtension] || fileExtension.toUpperCase() || 'FILE';

        // Save file metadata to Firestore
        const fileData = {
          subject: form.subject || '',
          grade: form.grade || '',
          medium: form.medium || '',
          url: uploadResult.url,
          publicId: uploadResult.publicId || '',
          fileName: fileName,
          fileSize: uploadResult.bytes || 0,
          fileType: readableFileType,
          description: form.description || '',
          createdAt: serverTimestamp()
        };

        await addDoc(collection(db, 'fileUploads'), fileData);

        setStatus(
          'Thank you for uploading your notes! Your file has been successfully uploaded and will help students continue their education during difficult times.'
        );
        setUploadProgress(0);
        setIsUploading(false);
        setForm(initialFormState);
        
        // Refresh data to show the newly uploaded file
        if (onUploadSuccess) {
          setTimeout(() => {
            onUploadSuccess();
          }, 1000);
        }
        return;
      } catch (uploadError) {
        console.error('Error uploading file:', uploadError);
        setError(uploadError.message || 'Failed to upload file. Please try again.');
        setIsUploading(false);
        setUploadProgress(0);
        return;
      }
    }

    // Persist to backend / Firestore depending on mode
    try {
      if (mode === 'links') {
        const driveLinkData = {
          medium: form.medium,
          url: form.driveLink,
          description: form.subject || '',
          level: form.level || 'school',
          createdAt: serverTimestamp()
        };

        // Add grade for school level or university name for university level
        if (form.level === 'university') {
          driveLinkData.universityName = form.universityName || '';
          driveLinkData.year = form.grade || ''; // Use grade field for year in university context
        } else {
          driveLinkData.grade = form.grade || '';
        }

        await addDoc(collection(db, 'driveLinks'), driveLinkData);
      } else if (mode === 'onedrive') {
        const oneDriveData = {
          medium: form.medium,
          url: form.oneDriveLink,
          description: form.subject || '',
          level: form.level || 'school',
          createdAt: serverTimestamp()
        };

        if (form.level === 'university') {
          oneDriveData.universityName = form.universityName || '';
          oneDriveData.year = form.grade || '';
        } else {
          oneDriveData.grade = form.grade || '';
        }

        await addDoc(collection(db, 'oneDriveLinks'), oneDriveData);
      } else if (mode === 'whatsapp') {
        await addDoc(collection(db, 'whatsappGroups'), {
          subject: form.subject || '',
          grade: form.grade || '',
          medium: form.medium || '',
          url: form.whatsappLink,
          description: form.description || '',
          createdAt: serverTimestamp()
        });
      } else if (mode === 'uni') {
        await addDoc(collection(db, 'universityGroups'), {
          universityName: form.universityName,
          year: form.grade,
          medium: form.medium,
          url: form.whatsappLink,
          description: form.description || '',
          createdAt: serverTimestamp()
        });
      } else if (mode === 'telegram') {
        await addDoc(collection(db, 'telegramGroups'), {
          subject: form.subject || '',
          grade: form.grade || '',
          medium: form.medium || '',
          url: form.telegramLink,
          description: form.description || '',
          createdAt: serverTimestamp()
        });
      } else if (mode === 'whatsappChannel') {
        await addDoc(collection(db, 'whatsappChannels'), {
          subject: form.subject || '',
          grade: form.grade || '',
          medium: form.medium || '',
          url: form.whatsappChannelLink,
          description: form.description || '',
          createdAt: serverTimestamp()
        });
      } else if (mode === 'youtube') {
        const youtubeData = {
          subject: form.subject || '',
          level: form.level || 'school',
          medium: form.medium || '',
          url: form.youtubeChannelLink,
          description: form.description || '',
          createdAt: serverTimestamp()
        };
        if (form.level === 'university') {
          youtubeData.universityName = form.universityName || '';
          youtubeData.year = form.grade || ''; // Use grade field for year in university context
        } else {
          youtubeData.grade = form.grade || '';
        }
        await addDoc(collection(db, 'youtubeChannels'), youtubeData);
      } else if (mode === 'website') {
        const websiteData = {
          subject: form.subject || '',
          level: form.level || 'school',
          medium: form.medium || '',
          url: form.websiteLink,
          description: form.description || '',
          createdAt: serverTimestamp()
        };
        if (form.level === 'university') {
          websiteData.universityName = form.universityName || '';
          websiteData.year = form.grade || ''; // Use grade field for year in university context
        } else {
          websiteData.grade = form.grade || '';
        }
        await addDoc(collection(db, 'educationWebsites'), websiteData);
      }
      // Other modes (file) can be wired similarly later
    } catch (error) {
      console.error('Error saving link to Firestore', error);
      setStatus('Something went wrong while saving. Please try again.');
      return;
    }

    let message =
      'Thank you for sharing your resources. Every upload helps a Sri Lankan student keep learning after disaster.';
    if (mode === 'file') {
      message =
        'Thank you for offering your notes. Once file uploads are ready, these resources will help students rebuild their studies after floods and other disasters.';
    } else if (mode === 'links') {
      message =
        'Thank you for sharing your Google Drive notes. A student who lost their books in a flood may use your link to catch up again.';
    } else if (mode === 'onedrive') {
      message =
        'Thank you for sharing your OneDrive notes. Your link can help a student who lost access to books and materials keep learning.';
    } else if (mode === 'whatsapp') {
      message =
        'Thank you for opening a WhatsApp study group. In a difficult season for Sri Lanka, your group can feel like a small classroom of hope.';
    } else if (mode === 'uni') {
      message =
        'Thank you for creating space for university students to stay connected. Your WhatsApp group can keep an entire batch learning together, even when campuses are disrupted.';
    } else if (mode === 'telegram') {
      message =
        'Thank you for sharing your Telegram group. Your group helps students connect and share resources during difficult times in Sri Lanka.';
    } else if (mode === 'whatsappChannel') {
      message =
        'Thank you for sharing your WhatsApp Channel. Channels help reach more students with educational content and updates.';
    } else if (mode === 'youtube') {
      message =
        'Thank you for sharing your YouTube Channel. Educational videos can help students learn visually, especially when physical resources are lost.';
    } else if (mode === 'website') {
      message =
        'Thank you for sharing this education website. Online resources can be a lifeline for students when physical materials are unavailable after disasters.';
    }
    setStatus(message);

    // Clear form fields after successful submit, keep current mode
    setForm(initialFormState);

    // Refresh data to show the newly uploaded item
    if (onUploadSuccess) {
      // Small delay to ensure Firestore has processed the write
      setTimeout(() => {
        onUploadSuccess();
      }, 1000);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        borderRadius: { xs: 3, sm: 4, md: 5 },
        p: { xs: 2.5, sm: 3, md: 4, lg: 5 },
        boxShadow:
          theme.palette.mode === 'light'
            ? '0 20px 60px rgba(15,23,42,0.08), 0 0 0 1px rgba(148,163,184,0.1)'
            : '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(30,64,175,0.3)',
        border:
          theme.palette.mode === 'light'
            ? '1px solid rgba(148,163,184,0.15)'
            : '1px solid rgba(30,64,175,0.4)',
        bgcolor:
          theme.palette.mode === 'light'
            ? 'linear-gradient(135deg, rgba(255,255,255,0.99) 0%, rgba(248,250,252,0.99) 50%, rgba(240,253,250,0.99) 100%)'
            : 'linear-gradient(135deg, rgba(15,23,42,0.99) 0%, rgba(8,47,73,0.99) 50%, rgba(2,6,23,0.99) 100%)',
        width: '100%',
        maxWidth: '100%',
        mx: 'auto',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #0891b2, #22c55e, #0ea5e9, #a855f7, #ef4444, #f97316)',
          backgroundSize: '200% 100%',
          animation: 'gradientShift 8s ease infinite',
          zIndex: 1
        },
        '@keyframes gradientShift': {
          '0%, 100%': {
            backgroundPosition: '0% 50%'
          },
          '50%': {
            backgroundPosition: '100% 50%'
          }
        }
      })}
    >
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ position: 'relative', zIndex: 2 }}>
        {error && (
          <Box sx={{ mb: { xs: 2.5, sm: 3, md: 3 } }}>
            <Alert 
              severity="warning" 
              variant="filled"
              sx={{
                borderRadius: { xs: 2, sm: 2.5 },
                fontSize: { xs: 13, sm: 14 },
                boxShadow: (theme) =>
                  theme.palette.mode === 'light'
                    ? '0 4px 12px rgba(245,158,11,0.3)'
                    : '0 4px 12px rgba(245,158,11,0.5)'
              }}
            >
              {error}
            </Alert>
          </Box>
        )}

        {status && (
          <Box sx={{ mb: { xs: 2.5, sm: 3, md: 3 } }}>
            <Alert 
              severity="success" 
              variant="filled"
              sx={{
                borderRadius: { xs: 2, sm: 2.5 },
                fontSize: { xs: 13, sm: 14 },
                boxShadow: (theme) =>
                  theme.palette.mode === 'light'
                    ? '0 4px 12px rgba(34,197,94,0.3)'
                    : '0 4px 12px rgba(34,197,94,0.5)'
              }}
            >
              {status}
            </Alert>
          </Box>
        )}

        {/* Header Section */}
        <Box
          sx={{
            textAlign: 'center',
            mb: { xs: 3, sm: 3.5, md: 4 },
            px: { xs: 1, sm: 0 }
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontSize: { xs: 24, sm: 28, md: 32, lg: 36 },
              mb: { xs: 1, sm: 1.5 },
              background: (theme) =>
                theme.palette.mode === 'light'
                  ? 'linear-gradient(135deg, #0891b2 0%, #22c55e 50%, #0ea5e9 100%)'
                  : 'linear-gradient(135deg, #06b6d4 0%, #34d399 50%, #38bdf8 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: { xs: -0.5, sm: -0.8, md: -1 }
            }}
          >
            Donate / Upload Notes
            </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: 14, sm: 15, md: 16 },
              color: 'text.secondary',
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.7
            }}
          >
            Share your educational resources and help students continue learning during difficult times
            </Typography>
          </Box>

        {/* Logo Image Section */}
        <Box
            sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: { xs: 3, sm: 3.5, md: 4 },
            px: { xs: 0.5, sm: 1, md: 0 }
          }}
        >
          <Box
            component="img"
            src={donateImage}
            alt="HopeNotes Donate"
            sx={{
              width: { xs: 160, sm: 200, md: 240, lg: 280 },
              maxWidth: { xs: '85%', sm: 'none' },
              height: 'auto',
              borderRadius: { xs: 4, sm: 5, md: 6 },
              boxShadow: (theme) =>
                theme.palette.mode === 'light'
                  ? '0 20px 50px rgba(15,23,42,0.15), 0 0 0 1px rgba(148,163,184,0.1)'
                  : '0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(30,64,175,0.3)',
              objectFit: 'contain',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.02)'
              }
            }}
          />
        </Box>

        {/* Upload Type Selection Section */}
        <Box
          sx={{
            mb: { xs: 3.5, sm: 4, md: 4.5 },
            px: { xs: 0.5, sm: 0 }
          }}
        >
          <Box
            sx={{
              mb: { xs: 2, sm: 2.5, md: 3 },
              textAlign: { xs: 'left', sm: 'left', md: 'center' }
            }}
          >
            <Typography 
              variant="h6"
              sx={{ 
                mb: { xs: 1, sm: 1.2, md: 1.5 },
                fontSize: { xs: 16, sm: 18, md: 20 },
                fontWeight: 700,
                color: (theme) =>
                  theme.palette.mode === 'light'
                    ? '#1e293b'
                    : '#f1f5f9'
              }}
            >
              Select Upload Type
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                fontSize: { xs: 13, sm: 14, md: 15 },
                lineHeight: 1.6,
                mb: { xs: 2, sm: 2.5 }
              }}
            >
              Choose how you&apos;d like to share your educational resources
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: { xs: 0.8, sm: 1, md: 1.2 },
                justifyContent: { xs: 'flex-start', sm: 'flex-start', md: 'center' },
                mb: { xs: 2.5, sm: 3 }
              }}
            >
              <Box
                sx={{
                  px: { xs: 1.4, sm: 1.6, md: 1.8 },
                  py: { xs: 0.5, sm: 0.6, md: 0.7 },
              borderRadius: 999,
                  fontSize: { xs: 11, sm: 11.5, md: 12 },
                  fontWeight: 700,
                  bgcolor: 'rgba(34,197,94,0.12)',
                  color: '#15803d',
                  border: '2px solid rgba(34,197,94,0.3)',
                  boxShadow: '0 2px 8px rgba(34,197,94,0.15)'
                }}
              >
                ✓ 100% Free
              </Box>
              <Box
                sx={{
                  px: { xs: 1.4, sm: 1.6, md: 1.8 },
                  py: { xs: 0.5, sm: 0.6, md: 0.7 },
                borderRadius: 999,
                  fontSize: { xs: 11, sm: 11.5, md: 12 },
                  fontWeight: 700,
                  bgcolor: 'rgba(59,130,246,0.12)',
                  color: '#1d4ed8',
                  border: '2px solid rgba(59,130,246,0.3)',
                  boxShadow: '0 2px 8px rgba(59,130,246,0.15)'
                }}
              >
                🇱🇰 Sri Lanka Wide
              </Box>
              <Box
                sx={{
                  px: { xs: 1.4, sm: 1.6, md: 1.8 },
                  py: { xs: 0.5, sm: 0.6, md: 0.7 },
                  borderRadius: 999,
                  fontSize: { xs: 11, sm: 11.5, md: 12 },
                  fontWeight: 700,
                  bgcolor: 'rgba(14,165,233,0.12)',
                  color: '#0369a1',
                  border: '2px solid rgba(14,165,233,0.3)',
                  boxShadow: '0 2px 8px rgba(14,165,233,0.15)'
                }}
              >
                🌊 Disaster Relief
              </Box>
            </Box>
          </Box>

          {/* Upload type dropdown - Show on all devices */}
          <FormControl
            fullWidth
            sx={{
              display: 'block',
              width: '100%',
              mb: { xs: 3, sm: 3.5 }
            }}
          >
            <InputLabel 
              id="upload-mode-select-label"
              sx={{
                fontSize: { xs: 14, sm: 15 },
                fontWeight: 600,
                color: (theme) =>
                  theme.palette.mode === 'light'
                    ? '#1e293b'
                    : '#e5e7eb'
              }}
            >
              Choose Upload Type
            </InputLabel>
            <Select
              labelId="upload-mode-select-label"
              id="upload-mode-select"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              label="Choose Upload Type"
              sx={{
                fontSize: { xs: 15, sm: 16 },
                fontWeight: 600,
                borderRadius: { xs: 3, sm: 3.5 },
                bgcolor: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'rgba(255,255,255,0.98)'
                    : 'rgba(15,23,42,0.98)',
                border: (theme) =>
                  theme.palette.mode === 'light'
                    ? '2px solid rgba(148,163,184,0.2)'
                    : '2px solid rgba(148,163,184,0.3)',
                boxShadow: (theme) =>
                  theme.palette.mode === 'light'
                    ? '0 4px 16px rgba(15,23,42,0.08)'
                    : '0 4px 16px rgba(0,0,0,0.3)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'transparent'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'transparent'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'transparent',
                  borderWidth: '0px'
                },
                '& .MuiSelect-select': {
                  py: { xs: 1.4, sm: 1.6 },
                  px: { xs: 2, sm: 2.5 },
                  display: 'flex',
                  alignItems: 'center'
                }
              }}
            >
              <MenuItem 
                value="file"
                sx={{
                  fontSize: { xs: 14, sm: 15 },
                  fontWeight: 600,
                  py: { xs: 1, sm: 1.2 },
                  borderLeft: '4px solid rgba(8,145,178,0.5)',
                  bgcolor: (theme) =>
                    mode === 'file'
                      ? theme.palette.mode === 'light'
                        ? 'rgba(8,145,178,0.08)'
                        : 'rgba(8,145,178,0.15)'
                      : 'transparent',
                  '&:hover': {
                    bgcolor: (theme) =>
                  theme.palette.mode === 'light'
                        ? 'rgba(8,145,178,0.12)'
                        : 'rgba(8,145,178,0.2)'
                  }
                }}
              >
                📤 Upload file
              </MenuItem>
              <MenuItem 
                value="links"
                sx={{
                  fontSize: { xs: 14, sm: 15 },
                  fontWeight: 600,
                  py: { xs: 1, sm: 1.2 },
                  borderLeft: '4px solid rgba(34,197,94,0.5)',
                  bgcolor: (theme) =>
                    mode === 'links'
                      ? theme.palette.mode === 'light'
                        ? 'rgba(34,197,94,0.08)'
                        : 'rgba(34,197,94,0.15)'
                      : 'transparent',
                  '&:hover': {
                    bgcolor: (theme) =>
                  theme.palette.mode === 'light'
                        ? 'rgba(34,197,94,0.12)'
                        : 'rgba(34,197,94,0.2)'
                  }
                }}
              >
                📁 Google Drive links
              </MenuItem>
              <MenuItem 
                value="onedrive"
                sx={{
                  fontSize: { xs: 14, sm: 15 },
                  fontWeight: 600,
                  py: { xs: 1, sm: 1.2 },
                  borderLeft: '4px solid rgba(37,99,235,0.6)',
                  bgcolor: (theme) =>
                    mode === 'onedrive'
                      ? theme.palette.mode === 'light'
                        ? 'rgba(59,130,246,0.08)'
                        : 'rgba(37,99,235,0.2)'
                      : 'transparent',
                  '&:hover': {
                    bgcolor: (theme) =>
                  theme.palette.mode === 'light'
                        ? 'rgba(59,130,246,0.12)'
                        : 'rgba(37,99,235,0.3)'
                  }
                }}
              >
                📂 OneDrive links
              </MenuItem>
              <MenuItem 
                value="whatsapp"
                sx={{
                  fontSize: { xs: 14, sm: 15 },
                  fontWeight: 600,
                  py: { xs: 1, sm: 1.2 },
                  borderLeft: '4px solid rgba(45,212,191,0.5)',
                  bgcolor: (theme) =>
                    mode === 'whatsapp'
                      ? theme.palette.mode === 'light'
                        ? 'rgba(45,212,191,0.08)'
                        : 'rgba(45,212,191,0.15)'
                      : 'transparent',
                  '&:hover': {
                    bgcolor: (theme) =>
                  theme.palette.mode === 'light'
                        ? 'rgba(45,212,191,0.12)'
                        : 'rgba(45,212,191,0.2)'
                  }
                }}
              >
                💬 WhatsApp group links
              </MenuItem>
              <MenuItem 
                value="uni"
                sx={{
                  fontSize: { xs: 14, sm: 15 },
                  fontWeight: 600,
                  py: { xs: 1, sm: 1.2 },
                  borderLeft: '4px solid rgba(168,85,247,0.5)',
                  bgcolor: (theme) =>
                    mode === 'uni'
                      ? theme.palette.mode === 'light'
                        ? 'rgba(168,85,247,0.08)'
                        : 'rgba(168,85,247,0.15)'
                      : 'transparent',
                  '&:hover': {
                    bgcolor: (theme) =>
                  theme.palette.mode === 'light'
                        ? 'rgba(168,85,247,0.12)'
                        : 'rgba(168,85,247,0.2)'
                  }
                }}
              >
                🎓 University groups
              </MenuItem>
              <MenuItem 
                value="telegram"
                sx={{
                  fontSize: { xs: 14, sm: 15 },
                  fontWeight: 600,
                  py: { xs: 1, sm: 1.2 },
                  borderLeft: '4px solid rgba(6,182,212,0.5)',
                  bgcolor: (theme) =>
                    mode === 'telegram'
                      ? theme.palette.mode === 'light'
                        ? 'rgba(6,182,212,0.08)'
                        : 'rgba(6,182,212,0.15)'
                      : 'transparent',
                  '&:hover': {
                    bgcolor: (theme) =>
                  theme.palette.mode === 'light'
                        ? 'rgba(6,182,212,0.12)'
                        : 'rgba(6,182,212,0.2)'
                  }
                }}
              >
                📱 Telegram groups
              </MenuItem>
              <MenuItem 
                value="whatsappChannel"
                sx={{
                  fontSize: { xs: 14, sm: 15 },
                  fontWeight: 600,
                  py: { xs: 1, sm: 1.2 },
                  borderLeft: '4px solid rgba(16,185,129,0.5)',
                  bgcolor: (theme) =>
                    mode === 'whatsappChannel'
                      ? theme.palette.mode === 'light'
                        ? 'rgba(16,185,129,0.08)'
                        : 'rgba(16,185,129,0.15)'
                      : 'transparent',
                  '&:hover': {
                    bgcolor: (theme) =>
                      theme.palette.mode === 'light'
                        ? 'rgba(16,185,129,0.12)'
                        : 'rgba(16,185,129,0.2)'
                  }
                }}
              >
                📢 WhatsApp Channels
              </MenuItem>
              <MenuItem 
                value="youtube"
                sx={{
                  fontSize: { xs: 14, sm: 15 },
                  fontWeight: 600,
                  py: { xs: 1, sm: 1.2 },
                  borderLeft: '4px solid rgba(239,68,68,0.5)',
                  bgcolor: (theme) =>
                    mode === 'youtube'
                      ? theme.palette.mode === 'light'
                        ? 'rgba(239,68,68,0.08)'
                        : 'rgba(239,68,68,0.15)'
                      : 'transparent',
                  '&:hover': {
                    bgcolor: (theme) =>
                      theme.palette.mode === 'light'
                        ? 'rgba(239,68,68,0.12)'
                        : 'rgba(239,68,68,0.2)'
                  }
                }}
              >
                ▶️ YouTube Channels
              </MenuItem>
              <MenuItem 
                value="website"
                sx={{
                  fontSize: { xs: 14, sm: 15 },
                  fontWeight: 600,
                  py: { xs: 1, sm: 1.2 },
                  borderLeft: '4px solid rgba(249,115,22,0.5)',
                  bgcolor: (theme) =>
                    mode === 'website'
                      ? theme.palette.mode === 'light'
                        ? 'rgba(249,115,22,0.08)'
                        : 'rgba(249,115,22,0.15)'
                      : 'transparent',
                  '&:hover': {
                    bgcolor: (theme) =>
                      theme.palette.mode === 'light'
                        ? 'rgba(249,115,22,0.12)'
                        : 'rgba(249,115,22,0.2)'
                  }
                }}
              >
                🌐 Other education websites
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Form Fields Section */}
        <Box
          sx={{
            mt: { xs: 3, sm: 3.5, md: 4 },
            p: { xs: 2, sm: 2.5, md: 3 },
            borderRadius: { xs: 3, sm: 4 },
            bgcolor: (theme) =>
              theme.palette.mode === 'light'
                ? 'rgba(255,255,255,0.6)'
                : 'rgba(15,23,42,0.4)',
            border: (theme) =>
              theme.palette.mode === 'light'
                ? '1px solid rgba(148,163,184,0.15)'
                : '1px solid rgba(148,163,184,0.2)',
            boxShadow: (theme) =>
              theme.palette.mode === 'light'
                ? 'inset 0 2px 8px rgba(15,23,42,0.04)'
                : 'inset 0 2px 8px rgba(0,0,0,0.2)'
          }}
        >
        {mode !== 'uni' && (
          <Grid 
            container 
            spacing={{ xs: 2.5, sm: 3, md: 3.5 }}
            sx={{
              width: '100%',
              mx: 0
            }}
          >
            {mode === 'file' ? (
              <>
                <Grid item xs={12} sm={12} md={6}>
                  <TextField
                    fullWidth
                    label="Subject"
                    id="subject-file"
                    name="subject"
                    placeholder="e.g. Mathematics, History, Science"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    sx={{
                      '& .MuiInputBase-root': {
                        fontSize: { xs: 14, sm: 15, md: 16 },
                        borderRadius: { xs: 2, sm: 2.5 },
                        bgcolor: (theme) =>
                          theme.palette.mode === 'light'
                            ? 'rgba(255,255,255,0.9)'
                            : 'rgba(15,23,42,0.6)'
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: 14, sm: 15, md: 16 },
                        fontWeight: 600
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel id="grade-file-label" sx={{ fontSize: { xs: 14, sm: 15, md: 16 }, fontWeight: 600 }}>Grade</InputLabel>
                    <Select
                      labelId="grade-file-label"
                      id="grade-file"
                      name="grade"
                      label="Grade"
                      value={form.grade}
                      onChange={handleChange}
                      sx={{
                        fontSize: { xs: 14, sm: 15, md: 16 },
                        borderRadius: { xs: 2, sm: 2.5 }
                      }}
                    >
                      <MenuItem value="" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>
                        <em>Select Grade</em>
                      </MenuItem>
                      <MenuItem value="1" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>Grade 1</MenuItem>
                      <MenuItem value="2" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>Grade 2</MenuItem>
                      <MenuItem value="3" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>Grade 3</MenuItem>
                      <MenuItem value="4" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>Grade 4</MenuItem>
                      <MenuItem value="5" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>Grade 5</MenuItem>
                      <MenuItem value="6" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>Grade 6</MenuItem>
                      <MenuItem value="7" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>Grade 7</MenuItem>
                      <MenuItem value="8" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>Grade 8</MenuItem>
                      <MenuItem value="9" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>Grade 9</MenuItem>
                      <MenuItem value="10" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>Grade 10</MenuItem>
                      <MenuItem value="11" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>Grade 11</MenuItem>
                      <MenuItem value="12" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>Grade 12</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel id="medium-file-label" sx={{ fontSize: { xs: 14, sm: 15, md: 16 }, fontWeight: 600 }}>Medium</InputLabel>
                    <Select
                      labelId="medium-file-label"
                      id="medium-file"
                      name="medium"
                      label="Medium"
                      value={form.medium}
                      onChange={handleChange}
                      sx={{
                        fontSize: { xs: 14, sm: 15, md: 16 },
                        borderRadius: { xs: 2, sm: 2.5 }
                      }}
                    >
                      <MenuItem value="" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>
                        <em>Select medium</em>
                      </MenuItem>
                      <MenuItem value="Sinhala" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>Sinhala Medium</MenuItem>
                      <MenuItem value="Tamil" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>Tamil Medium</MenuItem>
                      <MenuItem value="English" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>English Medium</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Box
                    sx={(theme) => ({
                      p: { xs: 2.5, sm: 3, md: 3.5 },
                      borderRadius: { xs: 3, sm: 3.5 },
                      border: isUploading
                        ? `2px solid ${theme.palette.mode === 'light' ? 'rgba(8,145,178,0.5)' : 'rgba(56,189,248,0.6)'}`
                        : theme.palette.mode === 'light'
                        ? '2px dashed rgba(148,163,184,0.4)'
                        : '2px dashed rgba(148,163,184,0.5)',
                      background:
                        theme.palette.mode === 'light'
                          ? isUploading
                            ? 'rgba(240,253,250,0.6)'
                            : 'rgba(248,250,252,0.9)'
                          : isUploading
                          ? 'rgba(8,47,73,0.4)'
                          : 'rgba(15,23,42,0.95)',
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    })}
                  >
                    <TextField
                      fullWidth
                      type="file"
                      id="file"
                      name="file"
                      onChange={handleChange}
                      required
                      disabled={isUploading}
                      inputProps={{
                        accept: '.pdf,.doc,.docx,.ppt,.pptx,.jpg,.png,.jpeg'
                      }}
                      sx={{
                        '& .MuiInputBase-root': {
                          fontSize: { xs: 14, sm: 15, md: 16 },
                          borderRadius: { xs: 2, sm: 2.5 }
                        }
                      }}
                    />
                    {form.file && (
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CloudUploadIcon sx={{ color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Selected: <strong>{form.file.name}</strong> ({formatFileSize(form.file.size)})
                        </Typography>
                      </Box>
                    )}
                    {isUploading && (
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Uploading...
                          </Typography>
                          <Typography variant="body2" color="primary" fontWeight={600}>
                            {uploadProgress}%
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: '100%',
                            height: 8,
                            borderRadius: 999,
                            bgcolor: (theme) =>
                              theme.palette.mode === 'light'
                                ? 'rgba(148,163,184,0.2)'
                                : 'rgba(148,163,184,0.3)',
                            overflow: 'hidden'
                          }}
                        >
                          <Box
                            sx={{
                              width: `${uploadProgress}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, #0891b2, #22c55e)',
                              transition: 'width 0.3s ease',
                              borderRadius: 999
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
                      Supported formats: PDF, DOC, DOCX, PPT, PPTX, JPG, PNG (Max 10MB)
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="description-file"
                    name="description"
                    label="Description (optional)"
                    placeholder="Brief description of the notes or materials"
                    value={form.description}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    minRows={3}
                    maxRows={6}
                    helperText="Optional: Add a brief description to help students understand what this file contains."
                    sx={{
                      '& .MuiInputBase-root': {
                        fontSize: { xs: 14, sm: 15, md: 16 },
                        borderRadius: { xs: 2, sm: 2.5 }
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: 14, sm: 15, md: 16 },
                        fontWeight: 600
                      }
                    }}
                  />
                </Grid>
              </>
            ) : (
              <>
                {(mode === 'links' || mode === 'onedrive' || mode === 'telegram' || mode === 'whatsappChannel' || mode === 'youtube' || mode === 'website') && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Subject"
                    id="subject"
                    name="subject"
                    placeholder="e.g. Mathematics, History, Science or All subjects"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    helperText={
                      mode === 'links'
                            ? 'For links that help everyone, you can type "All subjects".'
                        : ''
                    }
                  />
                </Grid>

                    {(mode === 'links' || mode === 'onedrive' || mode === 'telegram' || mode === 'whatsappChannel' || mode === 'youtube' || mode === 'website') && (
                      <>
                        <Grid item xs={12} sm={12} md={6}>
                          <FormControl fullWidth required>
                            <InputLabel id="level-other-label" sx={{ fontSize: { xs: 14, sm: 15, md: 16 }, fontWeight: 600 }}>Level</InputLabel>
                            <Select
                              labelId="level-other-label"
                              id="level-other"
                              name="level"
                              label="Level"
                              value={form.level}
                              onChange={handleChange}
                              sx={{
                                fontSize: { xs: 14, sm: 15, md: 16 },
                                borderRadius: { xs: 2, sm: 2.5 },
                                bgcolor: (theme) =>
                                  theme.palette.mode === 'light'
                                    ? 'rgba(255,255,255,0.9)'
                                    : 'rgba(15,23,42,0.6)',
                                '&:hover': {
                                  bgcolor: (theme) =>
                                    theme.palette.mode === 'light'
                                      ? 'rgba(255,255,255,1)'
                                      : 'rgba(15,23,42,0.8)'
                                },
                                '&.Mui-focused': {
                                  bgcolor: (theme) =>
                                    theme.palette.mode === 'light'
                                      ? 'rgba(255,255,255,1)'
                                      : 'rgba(15,23,42,0.9)'
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: (theme) =>
                                    theme.palette.mode === 'light'
                                      ? 'rgba(148,163,184,0.3)'
                                      : 'rgba(148,163,184,0.4)',
                                  borderWidth: '1.5px'
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: (theme) =>
                                    theme.palette.mode === 'light'
                                      ? 'rgba(8,145,178,0.5)'
                                      : 'rgba(56,189,248,0.6)'
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: (theme) =>
                                    theme.palette.mode === 'light'
                                      ? 'rgba(8,145,178,0.7)'
                                      : 'rgba(56,189,248,0.8)',
                                  borderWidth: '2px'
                                }
                              }}
                            >
                              <MenuItem value="school" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>School</MenuItem>
                              <MenuItem value="university" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>University</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        {form.level === 'school' ? (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                              <InputLabel id="grade-other-label" sx={{ fontSize: { xs: 14, sm: 15, md: 16 }, fontWeight: 600 }}>Grade</InputLabel>
                    <Select
                                labelId="grade-other-label"
                                id="grade-other"
                      name="grade"
                      label="Grade"
                      value={form.grade}
                      onChange={handleChange}
                    >
                      <MenuItem value="">
                        <em>Grade</em>
                      </MenuItem>
                      <MenuItem value="all">All grades</MenuItem>
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
                </Grid>
                        ) : (
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="University Name"
                              id="university-name-other"
                              name="universityName"
                              placeholder="e.g. University of Colombo, University of Peradeniya"
                              value={form.universityName}
                              onChange={handleChange}
                              required
                            />
                          </Grid>
                        )}
                      </>
                    )}
              </>
            )}

                {mode === 'whatsapp' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Subject"
                    id="subject"
                    name="subject"
                        placeholder="e.g. Mathematics, History, Science"
                    value={form.subject}
                    onChange={handleChange}
                    required
                  />
                </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                        <InputLabel id="level-whatsapp-label" sx={{ fontSize: { xs: 14, sm: 15, md: 16 }, fontWeight: 600 }}>Level</InputLabel>
                    <Select
                          labelId="level-whatsapp-label"
                          id="level-whatsapp"
                          name="level"
                          label="Level"
                          value={form.level}
                          onChange={handleChange}
                        >
                          <MenuItem value="school">School</MenuItem>
                          <MenuItem value="university">University</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {form.level === 'school' ? (
                      <Grid item xs={12} sm={12} md={6}>
                        <FormControl fullWidth required>
                          <InputLabel id="grade-whatsapp-label" sx={{ fontSize: { xs: 14, sm: 15, md: 16 }, fontWeight: 600 }}>Grade</InputLabel>
                          <Select
                            labelId="grade-whatsapp-label"
                            id="grade-whatsapp"
                      name="grade"
                      label="Grade"
                      value={form.grade}
                      onChange={handleChange}
                            sx={{
                              fontSize: { xs: 14, sm: 15, md: 16 }
                            }}
                    >
                            <MenuItem value="" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>
                        <em>Grade</em>
                      </MenuItem>
                            <MenuItem value="1" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>Grade 1</MenuItem>
                            <MenuItem value="2" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>Grade 2</MenuItem>
                            <MenuItem value="3" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>Grade 3</MenuItem>
                            <MenuItem value="4" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>Grade 4</MenuItem>
                            <MenuItem value="5" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>Grade 5</MenuItem>
                            <MenuItem value="6" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>Grade 6</MenuItem>
                            <MenuItem value="7" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>Grade 7</MenuItem>
                            <MenuItem value="8" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>Grade 8</MenuItem>
                            <MenuItem value="9" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>Grade 9</MenuItem>
                            <MenuItem value="10" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>Grade 10</MenuItem>
                            <MenuItem value="11" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>Grade 11</MenuItem>
                            <MenuItem value="12" sx={{ fontSize: { xs: 14, sm: 15, md: 16 } }}>Grade 12</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                    ) : (
                      <Grid item xs={12} sm={12} md={6}>
                        <TextField
                          fullWidth
                          label="University Name"
                          id="university-name-whatsapp"
                          name="universityName"
                          placeholder="e.g. University of Colombo, University of Peradeniya"
                          value={form.universityName}
                          onChange={handleChange}
                          required
                          sx={{
                            '& .MuiInputBase-root': {
                              fontSize: { xs: 14, sm: 15, md: 16 }
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: { xs: 14, sm: 15, md: 16 }
                            }
                          }}
                        />
                      </Grid>
                    )}
                  </>
                )}
              </>
            )}

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="medium-label" sx={{ fontSize: { xs: 14, sm: 15, md: 16 }, fontWeight: 600 }}>Medium</InputLabel>
                <Select
                  labelId="medium-label"
                  id="medium"
                  name="medium"
                  label="Medium"
                  value={form.medium}
                  onChange={handleChange}
                >
                  <MenuItem value="">
                    <em>Select medium</em>
                  </MenuItem>
                  <MenuItem value="all">All mediums</MenuItem>
                  <MenuItem value="Sinhala">Sinhala Medium</MenuItem>
                  <MenuItem value="Tamil">Tamil Medium</MenuItem>
                  <MenuItem value="English">English Medium</MenuItem>
                  <MenuItem value="Sinhala and English">Sinhala and English</MenuItem>
                  <MenuItem value="Japanese">Japanese Medium</MenuItem>
                  <MenuItem value="Korean">Korean Medium</MenuItem>
                  <MenuItem value="Hindi">Hindi Medium</MenuItem>
                </Select>
                <FormHelperText>
                  Choose the language that best matches your notes or links.
                </FormHelperText>
              </FormControl>
            </Grid>

                {mode === 'links' && (
              <Grid item xs={12} sm={12} md={6}>
                <TextField
                  fullWidth
                  id="driveLink"
                  name="driveLink"
                  type="url"
                  label="Google Drive Link (required)"
                  placeholder="https://drive.google.com/..."
                  value={form.driveLink}
                  onChange={handleChange}
                  required
                  helperText="Paste a folder or file link if your notes live on Google Drive."
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: 14, sm: 15, md: 16 },
                      borderRadius: { xs: 2, sm: 2.5 },
                      bgcolor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(255,255,255,0.9)'
                          : 'rgba(15,23,42,0.6)',
                      '&:hover': {
                        bgcolor: (theme) =>
                          theme.palette.mode === 'light'
                            ? 'rgba(255,255,255,1)'
                            : 'rgba(15,23,42,0.8)'
                      },
                      '&.Mui-focused': {
                        bgcolor: (theme) =>
                          theme.palette.mode === 'light'
                            ? 'rgba(255,255,255,1)'
                            : 'rgba(15,23,42,0.9)'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: 14, sm: 15, md: 16 },
                      fontWeight: 600
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(148,163,184,0.3)'
                          : 'rgba(148,163,184,0.4)',
                      borderWidth: '1.5px'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(8,145,178,0.5)'
                          : 'rgba(56,189,248,0.6)'
                    },
                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(8,145,178,0.7)'
                          : 'rgba(56,189,248,0.8)',
                      borderWidth: '2px'
                    }
                  }}
                />
              </Grid>
            )}
            {mode === 'onedrive' && (
              <Grid item xs={12} sm={12} md={6}>
                <TextField
                  fullWidth
                  id="onedrive-link"
                  name="oneDriveLink"
                  type="url"
                  label="OneDrive Link (required)"
                  placeholder="https://onedrive.live.com/... or https://1drv.ms/..."
                  value={form.oneDriveLink}
                  onChange={handleChange}
                  required
                  helperText="Paste a folder or file link if your notes live on OneDrive."
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: 14, sm: 15, md: 16 },
                      borderRadius: { xs: 2, sm: 2.5 },
                      bgcolor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(255,255,255,0.9)'
                          : 'rgba(15,23,42,0.6)',
                      '&:hover': {
                        bgcolor: (theme) =>
                          theme.palette.mode === 'light'
                            ? 'rgba(255,255,255,1)'
                            : 'rgba(15,23,42,0.8)'
                      },
                      '&.Mui-focused': {
                        bgcolor: (theme) =>
                          theme.palette.mode === 'light'
                            ? 'rgba(255,255,255,1)'
                            : 'rgba(15,23,42,0.9)'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: 14, sm: 15, md: 16 },
                      fontWeight: 600
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(148,163,184,0.3)'
                          : 'rgba(148,163,184,0.4)',
                      borderWidth: '1.5px'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(37,99,235,0.6)'
                          : 'rgba(96,165,250,0.8)'
                    },
                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(37,99,235,0.8)'
                          : 'rgba(96,165,250,0.9)',
                      borderWidth: '2px'
                    }
                  }}
                />
              </Grid>
            )}
            {mode === 'whatsapp' && (
              <Grid item xs={12} sm={12} md={6}>
                <TextField
                  fullWidth
                  id="whatsapp-only-link"
                  name="whatsappLink"
                  type="url"
                  label="WhatsApp Group Link (required)"
                  placeholder="https://chat.whatsapp.com/..."
                  value={form.whatsappLink}
                  onChange={handleChange}
                  required
                  helperText="WhatsApp group link for sharing notes and updates."
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: 14, sm: 15, md: 16 },
                      borderRadius: { xs: 2, sm: 2.5 },
                      bgcolor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(255,255,255,0.9)'
                          : 'rgba(15,23,42,0.6)',
                      '&:hover': {
                        bgcolor: (theme) =>
                          theme.palette.mode === 'light'
                            ? 'rgba(255,255,255,1)'
                            : 'rgba(15,23,42,0.8)'
                      },
                      '&.Mui-focused': {
                        bgcolor: (theme) =>
                          theme.palette.mode === 'light'
                            ? 'rgba(255,255,255,1)'
                            : 'rgba(15,23,42,0.9)'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: 14, sm: 15, md: 16 },
                      fontWeight: 600
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(148,163,184,0.3)'
                          : 'rgba(148,163,184,0.4)',
                      borderWidth: '1.5px'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(8,145,178,0.5)'
                          : 'rgba(56,189,248,0.6)'
                    },
                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(8,145,178,0.7)'
                          : 'rgba(56,189,248,0.8)',
                      borderWidth: '2px'
                    }
                  }}
                />
              </Grid>
            )}
            {mode === 'telegram' && (
              <Grid item xs={12} sm={12} md={6}>
                <TextField
                  fullWidth
                  id="telegram-link"
                  name="telegramLink"
                  type="url"
                  label="Telegram Group Link (required)"
                  placeholder="https://t.me/... or https://telegram.me/..."
                  value={form.telegramLink}
                  onChange={handleChange}
                  required
                  helperText="Telegram group link for sharing notes and updates."
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: 14, sm: 15, md: 16 },
                      borderRadius: { xs: 2, sm: 2.5 },
                      bgcolor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(255,255,255,0.9)'
                          : 'rgba(15,23,42,0.6)',
                      '&:hover': {
                        bgcolor: (theme) =>
                          theme.palette.mode === 'light'
                            ? 'rgba(255,255,255,1)'
                            : 'rgba(15,23,42,0.8)'
                      },
                      '&.Mui-focused': {
                        bgcolor: (theme) =>
                          theme.palette.mode === 'light'
                            ? 'rgba(255,255,255,1)'
                            : 'rgba(15,23,42,0.9)'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: 14, sm: 15, md: 16 },
                      fontWeight: 600
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(148,163,184,0.3)'
                          : 'rgba(148,163,184,0.4)',
                      borderWidth: '1.5px'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(8,145,178,0.5)'
                          : 'rgba(56,189,248,0.6)'
                    },
                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(8,145,178,0.7)'
                          : 'rgba(56,189,248,0.8)',
                      borderWidth: '2px'
                    }
                  }}
                />
              </Grid>
            )}
            {mode === 'whatsappChannel' && (
              <Grid item xs={12} sm={12} md={6}>
                <TextField
                  fullWidth
                  id="whatsapp-channel-link"
                  name="whatsappChannelLink"
                  type="url"
                  label="WhatsApp Channel Link (required)"
                  placeholder="https://whatsapp.com/channel/..."
                  value={form.whatsappChannelLink}
                  onChange={handleChange}
                  required
                  helperText="WhatsApp Channel link for broadcasting educational content."
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: 14, sm: 15, md: 16 },
                      borderRadius: { xs: 2, sm: 2.5 },
                      bgcolor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(255,255,255,0.9)'
                          : 'rgba(15,23,42,0.6)',
                      '&:hover': {
                        bgcolor: (theme) =>
                          theme.palette.mode === 'light'
                            ? 'rgba(255,255,255,1)'
                            : 'rgba(15,23,42,0.8)'
                      },
                      '&.Mui-focused': {
                        bgcolor: (theme) =>
                          theme.palette.mode === 'light'
                            ? 'rgba(255,255,255,1)'
                            : 'rgba(15,23,42,0.9)'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: 14, sm: 15, md: 16 },
                      fontWeight: 600
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(148,163,184,0.3)'
                          : 'rgba(148,163,184,0.4)',
                      borderWidth: '1.5px'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(8,145,178,0.5)'
                          : 'rgba(56,189,248,0.6)'
                    },
                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(8,145,178,0.7)'
                          : 'rgba(56,189,248,0.8)',
                      borderWidth: '2px'
                    }
                  }}
                />
              </Grid>
            )}
            {mode === 'youtube' && (
              <Grid item xs={12} sm={12} md={6}>
                <TextField
                  fullWidth
                  id="youtube-channel-link"
                  name="youtubeChannelLink"
                  type="url"
                  label="YouTube Channel Link (required)"
                  placeholder="https://youtube.com/@channel or https://youtube.com/channel/..."
                  value={form.youtubeChannelLink}
                  onChange={handleChange}
                  required
                  helperText="YouTube Channel link for educational videos and tutorials."
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: 14, sm: 15, md: 16 },
                      borderRadius: { xs: 2, sm: 2.5 },
                      bgcolor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(255,255,255,0.9)'
                          : 'rgba(15,23,42,0.6)',
                      '&:hover': {
                        bgcolor: (theme) =>
                          theme.palette.mode === 'light'
                            ? 'rgba(255,255,255,1)'
                            : 'rgba(15,23,42,0.8)'
                      },
                      '&.Mui-focused': {
                        bgcolor: (theme) =>
                          theme.palette.mode === 'light'
                            ? 'rgba(255,255,255,1)'
                            : 'rgba(15,23,42,0.9)'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: 14, sm: 15, md: 16 },
                      fontWeight: 600
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(148,163,184,0.3)'
                          : 'rgba(148,163,184,0.4)',
                      borderWidth: '1.5px'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(8,145,178,0.5)'
                          : 'rgba(56,189,248,0.6)'
                    },
                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(8,145,178,0.7)'
                          : 'rgba(56,189,248,0.8)',
                      borderWidth: '2px'
                    }
                  }}
                />
              </Grid>
            )}
            {mode === 'website' && (
              <Grid item xs={12} sm={12} md={6}>
                <TextField
                  fullWidth
                  id="website-link"
                  name="websiteLink"
                  type="url"
                  label="Education Website Link (required)"
                  placeholder="https://example.com or https://www.example.com"
                  value={form.websiteLink}
                  onChange={handleChange}
                  required
                  helperText="Link to an educational website that provides free learning resources."
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: 14, sm: 15, md: 16 },
                      borderRadius: { xs: 2, sm: 2.5 },
                      bgcolor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(255,255,255,0.9)'
                          : 'rgba(15,23,42,0.6)',
                      '&:hover': {
                        bgcolor: (theme) =>
                          theme.palette.mode === 'light'
                            ? 'rgba(255,255,255,1)'
                            : 'rgba(15,23,42,0.8)'
                      },
                      '&.Mui-focused': {
                        bgcolor: (theme) =>
                          theme.palette.mode === 'light'
                            ? 'rgba(255,255,255,1)'
                            : 'rgba(15,23,42,0.9)'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: 14, sm: 15, md: 16 },
                      fontWeight: 600
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(148,163,184,0.3)'
                          : 'rgba(148,163,184,0.4)',
                      borderWidth: '1.5px'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(8,145,178,0.5)'
                          : 'rgba(56,189,248,0.6)'
                    },
                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(8,145,178,0.7)'
                          : 'rgba(56,189,248,0.8)',
                      borderWidth: '2px'
                    }
                  }}
                />
              </Grid>
            )}

            {(mode === 'telegram' || mode === 'whatsappChannel' || mode === 'youtube' || mode === 'website') && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="description-other"
                  name="description"
                  label="Description (optional)"
                  placeholder="Short description about this group, channel, or website"
                  value={form.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  minRows={3}
                  maxRows={6}
                  helperText="Optional: Add a brief description to help students understand what this resource offers."
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: 14, sm: 15, md: 16 },
                      borderRadius: { xs: 2, sm: 2.5 },
                      bgcolor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(255,255,255,0.9)'
                          : 'rgba(15,23,42,0.6)',
                      '&:hover': {
                        bgcolor: (theme) =>
                          theme.palette.mode === 'light'
                            ? 'rgba(255,255,255,1)'
                            : 'rgba(15,23,42,0.8)'
                      },
                      '&.Mui-focused': {
                        bgcolor: (theme) =>
                          theme.palette.mode === 'light'
                            ? 'rgba(255,255,255,1)'
                            : 'rgba(15,23,42,0.9)'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: 14, sm: 15, md: 16 },
                      fontWeight: 600
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(148,163,184,0.3)'
                          : 'rgba(148,163,184,0.4)',
                      borderWidth: '1.5px'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(8,145,178,0.5)'
                          : 'rgba(56,189,248,0.6)'
                    },
                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'light'
                          ? 'rgba(8,145,178,0.7)'
                          : 'rgba(56,189,248,0.8)',
                      borderWidth: '2px'
                    }
                  }}
                />
              </Grid>
            )}
          </Grid>
        )}

        {mode === 'uni' && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="University name"
                id="universityName"
                name="universityName"
                placeholder="e.g. University of Colombo"
                value={form.universityName}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="uni-year-label" sx={{ fontSize: { xs: 14, sm: 15, md: 16 }, fontWeight: 600 }}>Year</InputLabel>
                <Select
                  labelId="uni-year-label"
                  id="uni-year"
                  name="grade"
                  label="Year"
                  value={form.grade}
                  onChange={handleChange}
                >
                  <MenuItem value="">
                    <em>Year</em>
                  </MenuItem>
                  <MenuItem value="1">Year 1</MenuItem>
                  <MenuItem value="2">Year 2</MenuItem>
                  <MenuItem value="3">Year 3</MenuItem>
                  <MenuItem value="4">Year 4</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="uni-medium-label" sx={{ fontSize: { xs: 14, sm: 15, md: 16 }, fontWeight: 600 }}>Medium</InputLabel>
                <Select
                  labelId="uni-medium-label"
                  id="uni-medium"
                  name="medium"
                  label="Medium"
                  value={form.medium}
                  onChange={handleChange}
                >
                  <MenuItem value="">
                    <em>Select medium</em>
                  </MenuItem>
                  <MenuItem value="Sinhala">Sinhala Medium</MenuItem>
                  <MenuItem value="Tamil">Tamil Medium</MenuItem>
                  <MenuItem value="English">English Medium</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="uni-whatsapp"
                name="whatsappLink"
                type="url"
                label="WhatsApp Group Link (required)"
                placeholder="https://chat.whatsapp.com/..."
                value={form.whatsappLink}
                onChange={handleChange}
                required
                helperText="University WhatsApp group link for this batch or faculty."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                placeholder="Short description (e.g. CS Department – Year 2 resource sharing group)"
                value={form.description}
                onChange={handleChange}
                multiline
                rows={3}
                minRows={3}
                maxRows={6}
              />
            </Grid>
          </Grid>
        )}

        </Box>

        {/* Submit Button Section */}
        <Box
          sx={{
            mt: { xs: 4, sm: 4.5, md: 5 },
            display: 'flex',
            justifyContent: 'center',
            px: { xs: 1, sm: 0 }
          }}
        >
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isUploading || (mode === 'file' && !form.file)}
            fullWidth
            sx={{
              maxWidth: { xs: '100%', sm: '500px', md: '600px' },
              px: { xs: 4, sm: 5, md: 6 },
              py: { xs: 1.5, sm: 1.6, md: 1.8 },
              borderRadius: { xs: 3, sm: 3.5, md: 999 },
              fontSize: { xs: 15, sm: 16, md: 17 },
              fontWeight: 800,
              letterSpacing: { xs: 0.5, sm: 0.8, md: 1 },
              textTransform: 'none',
              backgroundImage: 'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #4ade80 100%)',
              boxShadow: (theme) =>
                theme.palette.mode === 'light'
                  ? '0 20px 40px rgba(22,163,74,0.4), 0 0 0 1px rgba(22,163,74,0.1)'
                  : '0 20px 40px rgba(22,163,74,0.6), 0 0 0 1px rgba(34,197,94,0.2)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                transition: 'left 0.5s ease'
              },
              '&:hover': {
                backgroundImage: 'linear-gradient(135deg, #15803d 0%, #16a34a 50%, #22c55e 100%)',
                transform: 'translateY(-3px) scale(1.02)',
                boxShadow: (theme) =>
                  theme.palette.mode === 'light'
                    ? '0 24px 48px rgba(22,163,74,0.5), 0 0 0 1px rgba(22,163,74,0.2)'
                    : '0 24px 48px rgba(22,163,74,0.7), 0 0 0 1px rgba(34,197,94,0.3)',
                '&::before': {
                  left: '100%'
                }
              },
              '&:active': {
                transform: 'translateY(-1px) scale(0.98)'
              },
              '&:disabled': {
                backgroundImage: 'linear-gradient(135deg, #94a3b8, #cbd5e1)',
                color: '#64748b',
                boxShadow: 'none',
                transform: 'none'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {isUploading ? `⏳ Uploading... ${uploadProgress}%` : mode === 'file' ? '📤 Upload File' : '✨ Submit Donation'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}


