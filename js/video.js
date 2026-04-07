/* ═══════════════════════════════════════════════════
   TOOLEZ — js/video.js
   Calls our own Render backend
   ═══════════════════════════════════════════════════ */

// ─── YOUR RENDER SERVER URL ───────────────────────
const SERVER_URL = 'https://toolez-backend.onrender.com';

let selectedPlatform = 'youtube';
let selectedFormat   = '1080p';

// ─── PLATFORM SWITCHER ────────────────────────────
const platformPlaceholders = {
  youtube:     'https://youtube.com/watch?v=dQw4w9WgXcQ',
  instagram:   'https://instagram.com/reel/AbCdEf/',
  tiktok:      'https://tiktok.com/@user/video/1234567890',
  twitter:     'https://twitter.com/user/status/1234567890',
  facebook:    'https://facebook.com/watch?v=1234567890',
  pinterest:   'https://pinterest.com/pin/1234567890',
  vimeo:       'https://vimeo.com/1234567890',
  reddit:      'https://reddit.com/r/videos/comments/abc/',
  dailymotion: 'https://dailymotion.com/video/x1a2b3c',
};

function setPlatform(el, platform) {
  document.querySelectorAll('.platform-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  selectedPlatform = platform;
  const input = document.getElementById('videoUrl');
  if (input) input.placeholder = platformPlaceholders[platform] || 'Paste video URL...';
}

function selectFormat(el, format) {
  document.querySelectorAll('.format-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  selectedFormat = format;
}

function processVideo() {
  const url = document.getElementById('videoUrl')?.value.trim();
  if (!url) { toast('Please paste a video URL first', 'error'); return; }
  toast('Ready! Click Download to start ⬇️', 'success');
}

// ─── MAIN DOWNLOAD ────────────────────────────────
async function downloadVideo() {
  const url = document.getElementById('videoUrl')?.value.trim();
  if (!url) { toast('Please paste a video URL first', 'error'); return; }

  try { new URL(url); } catch {
    toast('Please enter a valid URL', 'error'); return;
  }

  // Hide old result
  hideResult();

  // Button loading
  const btn = document.getElementById('dlBtn');
  if (btn) {
    btn.innerHTML = '⏳ Fetching...';
    btn.disabled = true;
  }

  const qualityMap = {
    '1080p': '1080',
    '720p':  '720',
    '480p':  '480',
    '360p':  '360',
    'audio': 'audio',
    'webm':  '1080',
  };

  const quality     = qualityMap[selectedFormat] || '720';
  const isAudioOnly = selectedFormat === 'audio';

  try {
    toast('Connecting to server...', 'info');

    const response = await fetch(`${SERVER_URL}/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url:       url,
        quality:   quality,
        audioOnly: isAudioOnly,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Server response:', data);

    if (data.status === 'stream' ||
        data.status === 'redirect' ||
        data.status === 'tunnel') {

      // ✅ Direct download link ready
      showResult(data.url, isAudioOnly, url);
      toast('Video ready! Click the button to download ✅', 'success');

    } else if (data.status === 'picker') {

      // Multiple files (e.g. Instagram carousel)
      if (data.picker?.length > 0) {
        showResult(data.picker[0].url, isAudioOnly, url);
        toast(`Found ${data.picker.length} file(s) — downloading first`, 'success');
      } else {
        toast('No downloadable video found', 'error');
      }

    } else if (data.status === 'error') {

      showError(data.error?.code, url);

    } else {
      toast('Could not process this URL. Try another.', 'error');
    }

  } catch (err) {
    console.error('Download failed:', err);

    if (err.message.includes('Failed to fetch') ||
        err.message.includes('NetworkError')) {
      toast('Server is waking up (free tier takes ~30s). Please try again!', 'info');
    } else {
      toast('Error: ' + err.message, 'error');
    }
  }

  // Reset button
  if (btn) {
    btn.innerHTML = '⬇️ Download Video';
    btn.disabled = false;
  }
}

// ─── SHOW RESULT BOX ──────────────────────────────
function showResult(downloadUrl, isAudio, originalUrl) {
  const box    = document.getElementById('dlResult');
  const link   = document.getElementById('dlLink');
  const label  = document.getElementById('dlTitle');

  if (!box || !link) return;

  link.href        = downloadUrl;
  link.textContent = isAudio
    ? '⬇️ Download Audio (MP3)'
    : '⬇️ Download Video (MP4)';

  try {
    const domain = new URL(originalUrl).hostname.replace('www.','');
    if (label) label.textContent = `Source: ${domain}`;
  } catch {}

  box.style.display = 'block';
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideResult() {
  const box = document.getElementById('dlResult');
  if (box) box.style.display = 'none';
}

// ─── ERROR MESSAGES ───────────────────────────────
function showError(code, url) {
  const messages = {
    'error.api.link.unsupported':    'This platform is not supported.',
    'error.api.content.unavailable': 'This video is private or deleted.',
    'error.api.content.age':         'Age-restricted — cannot download.',
    'error.api.youtube.decipher':    'YouTube blocked this. Try again in 1 min.',
    'error.api.youtube.login':       'This video requires YouTube login.',
    'error.api.fetch.empty':         'No video found at this URL.',
  };
  const msg = messages[code] || 'Could not download this video. Try another URL.';
  toast(msg, 'error');
}
