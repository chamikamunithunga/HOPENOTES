import React, { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import heroLogoImage from '../images/Adobe Express - file.png';
import promoImage from '../images/Gemini_Generated_Image_df35vwdf35vwdf35 (1).png';
import imgOne from '../images/06.jpg';
import imgTwo from '../images/6742.webp';
import imgThree from '../images/Cyclone Ditwah Sri Lanka.webp';
import imgFour from '../images/download.jpeg';
import imgFive from '../images/ff.avif';
import imgSix from '../images/ad54f937-848f-4df3-87ad-735e6e09d2ff_00aa9dc2.jpg';

export function Hero({ stats }) {
  const totalResources = stats.notes + stats.whatsapp + stats.university;
  const slideshowImages = [imgOne, imgTwo, imgThree, imgFour, imgFive, imgSix];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!slideshowImages.length) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideshowImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Full-screen image slideshow hero */}
    <Box
      id="top"
        sx={{
          position: 'relative',
          py: { xs: 6, sm: 8, md: 10, lg: 10 },
          px: { xs: 1, sm: 2 },
          minHeight: { xs: '40vh', sm: '50vh', md: '60vh', lg: '70vh' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: `url(${slideshowImages[currentIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: { xs: 'scroll', md: 'fixed' },
          transition: 'background-image 900ms ease-out'
        }}
      />

      {/* Text and live snapshot content below the slideshow */}
      <Box
      sx={{
        pt: { xs: 2, sm: 3, md: 4, lg: 1 },
        pb: { xs: 3, sm: 4, md: 4, lg: 6 },
          px: { xs: 1.5, sm: 2, md: 2 },
          bgcolor: (theme) =>
            theme.palette.mode === 'light'
              ? 'linear-gradient(to bottom, rgba(248, 250, 252, 0), rgba(241, 245, 249, 0))'
              : 'linear-gradient(to bottom, rgba(15,23,42,1), rgba(15,23,42,0.98))'
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 3, sm: 4, md: 4, lg: 5 }
          }}
        >
          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: { xs: 0.8, sm: 1.2, md: 1.6, lg: 2.2 },
                mb: { xs: 2, sm: 2.5, md: 4, lg: 5 },
                flexWrap: 'wrap',
                mt: { xs: 0, sm: 0, md: 1, lg: 1 },
                px: { xs: 1, sm: 0 }
              }}
            >
              <Box
                component="img"
                src={heroLogoImage}
                alt="HopeNotes Logo"
                sx={{
                  width: { xs: 48, sm: 56, md: 72, lg: 96 },
                  height: { xs: 48, sm: 56, md: 72, lg: 96 },
                  objectFit: 'contain',
                  flexShrink: 0,
                  display: 'block'
                }}
              />
              <Typography
                component="div"
                sx={{
                  fontFamily: '"Poppins", "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  letterSpacing: { xs: 2, sm: 3, md: 6, lg: 10 },
                  fontWeight: 900,
                  fontSize: { xs: 20, sm: 26, md: 36, lg: 48 },
                  textTransform: 'uppercase',
                  background: (theme) =>
                    theme.palette.mode === 'light'
                      ? 'linear-gradient(135deg, #0f172a 0%, #1e40af 25%, #0891b2 50%, #0f766e 75%, #22c55e 100%)'
                      : 'linear-gradient(135deg, #e5e7eb 0%, #7dd3fc 25%, #34d399 50%, #6ee7b7 75%, #a5f3fc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: (theme) =>
                    theme.palette.mode === 'light'
                      ? '0 4px 12px rgba(8,145,178,0.4), 0 8px 24px rgba(15,23,42,0.2)'
                      : '0 4px 12px rgba(125,211,252,0.5), 0 8px 24px rgba(0,0,0,0.4)',
                  filter: 'drop-shadow(0 2px 4px rgba(8,145,178,0.3))',
                  position: 'relative',
                  wordBreak: 'break-word',
                  display: 'block',
                  textAlign: 'center',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: (theme) =>
                      theme.palette.mode === 'light'
                        ? 'linear-gradient(135deg, rgba(8,145,178,0.1) 0%, transparent 50%)'
                        : 'linear-gradient(135deg, rgba(125,211,252,0.15) 0%, transparent 50%)',
                    borderRadius: '8px',
                    zIndex: -1
                  }
                }}
              >
                HOPE NOTES
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 1.2, sm: 1.5, md: 1.5 }, flexWrap: 'wrap' }}>
              <Chip
                label="Disaster Relief • Sri Lanka"
                sx={{
                borderRadius: 999,
                fontSize: { xs: 11, sm: 12, md: 12 },
                fontWeight: 600,
                px: { xs: 1.2, sm: 1.4, md: 1.4 },
                py: { xs: 0.5, sm: 0.6, md: 0.6 },
                bgcolor: (theme) =>
                  theme.palette.mode === 'light'
                      ? 'rgba(34,197,94,0.15)'
                      : 'rgba(16,185,129,0.25)',
                  color: (theme) =>
                    theme.palette.mode === 'light' ? '#0f766e' : '#6ee7b7',
                  boxShadow: (theme) =>
                  theme.palette.mode === 'light'
                      ? '0 4px 12px rgba(34,197,94,0.2)'
                      : '0 4px 12px rgba(16,185,129,0.3)'
                }}
              />
            </Box>

            <Typography
              component="h1"
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: { xs: 1.5, sm: 2, md: 2 },
                fontSize: { xs: 22, sm: 26, md: 32, lg: 38 },
                lineHeight: { xs: 1.3, sm: 1.25, md: 1.25 },
                color: (theme) =>
                  theme.palette.mode === 'light'
                    ? '#0f172a'
                    : '#f9fafb',
                textShadow: (theme) =>
                  theme.palette.mode === 'light'
                    ? '0 2px 8px rgba(15,23,42,0.1)'
                    : '0 2px 8px rgba(0,0,0,0.3)',
                textAlign: 'center',
                px: { xs: 1, sm: 0 }
              }}
            >
              Rebuilding Education, One Note at a Time
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: (theme) =>
                  theme.palette.mode === 'light'
                    ? '#1e293b'
                    : '#e5e7eb',
                mb: { xs: 1.5, sm: 2, md: 2 },
                fontWeight: 600,
                fontSize: { xs: 14, sm: 15, md: 15.5, lg: 16 },
                lineHeight: { xs: 1.6, sm: 1.7, md: 1.7 },
                textAlign: 'center',
                px: { xs: 1, sm: 0 }
              }}
            >
              No logins. No fees. Just hope. Every note, link, and study group on HopeNotes is
              completely free for any student in Sri Lanka who needs to keep learning today and
              in the years ahead.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: (theme) =>
                  theme.palette.mode === 'light'
                    ? '#334155'
                    : '#cbd5e1',
                mb: { xs: 1.5, sm: 2, md: 2 },
                fontSize: { xs: 13.5, sm: 14.5, md: 15, lg: 15.5 },
                lineHeight: { xs: 1.7, sm: 1.8, md: 1.8 },
                fontWeight: 500,
                textAlign: 'center',
                px: { xs: 1, sm: 0 }
              }}
            >
              Logins අනවශ්‍යයි. ගාස්තු අය නොකෙරේ. ඇත්තේ බලාපොරොත්තුවක් පමණයි. අදත්, ඉදිරි වසරවලදීත්
              තම අධ්‍යාපන කටයුතු අඛණ්ඩව කරගෙන යාමට වෙර දරන ශ්‍රී ලංකාවේ ඕනෑම සිසුවෙකුට, HopeNotes හි
              ඇති සියලුම පාඩම් සටහන් (Notes), සබැඳි (Links) සහ අධ්‍යයන කණ්ඩායම් (Study Groups)
              සම්පූර්ණයෙන්ම නොමිලේ.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: (theme) =>
                  theme.palette.mode === 'light'
                    ? '#334155'
                    : '#cbd5e1',
                mb: { xs: 1.5, sm: 2, md: 2 },
                fontSize: { xs: 13.5, sm: 14.5, md: 15, lg: 15.5 },
                lineHeight: { xs: 1.7, sm: 1.8, md: 1.8 },
                fontWeight: 500,
                textAlign: 'center',
                px: { xs: 1, sm: 0 }
              }}
            >
              Loginகள் தேவையில்லை. கட்டணங்கள் இல்லை. நம்பிக்கை மட்டுமே. இன்றும் எதிர்காலத்திலும் தங்கள்
              கல்வியைத் தொடர விரும்பும் இலங்கையின் அனைத்து மாணவர்களுக்கும், HopeNotes-ல் உள்ள அனைத்து
              குறிப்புகள் (Notes), இணைப்புகள் (Links) மற்றும் ஆய்வுக் குழுக்கள் (Study Groups) அனைத்தும்
              முற்றிலும் இலவசம்.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: (theme) =>
                  theme.palette.mode === 'light'
                    ? '#334155'
                    : '#cbd5e1',
                mb: { xs: 1.5, sm: 2, md: 2 },
                fontSize: { xs: 13.5, sm: 14.5, md: 15, lg: 15.5 },
                lineHeight: { xs: 1.7, sm: 1.8, md: 1.8 },
                fontWeight: 500,
                textAlign: 'center',
                px: { xs: 1, sm: 0 }
              }}
            >
              ගංවතුර සහ ආපදා නිසා පොත්පත්, පන්ති කාමර ගසාගෙන ගියත්, දරුවන්ගේ ඉගෙනීම නතර වන්නට HopeNotes
              ඉඩ තබන්නේ නැත. සිසුන්ට තම අධ්‍යාපන කටයුතු යළි ගොඩනගා ගැනීම සඳහා අත්‍යවශ්‍ය වන නිවැරදිම පාඩම්
              සටහන් (Notes) සහ ප්‍රශ්න පත්‍ර, අපගේ ස්වෙච්ඡා සේවකයින් විසින් පියවරෙන් පියවර මෙහි අන්තර්ගත
              කරනු ලබයි.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: (theme) =>
                  theme.palette.mode === 'light'
                    ? '#334155'
                    : '#cbd5e1',
                mb: { xs: 2, sm: 2.5, md: 2.5 },
                fontSize: { xs: 13.5, sm: 14.5, md: 15, lg: 15.5 },
                lineHeight: { xs: 1.7, sm: 1.8, md: 1.8 },
                fontWeight: 500,
                textAlign: 'center',
                px: { xs: 1, sm: 0 }
              }}
            >
              வெள்ளம் மற்றும் அனர்த்தங்கள் புத்தகங்களையும் வகுப்பறைகளையும் அடித்துச் சென்றாலும், கற்றல்
              ஒருபோதும் தடைபடாது என்பதை HopeNotes உறுதி செய்கிறது. மாணவர்கள் தங்கள் கல்வியை மீண்டும்
              கட்டியெழுப்பத் தேவையான துல்லியமான பாடக் குறிப்புகள் (Notes) மற்றும் வினாத்தாள்களை, எமது
              தன்னார்வலர்கள் சிறுகச் சிறுக இங்கே பதிவேற்றுகிறார்கள்.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: (theme) =>
                  theme.palette.mode === 'light'
                    ? '#1e293b'
                    : '#e5e7eb',
                maxWidth: { xs: '100%', sm: 580, md: 600, lg: 650 },
                mb: { xs: 1.5, sm: 2, md: 2 },
                fontSize: { xs: 14.5, sm: 15.5, md: 16, lg: 16.5 },
                lineHeight: { xs: 1.7, sm: 1.75, md: 1.75 },
                fontWeight: 500,
                textAlign: 'center',
                mx: 'auto',
                px: { xs: 1, sm: 0 }
              }}
            >
              When floods and disasters wash away books and classrooms, HopeNotes makes sure
              the learning itself is never lost. Volunteers upload the exact notes and papers
              students need to rebuild their education, one small step at a time.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: (theme) =>
                  theme.palette.mode === 'light'
                    ? '#0f766e'
                    : '#6ee7b7',
                mb: { xs: 2, sm: 2.5, md: 2.5 },
                fontSize: { xs: 14.5, sm: 15.5, md: 15.5, lg: 16 },
                fontWeight: 600,
                fontStyle: 'italic',
                textAlign: 'center',
                px: { xs: 1, sm: 0 }
              }}
            >
              From village schools to city universities, every shared note is a quiet act of
              kindness after the storm.
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'center',
                alignItems: 'center',
                gap: { xs: 1, sm: 1.5, md: 1.5 },
                mt: { xs: 1.5, sm: 2, md: 2 },
                pt: { xs: 2, sm: 2.5, md: 2.5 },
                px: { xs: 1, sm: 0 },
                borderTop: (theme) =>
                  theme.palette.mode === 'light'
                    ? '1px solid rgba(148,163,184,0.2)'
                    : '1px solid rgba(148,163,184,0.3)'
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: 13.5, sm: 14.5, md: 14.5, lg: 15 },
                  fontWeight: 600,
                  color: (theme) =>
                    theme.palette.mode === 'light'
                      ? '#1e293b'
                      : '#e5e7eb',
                  textAlign: 'center'
                }}
              >
                🎓 Students: Download notes and join study groups for free
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: 13.5, sm: 14.5, md: 14.5, lg: 15 },
                  fontWeight: 600,
                  color: (theme) =>
                    theme.palette.mode === 'light'
                      ? '#1e293b'
                      : '#e5e7eb',
                  textAlign: 'center'
                }}
              >
                🤝 Volunteers: Upload your notes or share links to support recovery
              </Typography>
            </Box>
          </Box>

            {/* Live Snapshot Section with Promo Image - Side by Side */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'center',
                alignItems: { xs: 'center', md: 'center' },
                gap: { xs: 2, sm: 2.5, md: 2.5, lg: 3 },
                width: '100%',
                maxWidth: { xs: '100%', md: '900px', lg: '1000px' },
                mx: 'auto'
              }}
            >
              {/* Live Snapshot Box - Left Side */}
              <Box
                sx={{
                  borderRadius: { xs: 2, sm: 2.5, md: 3 },
                  p: { xs: 2, sm: 2.5, md: 2.5, lg: 3 },
                bgcolor: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'rgba(15,23,42,0.92)'
                      : 'rgba(6, 15, 25, 0.95)',
                  backdropFilter: 'blur(20px)',
                  color: 'rgba(241,245,249,0.98)',
                  width: { xs: '100%', md: '45%' },
                  maxWidth: { xs: '100%', md: '400px' },
                boxShadow: (theme) =>
                  theme.palette.mode === 'light'
                      ? '0 20px 40px rgba(15,23,42,0.5)'
                      : '0 20px 40px rgba(0,0,0,0.8)',
                  textAlign: 'center',
                  mx: { xs: 1, sm: 0 },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    opacity: 0.9,
                    mb: { xs: 0.6, sm: 0.8, md: 0.8 },
                    fontSize: { xs: 11, sm: 12, md: 12, lg: 13 },
                    fontWeight: 600,
                    letterSpacing: 0.5
                  }}
                >
                Live snapshot
              </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    mb: { xs: 1, sm: 1.5, md: 1.5 },
                    fontSize: { xs: 16, sm: 18, md: 19, lg: 20 },
                    fontWeight: 700
                  }}
                >
                Students catching up today
              </Typography>
                <Typography
                  variant="h2"
                  sx={{
                    color: '#22c55e',
                    fontWeight: 800,
                    mb: { xs: 1, sm: 1.5, md: 1.5 },
                    fontSize: { xs: 28, sm: 32, md: 36, lg: 42 },
                    textShadow: '0 4px 20px rgba(34,197,94,0.4)'
                  }}
                >
                  {totalResources > 0 ? `${totalResources * 3}+` : '–'}
              </Typography>
              <Typography
                  variant="body2"
                  sx={{
                    display: 'block',
                    color: 'rgba(148,163,184,0.95)',
                    fontSize: { xs: 11, sm: 12, md: 12, lg: 13 },
                    lineHeight: { xs: 1.4, sm: 1.5, md: 1.5 },
                    px: { xs: 0.5, sm: 0 }
                  }}
                >
                  Counting shared notes, WhatsApp study groups, and university links uploaded so far.
              </Typography>
            </Box>

              {/* Promo Image - Right Side */}
              <Box
              sx={{
                  width: { xs: '100%', md: '55%' },
                  maxWidth: { xs: '100%', md: '500px' },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: { xs: 1, sm: 0 }
                }}
              >
                <Box
                  component="img"
                  src={promoImage}
                  alt="HopeNotes - Share knowledge, Spread hope"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: { xs: '300px', sm: '350px', md: '380px', lg: '420px' },
                    objectFit: 'contain',
                    borderRadius: { xs: 3, sm: 4, md: 5, lg: 6 }
                  }}
                />
              </Box>
          </Box>
        </Box>
      </Container>
    </Box>
    </>
  );
}


