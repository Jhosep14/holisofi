(function () {
  'use strict';

  let overlay;
  let dialog;
  let iframeEl;
  let loadingEl;
  let titleEl;
  let closeBtn;
  let fullscreenBtn;

  let currentPlaylist = [];
  let currentIndex = -1;
  let currentQuality = 'auto';

  function extractVideoId(href) {
    if (!href) return null;
    const patterns = [
      /ok\.ru\/video\/(\d+)/i,
      /ok\.ru\/videoembed\/(\d+)/i
    ];

    for (const pattern of patterns) {
      const match = String(href).match(pattern);
      if (match) return match[1];
    }

    return null;
  }

  function buildEmbedUrl(href) {
    const videoId = extractVideoId(href);
    if (!videoId) return href || '';

    const params = new URLSearchParams({ autoplay: '1' });
    if (currentQuality && currentQuality !== 'auto') params.set('quality', currentQuality);
    return 'https://ok.ru/videoembed/' + videoId + '?' + params.toString();
  }

  function resolveRefs() {
    overlay = document.getElementById('player-overlay');
    dialog = document.getElementById('player-dialog');
    iframeEl = document.getElementById('player-iframe');
    loadingEl = document.getElementById('player-loading');
    titleEl = document.getElementById('player-ep-title');
    closeBtn = document.getElementById('player-close-btn');
    fullscreenBtn = document.getElementById('player-fullscreen-btn');
  }

  function playEpisode(index) {
    if (!iframeEl || index < 0 || index >= currentPlaylist.length) return;
    currentIndex = index;
    const ep = currentPlaylist[index];
    const url = buildEmbedUrl(ep.href);

    if (titleEl) titleEl.textContent = ep.html_title || ep.title || '';
    if (loadingEl) loadingEl.classList.remove('hidden');

    iframeEl.onload = () => {
      if (loadingEl) loadingEl.classList.add('hidden');
    };

    iframeEl.src = '';
    setTimeout(() => {
      iframeEl.src = url || ep.href || '';
      setTimeout(() => {
        if (loadingEl) loadingEl.classList.add('hidden');
      }, 5000);
    }, 60);
  }

  function openPlayer(playlist, startIndex) {
    if (!overlay) resolveRefs();
    if (!overlay || !playlist || !playlist.length) return;

    currentPlaylist = playlist;
    currentIndex = -1;
    currentQuality = 'auto';

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    playEpisode(startIndex);
  }

  function closePlayer() {
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    if (iframeEl) iframeEl.src = '';
    currentPlaylist = [];
    currentIndex = -1;
  }

  function initEvents() {
    resolveRefs();

    if (closeBtn) closeBtn.addEventListener('click', closePlayer);

    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => {
        const target = dialog || overlay;
        if (!target) return;

        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          target.requestFullscreen().catch(() => {});
        }
      });
    }

    if (overlay) {
      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) closePlayer();
      });
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && overlay && overlay.classList.contains('active')) {
        closePlayer();
      }
    });
  }

  window.SofiPlayer = {
    open: openPlayer,
    close: closePlayer,
    initEvents: initEvents
  };

  document.addEventListener('DOMContentLoaded', initEvents);
})();
