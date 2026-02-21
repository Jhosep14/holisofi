const state = {
  groups: [],
  group: null,
  episodes: [],
  filteredEpisodes: [],
  seasonFilter: 'all',
  search: '',
  selectedEpisodeHref: null
};

const refs = {
  detailBg: document.querySelector('#detail-bg'),
  detailTitle: document.querySelector('#detail-title'),
  detailMeta: document.querySelector('#detail-meta'),
  detailGenres: document.querySelector('#detail-genres'),
  detailCast: document.querySelector('#detail-cast'),
  detailSummary: document.querySelector('#detail-summary'),
  addLibrary: document.querySelector('#add-library'),
  watchTrailer: document.querySelector('#watch-trailer'),
  favBtn: document.querySelector('#fav-btn'),
  seasonSelect: document.querySelector('#season-select'),
  episodeSearch: document.querySelector('#episode-search'),
  prevEpisode: document.querySelector('#prev-episode'),
  nextEpisode: document.querySelector('#next-episode'),
  episodesList: document.querySelector('#episodes-list'),
  episodeTemplate: document.querySelector('#episode-template'),
  playerModal: document.querySelector('#player-modal'),
  closePlayer: document.querySelector('#close-player'),
  playerFrame: document.querySelector('#player-frame')
};

function normalize(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function hashText(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function parseSeasonNumber(title) {
  const value = normalize(title);
  const match =
    value.match(/\b(?:temporada|season|temp)\s*(\d{1,2})\b/i) ||
    value.match(/\bt\s*(\d{1,2})\b/i) ||
    value.match(/\bt(\d{1,2})\b/i) ||
    value.match(/\bs\s*(\d{1,2})\b/i) ||
    String(title || '').match(/\[\s*S(\d{1,2})\b/i);

  return match ? Number.parseInt(match[1], 10) : null;
}

function parseChapterRange(title) {
  const value = normalize(title);
  const match =
    value.match(/cap(?:itulo)?\s*del\s*(\d{1,4})\s*al\s*(\d{1,4})/i) ||
    value.match(/(?:cap(?:itulo)?|epis(?:odio)?|ep)\s*(\d{1,4})\s*(?:-|–|a|al|y)\s*(\d{1,4})/i) ||
    value.match(/(?:cap(?:itulo)?|epis(?:odio)?|ep)\s*(\d{1,4})/i) ||
    value.match(/(\d{1,4})\s*(?:-|–|a|al)\s*(\d{1,4})(?!.*\d)/i);

  if (!match) return null;
  const first = Number.parseInt(match[1], 10);
  const second = Number.parseInt(match[2] || match[1], 10);
  if (Number.isNaN(first) || Number.isNaN(second) || Math.abs(second - first) > 600) return null;
  return { start: Math.min(first, second), end: Math.max(first, second) };
}

function parsePart(title) {
  const value = normalize(title);
  const match = value.match(/\b(?:parte|part|pt)\.?\s*(\d{1,2})/i);
  return {
    part: match ? Number.parseInt(match[1], 10) : null,
    isFinal: /\bfinal\b/i.test(value)
  };
}

function resolveCanonical(rawName) {
  const norm = String(rawName || '').trim().toLowerCase();

  if (ALIAS_MAP[norm]) {
    // Return a URL-friendly ID of the real name, so it merges perfectly
    return ALIAS_MAP[norm].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  // fallback for unknown un-mapped aliases
  return norm.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'other';
}

function prettifyName(key, fallback) {
  // Display the real name from the alias map when available
  const norm = String(fallback || '').trim().toLowerCase();
  if (ALIAS_MAP[norm]) return ALIAS_MAP[norm];
  if (fallback) return fallback;
  return key;
}

const MOVIE_TITLES = new Set([
  "The Amazing Spider-Man", "Captain America: Civil War", "Doctor Strange",
  "Suicide Squad", "Ghost in the Shell", "Iron Man", "The Avengers", "Spider-Man",
  "Kong: Skull Island", "Godzilla vs. Kong", "Dragon Ball Z: Broly - The Legendary Super Saiyan",
  "Dragon Ball Z: Bojack Unbound", "Brokeback Mountain", "The Matrix", "Cars",
  "Jingle All the Way", "Rise of the Guardians", "Monsters vs. Aliens", "Ant-Man",
  "Alien", "The Conjuring", "It", "Saw", "Megamind", "The Incredible Hulk",
  "Rambo", "Avengers: Age of Ultron", "Knowing", "Godzilla",
  "Maquia: When the Promised Flower Blooms", "A Silent Voice",
  "Weathering with You", "I Want to Eat Your Pancreas", "Wolf Children", "Codigo Traje Rojo"
]);

function getCategoryFromVotes(votes, name) {
  if (MOVIE_TITLES.has(name)) return 'Peliculas y Series';
  const entries = Object.entries(votes).sort((a, b) => b[1] - a[1]);
  return entries[0] ? entries[0][0] : 'Other';
}

function deriveBucket(group, episode) {
  const title = normalize(episode.rawTitle || episode.title);

  if (group.id === 'dragon-ball') {
    if (/\bgt\b/.test(title)) return { key: 'db-gt', label: 'Dragon Ball GT', order: 2 };
    if (/zuper|super/.test(title)) return { key: 'db-super', label: 'Dragon Ball Super', order: 3 };
    if (/\bova\b/.test(title)) return { key: 'db-ova', label: 'Dragon Ball OVA', order: 4 };
    if (/peli|pelicula|movie/.test(title)) return { key: 'db-movies', label: 'Dragon Ball Movies', order: 5 };
    return { key: 'db-z', label: 'Dragon Ball Z', order: 1 };
  }

  if (episode.season != null) {
    return { key: `s${episode.season}`, label: `Season ${episode.season}`, order: episode.season };
  }

  if (/\bova\b/.test(title)) return { key: 'ova', label: 'OVA', order: 200 };
  if (/peli|pelicula|movie/.test(title)) return { key: 'movies', label: 'Movies', order: 201 };
  return { key: 'specials', label: 'Specials', order: 202 };
}

function compareEpisodes(a, b) {
  const bucketDiff = a.bucket.order - b.bucket.order;
  if (bucketDiff !== 0) return bucketDiff;

  const seasonA = a.season ?? 99;
  const seasonB = b.season ?? 99;
  if (seasonA !== seasonB) return seasonA - seasonB;

  const chapterA = a.chapter ? a.chapter.start : 99999;
  const chapterB = b.chapter ? b.chapter.start : 99999;
  if (chapterA !== chapterB) return chapterA - chapterB;

  const chapterEndA = a.chapter ? a.chapter.end : 99999;
  const chapterEndB = b.chapter ? b.chapter.end : 99999;
  if (chapterEndA !== chapterEndB) return chapterEndA - chapterEndB;

  const partA = a.part ?? (a.isFinal ? 999 : 0);
  const partB = b.part ?? (b.isFinal ? 999 : 0);
  if (partA !== partB) return partA - partB;

  return a.order - b.order;
}

function decorateEpisodes(group, episodes) {
  return episodes
    .map((episode) => ({
      ...episode,
      season: episode.season ?? parseSeasonNumber(episode.rawTitle || episode.title || ''),
      chapter: episode.chapter ?? parseChapterRange(episode.rawTitle || episode.title || ''),
      ...parsePart(episode.rawTitle || episode.title || ''),
      bucket: deriveBucket(group, episode)
    }))
    .sort(compareEpisodes);
}

function buildEmbedUrl(href) {
  const url = String(href || '');
  if (url.includes('ok.ru/videoembed/')) return url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`;

  const okMatch = url.match(/ok\.ru\/(?:video|videoembed)\/(\d+)/i);
  if (okMatch) return `https://ok.ru/videoembed/${okMatch[1]}?autoplay=1`;

  if (url.includes('youtube.com/watch')) {
    const parsed = new URL(url);
    const id = parsed.searchParams.get('v');
    if (id) return `https://www.youtube.com/embed/${id}?autoplay=1`;
  }

  if (url.includes('youtu.be/')) {
    const id = url.split('/').pop();
    if (id) return `https://www.youtube.com/embed/${id}?autoplay=1`;
  }

  if (url.includes('twitch.tv/videos/')) {
    const id = url.split('/').pop();
    return `https://player.twitch.tv/?video=${id}&parent=${window.location.hostname}&autoplay=true`;
  }

  return url;
}

function playEpisode(episode) {
  state.selectedEpisodeHref = episode.href;
  refs.playerFrame.src = buildEmbedUrl(episode.href);
  refs.playerModal.classList.add('open');
  refs.playerModal.setAttribute('aria-hidden', 'false');
  renderEpisodesList();
}

function closePlayer() {
  refs.playerModal.classList.remove('open');
  refs.playerModal.setAttribute('aria-hidden', 'true');
  refs.playerFrame.src = 'about:blank';
}

function getBuckets(episodes) {
  const map = new Map();
  episodes.forEach((episode) => {
    if (!map.has(episode.bucket.key)) {
      map.set(episode.bucket.key, {
        key: episode.bucket.key,
        label: episode.bucket.label,
        order: episode.bucket.order,
        count: 0
      });
    }
    map.get(episode.bucket.key).count += 1;
  });
  return [...map.values()].sort((a, b) => a.order - b.order);
}

function renderSeasonSelect() {
  const buckets = getBuckets(state.episodes);
  const options = buckets.map((bucket) => ({ value: bucket.key, label: `${bucket.label} (${bucket.count})` }));

  refs.seasonSelect.innerHTML = options.map((option) => `<option value="${option.value}">${option.label}</option>`).join('');

  if (!options.some((option) => option.value === state.seasonFilter)) {
    state.seasonFilter = options.length > 0 ? options[0].value : 'all';
  }
  refs.seasonSelect.value = state.seasonFilter;
}

function applyEpisodeFilters() {
  let episodes = [...state.episodes];

  if (state.seasonFilter !== 'all') {
    episodes = episodes.filter((episode) => episode.bucket.key === state.seasonFilter);
  }

  if (state.search) {
    const query = normalize(state.search);
    episodes = episodes.filter((episode) => normalize(episode.rawTitle || episode.title).includes(query));
  }

  state.filteredEpisodes = episodes;

  if (!state.selectedEpisodeHref || !episodes.some((episode) => episode.href === state.selectedEpisodeHref)) {
    state.selectedEpisodeHref = episodes[0] ? episodes[0].href : null;
  }
}

function buildEpisodeNode(episode, number) {
  const node = refs.episodeTemplate.content.firstElementChild.cloneNode(true);
  const thumb = node.querySelector('.episode-thumb');
  const title = node.querySelector('.episode-title');
  const meta = node.querySelector('.episode-meta');

  thumb.src = episode.image || state.group.thumbnail;
  thumb.alt = episode.rawTitle || episode.title;
  title.textContent = `${number}. ${episode.rawTitle || episode.title}`;

  const chips = [episode.bucket.label];
  if (episode.chapter) {
    chips.push(episode.chapter.start === episode.chapter.end ? `Cap ${episode.chapter.start}` : `Cap ${episode.chapter.start}-${episode.chapter.end}`);
  }
  if (episode.part != null) chips.push(`Part ${episode.part}`);
  if (episode.isFinal) chips.push('Final');
  meta.textContent = chips.join(' · ');

  if (episode.href === state.selectedEpisodeHref) node.classList.add('active');

  node.addEventListener('click', () => playEpisode(episode));
  return node;
}

function renderFlatEpisodes() {
  refs.episodesList.innerHTML = '';

  state.filteredEpisodes.forEach((episode, index) => {
    refs.episodesList.appendChild(buildEpisodeNode(episode, index + 1));
  });
}

function renderEpisodesList() {
  applyEpisodeFilters();

  if (state.filteredEpisodes.length === 0) {
    refs.episodesList.innerHTML = '<div class="empty">No episodes found for this season/search.</div>';
    return;
  }

  renderFlatEpisodes();
}

function renderDetail(group) {
  const seed = hashText(group.id);
  const duration = 22 + (seed % 120);
  const rating = (7.0 + ((seed % 20) / 10)).toFixed(1);
  const yearStart = 2008 + (seed % 12);
  const yearEnd = yearStart + (group.totalEpisodes > 12 ? 4 : 0);

  refs.detailBg.src = group.thumbnail;
  refs.detailTitle.textContent = group.name;
  refs.detailMeta.innerHTML = `<span>${duration} min</span><span>${yearStart}${yearEnd > yearStart ? `-${yearEnd}` : ''}</span><span>${rating} IMDb</span>`;

  const genreMap = {
    Anime: ['Action', 'Drama', 'Thriller'],
    'Peliculas y Series': ['Biography', 'Drama', 'History'],
    Directos: ['Live', 'Talk', 'Community'],
    General: ['Variety', 'Entertainment', 'Trending'],
    Other: ['Variety', 'Community', 'Clips']
  };

  refs.detailGenres.innerHTML = (genreMap[group.category] || genreMap.Other).map((x) => `<span>${x}</span>`).join('');
  refs.detailCast.innerHTML = ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn'].map((x) => `<span>${x}</span>`).join('');
  const baseSummary = `${group.name} includes ${group.totalEpisodes} episodes ordered by seasons/arcs. Use the right panel to jump faster to the episode you want.`;
  refs.detailSummary.textContent = group.description ? `${group.description}` : baseSummary;

  refs.addLibrary.onclick = () => window.alert('Added to library (placeholder).');
  refs.watchTrailer.onclick = () => {
    if (state.episodes[0]) window.open(state.episodes[0].href, '_blank', 'noopener,noreferrer');
  };

  refs.favBtn.onclick = () => {
    const favorites = new Set(JSON.parse(localStorage.getItem('holisofi-favorites') || '[]'));
    if (favorites.has(group.id)) favorites.delete(group.id);
    else favorites.add(group.id);
    localStorage.setItem('holisofi-favorites', JSON.stringify([...favorites]));
  };
}

async function parseFromRaw() {
  const response = await fetch('data.json');
  if (!response.ok) throw new Error('Could not load data.json');
  const raw = await response.json();

  const merged = new Map();
  let order = 0;

  raw.forEach((cat) => {
    (cat.subcategories || []).forEach((sub) => {
      const key = resolveCanonical(sub.name || 'other');
      if (!merged.has(key)) {
        merged.set(key, {
          id: key,
          name: prettifyName(key, sub.name || 'Other'),
          description: 'No summary available.',
          aliases: new Set(),
          categoryVotes: {},
          episodes: [],
          thumbnail: null
        });
      }

      const group = merged.get(key);
      group.aliases.add(sub.name || 'Other');
      group.categoryVotes[cat.name || 'Other'] = (group.categoryVotes[cat.name || 'Other'] || 0) + (sub.items || []).length;

      (sub.items || []).forEach((item) => {
        const href = String(item.href || '').trim();
        if (!href) return;

        group.episodes.push({
          rawTitle: item.html_title || item.title || 'Untitled',
          title: item.title || item.html_title || 'Untitled',
          href,
          image: item.img && item.img !== '#' ? item.img : null,
          season: parseSeasonNumber(item.title || item.html_title || ''),
          chapter: parseChapterRange(item.title || item.html_title || ''),
          ...parsePart(item.title || item.html_title || ''),
          sourceCategory: cat.name || 'Other',
          order
        });
        order += 1;
      });
    });
  });

  return [...merged.values()].map((group) => {
    const fallback = 'images/channel-banner.jpg';
    const thumb = group.episodes.find((episode) => episode.image)?.image || fallback;
    const category = getCategoryFromVotes(group.categoryVotes, group.name);

    return {
      id: group.id,
      name: group.name,
      aliases: [...group.aliases],
      category,
      episodes: group.episodes,
      totalEpisodes: group.episodes.length,
      thumbnail: thumb,
      description: group.description || null
    };
  });
}

async function loadGroups() {
  const cached = JSON.parse(localStorage.getItem('holisofi-groups-cache-v4') || '[]');
  if (Array.isArray(cached) && cached.length > 0) return cached;
  return parseFromRaw();
}

function getQueryId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function wireEvents() {
  refs.seasonSelect.addEventListener('change', (event) => {
    state.seasonFilter = event.target.value;
    renderEpisodesList();
  });

  refs.episodeSearch.addEventListener('input', (event) => {
    state.search = event.target.value.trim();
    renderEpisodesList();
  });

  refs.prevEpisode.addEventListener('click', () => {
    if (state.filteredEpisodes.length === 0) return;
    const current = state.filteredEpisodes.findIndex((episode) => episode.href === state.selectedEpisodeHref);
    const nextIndex = current <= 0 ? state.filteredEpisodes.length - 1 : current - 1;
    playEpisode(state.filteredEpisodes[nextIndex]);
  });

  refs.nextEpisode.addEventListener('click', () => {
    if (state.filteredEpisodes.length === 0) return;
    const current = state.filteredEpisodes.findIndex((episode) => episode.href === state.selectedEpisodeHref);
    const nextIndex = current >= state.filteredEpisodes.length - 1 ? 0 : current + 1;
    playEpisode(state.filteredEpisodes[nextIndex]);
  });

  refs.playerModal.addEventListener('click', (event) => {
    if (event.target === refs.playerModal) closePlayer();
  });

  refs.closePlayer.addEventListener('click', closePlayer);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePlayer();
  });
}

async function init() {
  wireEvents();

  state.groups = await loadGroups();
  const id = getQueryId();

  if (!id) {
    window.location.href = 'index.html';
    return;
  }

  const target = state.groups.find((group) => group.id === id);
  if (!target) {
    refs.detailTitle.textContent = 'Group not found';
    refs.detailSummary.textContent = 'Return to home and open the group again.';
    return;
  }

  state.group = target;
  state.episodes = decorateEpisodes(target, target.episodes || []);
  state.selectedEpisodeHref = state.episodes[0] ? state.episodes[0].href : null;

  renderDetail(target);
  renderSeasonSelect();
  renderEpisodesList();
}

init().catch((error) => {
  refs.detailTitle.textContent = 'Error loading group';
  refs.detailSummary.textContent = error.message;
});
