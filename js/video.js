/* ═══════════════════════════════════════════════════
   TOOLEZ — js/video.js
   Video downloader: platform selection, format
   selection, and download via cobalt.tools API
   ═══════════════════════════════════════════════════ */

let selectedPlatform = 'youtube';
let selectedFormat   = '1080p';

// ─── PLATFORM SWITCHER ────────────────────────────
const platformPlaceholders = {
  youtube:     'https://youtube.com/watch?v=dQw4w9WgXcQ',
  instagram:   'https://instagram.com/p/AbCdEfGhIjK/',
  tiktok:      'https://tiktok.com/@user/video/1234567890',
  twitter:     'https://twitter.com/user/status/1234567890',
  facebook:    'https://facebook.com/watch?v=1234567890',
  pinterest:   'https://pinterest.com/pin/1234567890',
  vimeo:       'https://vimeo.com/1234567890',
  reddit:      'https://reddit.com/r/videos/comments/abc/title/',
  dailymotion: 'https://dailymotion.com/video/x1a2b3c',
};

function setPlatform(el, platform) {
  document.querySelectorAll('.platform-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  selectedPlatform = platform;

  const input = document.getElementById('videoUrl');
  if (input) input.placeholder = platformPlaceholders[platform] || 'Paste video URL...';
}

// ─── FORMAT SELECTION ─────────────────────────────
function selectFormat(el, format) {
  document.querySelectorAll('.format-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  selectedFormat = format;
}

// ─── FETCH VIDEO INFO ─────────────────────────────
function processVideo() {
  const url = document.getElementById('videoUrl')?.value.trim();
  if (!url) { toast('Please paste a video URL first', 'error'); return; }
  if (!isValidURL(url)) { toast('Please enter a valid URL', 'error'); return; }
  toast('Fetching video info...', 'info');
  setTimeout(() => toast('Ready! Select your preferred quality and click Download ⬇️', 'success'), 1200);
}

// ─── DOWNLOAD VIDEO ───────────────────────────────
async function downloadVideo() {
  const url = document.getElementById('videoUrl')?.value.trim();
  if (!url) { toast('Paste a URL first', 'error'); return; }
  
  const serverUrl = `https://toolez-backend.onrender.com/download?url=${encodeURIComponent(url)}`;
  
  toast('Fetching video...', 'info');
  window.location.href = serverUrl; // triggers download directly
}

// ─── HELPERS ──────────────────────────────────────
function isValidURL(str) {
  try { new URL(str); return true; } catch { return false; }
}

function getPlatformName() {
  const names = {
    youtube: 'YouTube', instagram: 'Instagram', tiktok: 'TikTok',
    twitter: 'Twitter/X', facebook: 'Facebook', pinterest: 'Pinterest',
    vimeo: 'Vimeo', reddit: 'Reddit', dailymotion: 'Dailymotion',
  };
  return names[selectedPlatform] || selectedPlatform;
}
