const state = {
  groups: [],
  filtered: [],
  activeCategory: 'All',
  query: '',
  favorites: new Set(JSON.parse(localStorage.getItem('holisofi-favorites') || '[]')),
  selectedSingle: null,
  heroSlides: [],
  heroIndex: 0,
  heroTimer: null
};

const refs = {
  searchInput: document.querySelector('#search-input'),
  loginBtn: document.querySelector('#login-btn'),
  categoryStrip: document.querySelector('#category-strip'),
  groupsRoot: document.querySelector('#groups-root'),
  groupCardTemplate: document.querySelector('#group-card-template'),
  heroTrack: document.querySelector('#hero-track'),
  heroDots: document.querySelector('#hero-dots'),
  heroPrev: document.querySelector('#hero-prev'),
  heroNext: document.querySelector('#hero-next'),
  spotKicker: document.querySelector('#spot-kicker'),
  spotTitle: document.querySelector('#spot-title'),
  spotDescription: document.querySelector('#spot-description'),
  spotFeatureMeta: document.querySelector('#spot-feature-meta'),
  spotOpen: document.querySelector('#spot-open'),
  spotFav: document.querySelector('#spot-fav'),
  singlePanel: document.querySelector('#single-panel'),
  closeSinglePanel: document.querySelector('#close-single-panel'),
  singleCover: document.querySelector('#single-cover'),
  singleTitle: document.querySelector('#single-title'),
  singleStats: document.querySelector('#single-stats'),
  singleSummary: document.querySelector('#single-summary'),
  singleGenres: document.querySelector('#single-genres'),
  singleCast: document.querySelector('#single-cast'),
  singleDirectors: document.querySelector('#single-directors'),
  singlePlay: document.querySelector('#single-play'),
  singleTrailer: document.querySelector('#single-trailer'),
  playerModal: document.querySelector('#player-modal'),
  closePlayer: document.querySelector('#close-player'),
  playerFrame: document.querySelector('#player-frame')
};

/* ALIAS_MAP is loaded from alias_map.js */

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1603190287605-e6ade32fa852?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?auto=format&fit=crop&w=800&q=80'
];

const SINGLE_EPISODE_THRESHOLD = 2;

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

function stripNoise(value) {
  return String(value || '')
    .replace(/\[.*?\]/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\+.*$/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function normalizeGroupName(name) {
  let text = normalize(stripNoise(name))
    .replace(/zobaco/g, 'sobaco')
    .replace(/voleyboll/g, 'voleyball')
    .replace(/konoshuba/g, 'konosuba')
    .replace(/geaz+/g, 'geass')
    .replace(/gintamaz+/g, 'gintama')
    .replace(/bakiz+/g, 'baki')
    .replace(/ippoz+/g, 'ippo')
    .replace(/\bzz+\b/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const tokens = text
    .split(' ')
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => !['anime', 'stream', 'directo', 'directos', 'pelicula', 'series', 'twitch', 'holisofi'].includes(token));

  return { text, tokens };
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

function parseSeason(title) {
  const value = normalize(title);
  const m =
    value.match(/\b(?:temporada|season|temp)\s*(\d{1,2})\b/i) ||
    value.match(/\bt\s*(\d{1,2})\b/i) ||
    value.match(/\bt(\d{1,2})\b/i) ||
    value.match(/\bs\s*(\d{1,2})\b/i) ||
    String(title || '').match(/\[\s*S(\d{1,2})\b/i);

  return m ? Number.parseInt(m[1], 10) : null;
}

function parseChapter(title) {
  const value = normalize(title);
  const m =
    value.match(/cap(?:itulo)?\s*del\s*(\d{1,4})\s*al\s*(\d{1,4})/i) ||
    value.match(/(?:cap(?:itulo)?|epis(?:odio)?|ep)\s*(\d{1,4})\s*(?:-|–|a|al|y)\s*(\d{1,4})/i) ||
    value.match(/(?:cap(?:itulo)?|epis(?:odio)?|ep)\s*(\d{1,4})/i) ||
    value.match(/(\d{1,4})\s*(?:-|–|a|al)\s*(\d{1,4})(?!.*\d)/i);

  if (!m) return null;
  const first = Number.parseInt(m[1], 10);
  const second = Number.parseInt(m[2] || m[1], 10);
  if (Number.isNaN(first) || Number.isNaN(second) || Math.abs(second - first) > 600) return null;
  return { start: Math.min(first, second), end: Math.max(first, second) };
}

function parsePart(title) {
  const value = normalize(title);
  const m = value.match(/\b(?:parte|part|pt)\.?\s*(\d{1,2})/i);
  return { part: m ? Number.parseInt(m[1], 10) : null, isFinal: /\bfinal\b/i.test(value) };
}

function compareEpisodes(a, b) {
  const sA = a.season ?? 99;
  const sB = b.season ?? 99;
  if (sA !== sB) return sA - sB;

  const cA = a.chapter ? a.chapter.start : 99999;
  const cB = b.chapter ? b.chapter.start : 99999;
  if (cA !== cB) return cA - cB;

  const pA = a.part ?? (a.isFinal ? 999 : 0);
  const pB = b.part ?? (b.isFinal ? 999 : 0);
  if (pA !== pB) return pA - pB;

  return a.order - b.order;
}

function prettifyKey(key, aliasStr) {
  // Display the real name from the alias map when available
  const norm = String(aliasStr || '').trim().toLowerCase();
  if (ALIAS_MAP[norm]) return ALIAS_MAP[norm];
  if (key === 'other') return 'Other';
  return String(aliasStr || key).replace(/\b(Twich|Twittch)\b/ig, 'Twitch');
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

function getPrimaryCategory(votes, name) {
  if (MOVIE_TITLES.has(name)) return 'Peliculas y Series';
  const sorted = Object.entries(votes).sort((a, b) => b[1] - a[1]);
  if (!sorted[0]) return 'Other';
  return sorted[0][0];
}

function flattenAndMerge(rawData) {
  const map = new Map();
  let orderCounter = 0;

  rawData.forEach((categoryBlock) => {
    const categoryName = categoryBlock.name || 'Other';

    (categoryBlock.subcategories || []).forEach((subcategory) => {
      const key = resolveCanonical(subcategory.name || 'other');
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name: prettifyKey(key, subcategory.name),
          wiki: ALIAS_MAP[String(subcategory.name || '').trim().toLowerCase()] || null,
          aliases: new Set(),
          categoryVotes: {},
          episodes: [],
          thumbnail: null,
          latestOrder: 0
        });
      }

      const group = map.get(key);
      group.aliases.add(subcategory.name || 'Unknown');
      group.categoryVotes[categoryName] = (group.categoryVotes[categoryName] || 0) + (subcategory.items || []).length;

      (subcategory.items || []).forEach((item) => {
        const href = String(item.href || '').trim();
        if (!href) return;

        const episode = {
          title: String(item.title || item.html_title || 'Untitled'),
          rawTitle: String(item.html_title || item.title || 'Untitled'),
          href,
          image: item.img && item.img !== '#' ? item.img : null,
          season: parseSeason(item.title || item.html_title || ''),
          chapter: parseChapter(item.title || item.html_title || ''),
          ...parsePart(item.title || item.html_title || ''),
          sourceCategory: categoryName,
          order: orderCounter
        };

        group.episodes.push(episode);
        group.latestOrder = orderCounter;
        orderCounter += 1;
      });
    });
  });

  return [...map.values()]
    .map((group) => {
      const dedup = new Map();
      group.episodes.forEach((episode) => {
        if (!dedup.has(episode.href)) dedup.set(episode.href, episode);
      });

      const episodes = [...dedup.values()].sort(compareEpisodes);
      const seed = hashText(group.id) % FALLBACK_IMAGES.length;

      return {
        id: group.id,
        name: group.name,
        wiki: group.wiki, description: group.description,
        category: getPrimaryCategory(group.categoryVotes, group.name),
        aliases: [...group.aliases],
        episodes,
        totalEpisodes: episodes.length,
        thumbnail: FALLBACK_IMAGES[seed],
        latestOrder: group.latestOrder,
        isSingle: episodes.length <= SINGLE_EPISODE_THRESHOLD
      };
    })
    .sort((a, b) => b.totalEpisodes - a.totalEpisodes);
}

/* Maps real names from ALIAS_MAP to their exact Wikipedia article titles */
const WIKI_LOOKUP = {
  "DanMachi": "Is It Wrong to Try to Pick Up Girls in a Dungeon?",
  "KonoSuba": "KonoSuba: God's Blessing on This Wonderful World!",
  "Dragon Ball": "Dragon Ball (manga)",
  "Dragon Ball Super": "Dragon Ball Super",
  "Dragon Ball Z: Broly - The Legendary Super Saiyan": "Dragon Ball Z: Broly – The Legendary Super Saiyan",
  "Dragon Ball Z: Bojack Unbound": "Dragon Ball Z: Bojack Unbound",
  "Mushoku Tensei": "Mushoku Tensei: Jobless Reincarnation",
  "Mushoku Tensei: Jobless Reincarnation": "Mushoku Tensei: Jobless Reincarnation",
  "Fire Force": "Fire Force",
  "Dungeon Meshi": "Delicious in Dungeon",
  "Saint Seiya": "Saint Seiya",
  "La Casa de Papel": "Money Heist",
  "Attack on Titan": "Attack on Titan",
  "Bleach": "Bleach (manga)",
  "Bleach: Thousand-Year Blood War": "Bleach: Thousand-Year Blood War",
  "One Piece": "One Piece",
  "My Hero Academia": "My Hero Academia",
  "Naruto": "Naruto",
  "Spy x Family": "Spy × Family",
  "Goblin Slayer": "Goblin Slayer",
  "Frieren: Beyond Journey's End": "Frieren: Beyond Journey's End",
  "JoJo's Bizarre Adventure": "JoJo's Bizarre Adventure",
  "Jujutsu Kaisen": "Jujutsu Kaisen",
  "Chainsaw Man": "Chainsaw Man",
  "One Punch Man": "One-Punch Man",
  "Mob Psycho 100": "Mob Psycho 100",
  "Kengan Ashura": "Kengan Ashura",
  "Record of Ragnarok": "Record of Ragnarok",
  "Dr. Stone": "Dr. Stone",
  "Fairy Tail": "Fairy Tail",
  "Steins;Gate": "Steins;Gate",
  "Psycho-Pass": "Psycho-Pass",
  "Tokyo Revengers": "Tokyo Revengers",
  "Black Clover": "Black Clover",
  "Code Geass": "Code Geass",
  "Haikyu!!": "Haikyu!!",
  "Baki": "Baki the Grappler",
  "Baki Hanma": "Baki Hanma (TV series)",
  "Fullmetal Alchemist": "Fullmetal Alchemist",
  "Neon Genesis Evangelion": "Neon Genesis Evangelion",
  "Gintama": "Gintama",
  "Hajime no Ippo": "Hajime no Ippo",
  "Digimon": "Digimon Adventure",
  "Hellsing": "Hellsing",
  "The Seven Deadly Sins": "The Seven Deadly Sins (manga)",
  "The Avengers": "The Avengers (2012 film)",
  "Re:Zero − Starting Life in Another World": "Re:Zero − Starting Life in Another World",
  "No Game No Life": "No Game No Life",
  "Sword Art Online": "Sword Art Online",
  "Assassination Classroom": "Assassination Classroom",
  "Blue Lock": "Blue Lock",
  "Ranking of Kings": "Ranking of Kings",
  "The Legend of Korra": "The Legend of Korra",
  "Ergo Proxy": "Ergo Proxy",
  "Ghost in the Shell": "Ghost in the Shell (1995 film)",
  "Sakamoto Days": "Sakamoto Days",
  "Overlord": "Overlord (novel series)",
  "Violet Evergarden": "Violet Evergarden",
  "The Eminence in Shadow": "The Eminence in Shadow",
  "Shangri-La Frontier": "Shangri-La Frontier",
  "Deadman Wonderland": "Deadman Wonderland",
  "My Dress-Up Darling": "My Dress-Up Darling",
  "Komi Can't Communicate": "Komi Can't Communicate",
  "Kaguya-sama: Love Is War": "Kaguya-sama: Love Is War",
  "A Silent Voice": "A Silent Voice (film)",
  "Your Lie in April": "Your Lie in April",
  "Golden Time": "Golden Time (novel series)",
  "Summertime Rendering": "Summer Time Rendering",
  "Food Wars! Shokugeki no Soma": "Food Wars!: Shokugeki no Soma",
  "Don't Toy with Me, Miss Nagatoro": "Don't Toy with Me, Miss Nagatoro",
  "Wolf Children": "Wolf Children",
  "Weathering with You": "Weathering with You",
  "I Want to Eat Your Pancreas": "I Want to Eat Your Pancreas",
  "Maquia: When the Promised Flower Blooms": "Maquia: When the Promised Flower Blooms",
  "NieR:Automata Ver1.1a": "NieR:Automata Ver1.1a",
  "Grand Blue Dreaming": "Grand Blue Dreaming",
  "Guilty Crown": "Guilty Crown",
  "Welcome to Demon School! Iruma-kun": "Welcome to Demon School! Iruma-kun",
  "Kaiju No. 8": "Kaiju No. 8",
  "Ao no Exorcist": "Blue Exorcist",
  "Saga of Tanya the Evil": "The Saga of Tanya the Evil",
  "The Familiar of Zero": "The Familiar of Zero",
  "Made in Abyss": "Made in Abyss",
  "Avatar: The Last Airbender": "Avatar: The Last Airbender",
  "Puella Magi Madoka Magica": "Puella Magi Madoka Magica",
  "Kuroko's Basketball": "Kuroko's Basketball",
  "Uma Musume: Pretty Derby": "Uma Musume: Pretty Derby",
  "The Quintessential Quintuplets": "The Quintessential Quintuplets",
  "Cautious Hero: The Hero Is Overpowered but Overly Cautious": "Cautious Hero: The Hero Is Overpowered but Overly Cautious",
  "Alya Sometimes Hides Her Feelings in Russian": "Alya Sometimes Hides Her Feelings in Russian",
  "The Amazing Spider-Man": "The Amazing Spider-Man (2012 film)",
  "Spider-Man": "Spider-Man",
  "Iron Man": "Iron Man (2008 film)",
  "Captain America: Civil War": "Captain America: Civil War",
  "Doctor Strange": "Doctor Strange (2016 film)",
  "Suicide Squad": "Suicide Squad (2016 film)",
  "Guardians of the Galaxy": "Guardians of the Galaxy (film)",
  "The Matrix": "The Matrix",
  "Kong: Skull Island": "Kong: Skull Island",
  "Godzilla vs. Kong": "Godzilla vs. Kong",
  "Brokeback Mountain": "Brokeback Mountain",
  "Cars": "Cars (film)",
  "Jingle All the Way": "Jingle All the Way",
  "Rise of the Guardians": "Rise of the Guardians",
  "Monsters vs. Aliens": "Monsters vs. Aliens",
  "Ant-Man": "Ant-Man (film)",
  "Game of Thrones": "Game of Thrones",
  "The Shannara Chronicles": "The Shannara Chronicles",
  "Alien": "Alien (film)",
  "The Conjuring": "The Conjuring",
  "It": "It (2017 film)",
  "Saw": "Saw (film)",
  "Megamind": "Megamind",
  "The Incredible Hulk": "The Incredible Hulk (film)",
  "Rambo": "Rambo (2008 film)",
  "Avengers: Age of Ultron": "Avengers: Age of Ultron",
  "Mindhunter": "Mindhunter (TV series)",
  "The Good Doctor": "The Good Doctor (TV series)",
  "Knowing": "Knowing (film)",
  "Bakemonogatari": "Bakemonogatari",
  "Nisemonogatari": "Nisemonogatari",
  "Godzilla": "Godzilla",
  "Hunter x Hunter": "Hunter × Hunter",
  "Death Note": "Death Note",
  "Charlotte": "Charlotte (anime)",
  "Classroom of the Elite": "Classroom of the Elite",
  "Amagi Brilliant Park": "Amagi Brilliant Park",
  "The Apothecary Diaries": "The Apothecary Diaries",
  "So I'm a Spider, So What?": "So I'm a Spider, So What?",
  "Minecraft": "Minecraft",
  "Monster": "Monster (manga)",
  "Vinland Saga": "Vinland Saga (manga)",
  "Gurren Lagann": "Gurren Lagann",
  "Fate/stay night": "Fate/stay night",
  "Fate/Zero": "Fate/Zero",
  "Fate/Grand Order": "Fate/Grand Order",
  "Fate/Grand Order - Absolute Demonic Front: Babylonia": "Fate/Grand Order - Absolute Demonic Front: Babylonia",
  "Fate/strange Fake": "Fate/strange Fake",
  "Mashle": "Mashle: Magic and Muscles",
  "Akiba Maid War": "Akiba Maid War",
  "Yahari Ore no Seishun Love Comedy wa Machigatteiru.": "My Youth Romantic Comedy Is Wrong, As I Expected",
  "Trapped in a Dating Sim: The World of Otome Games is Tough for Mobs": "Trapped in a Dating Sim: The World of Otome Games Is Tough for Mobs",
  "The World's Finest Assassin Gets Reincarnated in Another World as an Aristocrat": "The World's Finest Assassin Gets Reincarnated in Another World as an Aristocrat",
  "Tsukimichi: Moonlit Fantasy": "Tsukimichi: Moonlit Fantasy",
  "Boku no Pico": "Boku no Pico"
};

const THUMB_CACHE_KEY = 'holisofi-thumb-cache-v1';

function loadThumbCache() {
  try {
    return JSON.parse(localStorage.getItem(THUMB_CACHE_KEY) || '{}');
  } catch (_e) {
    return {};
  }
}

function saveThumbCache(cache) {
  try {
    localStorage.setItem(THUMB_CACHE_KEY, JSON.stringify(cache));
  } catch (_e) { /* storage full, ignore */ }
}

function getWikiTitle(realName) {
  if (WIKI_LOOKUP[realName]) return WIKI_LOOKUP[realName];
  return realName;
}

async function getWikiData(title) {
  if (!title) return { image: null, description: null };
  const wikiTitle = getWikiTitle(title);
  try {
    const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`);
    if (!response.ok) return { image: null, description: null };
    const data = await response.json();
    return {
      image: data?.originalimage?.source || data?.thumbnail?.source || null,
      description: data?.extract || null
    };
  } catch (_error) {
    return { image: null, description: null };
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function hydrateInternetImages() {
  const candidates = state.groups.filter((group) => group.wiki);
  const cache = loadThumbCache();
  const needsFetch = [];

  /* Apply cached data first (instant) */
  candidates.forEach((group) => {
    const cached = cache[group.wiki];
    if (cached) {
      if (cached.image) group.thumbnail = cached.image;
      if (cached.description) group.description = cached.description;
    } else {
      needsFetch.push(group);
    }
  });

  if (Object.keys(cache).length > 0) {
    applyFiltersAndRender();
  }

  if (needsFetch.length === 0) return;

  /* Batch fetch uncached titles — 6 at a time with 350ms delay */
  const BATCH_SIZE = 6;
  const DELAY_MS = 350;

  for (let i = 0; i < needsFetch.length; i += BATCH_SIZE) {
    const batch = needsFetch.slice(i, i + BATCH_SIZE);

    const results = await Promise.all(
      batch.map(async (group) => {
        const data = await getWikiData(group.wiki);
        return { id: group.id, wiki: group.wiki, image: data.image, description: data.description };
      })
    );

    results.forEach((result) => {
      const group = state.groups.find((item) => item.id === result.id);
      if (group) {
        if (result.image) group.thumbnail = result.image;
        if (result.description) group.description = result.description;
      }
      /* Cache the result (even if null, to avoid re-fetching) */
      cache[result.wiki] = { image: result.image, description: result.description };
    });

    /* Re-render progressively so user sees thumbnails appearing */
    applyFiltersAndRender();
    saveThumbCache(cache);

    if (i + BATCH_SIZE < needsFetch.length) {
      await sleep(DELAY_MS);
    }
  }
}

function buildEmbedUrl(href) {
  const url = String(href || '');

  if (url.includes('ok.ru/videoembed/')) return url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`;
  const okMatch = url.match(/ok\.ru\/(?:video|videoembed)\/(\d+)/i);
  if (okMatch) return `https://ok.ru/videoembed/${okMatch[1]}?autoplay=1`;

  if (url.includes('youtube.com/watch')) {
    const parsed = new URL(url);
    const v = parsed.searchParams.get('v');
    if (v) return `https://www.youtube.com/embed/${v}?autoplay=1`;
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

function playUrl(href) {
  refs.playerFrame.src = buildEmbedUrl(href);
  refs.playerModal.classList.add('open');
  refs.playerModal.setAttribute('aria-hidden', 'false');
}

function closePlayer() {
  refs.playerModal.classList.remove('open');
  refs.playerModal.setAttribute('aria-hidden', 'true');
  refs.playerFrame.src = 'about:blank';
}

function closeSinglePanel() {
  refs.singlePanel.classList.remove('open');
  refs.singlePanel.setAttribute('aria-hidden', 'true');
  state.selectedSingle = null;
}

function chipRow(element, values) {
  element.innerHTML = values.map((value) => `<span class="chip">${value}</span>`).join('');
}

function openSinglePanel(group) {
  const episode = group.episodes[0];
  const seed = hashText(group.id);
  const duration = 95 + (seed % 45);
  const year = 2014 + (seed % 12);
  const rating = (6.8 + ((seed % 25) / 10)).toFixed(1);

  refs.singleCover.src = group.thumbnail;
  refs.singleTitle.textContent = group.name;
  refs.singleStats.innerHTML = `<span>${duration} min</span><span>${year}</span><span>${rating} IMDb</span>`;
  refs.singleSummary.textContent = group.description || `${group.name} is available as a single title. Press Show to play inside the app.`;

  const genreMap = {
    Anime: ['Action', 'Adventure', 'Fantasy'],
    'Peliculas y Series': ['Biography', 'Drama', 'History'],
    Directos: ['Live', 'Talk', 'Community'],
    General: ['Variety', 'Trending', 'Entertainment'],
    Other: ['Variety', 'Community', 'Clips']
  };

  chipRow(refs.singleGenres, genreMap[group.category] || genreMap.Other);
  chipRow(refs.singleCast, ['Matthew McConaughey', 'America Ferrera', 'Yul Vazquez']);
  chipRow(refs.singleDirectors, ['HoliSofi Team']);

  refs.singlePlay.onclick = () => playUrl(episode.href);
  refs.singleTrailer.onclick = () => window.open(episode.href, '_blank', 'noopener,noreferrer');

  refs.singlePanel.classList.add('open');
  refs.singlePanel.setAttribute('aria-hidden', 'false');
  state.selectedSingle = group;
}

function stopHeroAutoplay() {
  if (!state.heroTimer) return;
  clearInterval(state.heroTimer);
  state.heroTimer = null;
}

function startHeroAutoplay() {
  stopHeroAutoplay();
  if (state.heroSlides.length <= 1) return;
  state.heroTimer = window.setInterval(() => setHeroIndex(state.heroIndex + 1), 6500);
}

function buildHeroSlides(groups) {
  const featured = groups[0] || null;
  const second = groups[1] || featured;
  const third = groups[2] || featured;

  const slides = [
    {
      id: 'main-banner',
      image: 'images/channel-banner.jpg',
      kicker: 'Sofi TV',
      title: 'Welcome to Sofi TV',
      description: 'Discover grouped anime, movies and streams with ordered episodes.',
      meta: featured ? `${featured.name} · ${featured.category} · ${featured.totalEpisodes} episodes` : 'Explore your catalog',
      group: featured
    },
    {
      id: 'secondary-banner',
      image: 'images/channel_banner.jpg',
      kicker: 'HoliSofi Streaming Platform',
      title: 'Disney+ Style Browse',
      description: 'Hero carousel, fixed category tabs and clean grouped browsing.',
      meta: second ? `${second.name} · ${second.category} · ${second.totalEpisodes} episodes` : 'Curated browsing',
      group: second
    }
  ];

  if (third) {
    slides.push({
      id: 'featured-group',
      image: third.thumbnail,
      kicker: third.category,
      title: third.name,
      description: 'Top featured collection from your current filter.',
      meta: `${third.totalEpisodes} episodes`,
      group: third
    });
  }

  return slides;
}

function setHeroIndex(nextIndex) {
  if (state.heroSlides.length === 0) return;

  const index = ((nextIndex % state.heroSlides.length) + state.heroSlides.length) % state.heroSlides.length;
  state.heroIndex = index;

  refs.heroTrack.style.transform = `translateX(-${index * 100}%)`;
  refs.heroDots.querySelectorAll('.hero-dot').forEach((dot, dotIndex) => {
    dot.classList.toggle('active', dotIndex === index);
  });

  const active = state.heroSlides[index];
  refs.spotKicker.textContent = active.kicker;
  refs.spotTitle.textContent = active.title;
  refs.spotDescription.textContent = active.description;
  refs.spotFeatureMeta.textContent = active.meta || '';

  if (!active.group) {
    refs.spotOpen.disabled = true;
    refs.spotFav.disabled = true;
    refs.spotFav.textContent = 'Favorite Featured';
    refs.spotOpen.onclick = null;
    refs.spotFav.onclick = null;
    return;
  }

  refs.spotOpen.disabled = false;
  refs.spotFav.disabled = false;
  refs.spotFav.textContent = state.favorites.has(active.group.id) ? 'Unfavorite Featured' : 'Favorite Featured';

  refs.spotOpen.onclick = () => openGroup(active.group);
  refs.spotFav.onclick = () => {
    if (state.favorites.has(active.group.id)) state.favorites.delete(active.group.id);
    else state.favorites.add(active.group.id);

    localStorage.setItem('holisofi-favorites', JSON.stringify([...state.favorites]));
    applyFiltersAndRender();
  };
}

function renderHeroCarousel(groups) {
  state.heroSlides = buildHeroSlides(groups);
  state.heroIndex = 0;

  refs.heroTrack.innerHTML = state.heroSlides
    .map((slide) => `<article class="hero-slide"><img src="${slide.image}" alt="${slide.title}" loading="lazy" /></article>`)
    .join('');

  refs.heroDots.innerHTML = state.heroSlides
    .map((_, index) => `<button type="button" class="hero-dot ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="Go to slide ${index + 1}"></button>`)
    .join('');

  refs.heroDots.querySelectorAll('.hero-dot').forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = Number.parseInt(dot.dataset.index, 10);
      setHeroIndex(index);
      startHeroAutoplay();
    });
  });

  setHeroIndex(0);
  startHeroAutoplay();
}

function openGroup(group) {
  if (group.isSingle) {
    openSinglePanel(group);
    return;
  }

  localStorage.setItem('holisofi-groups-cache-v3', JSON.stringify(state.groups));
  window.location.href = `group.html?id=${encodeURIComponent(group.id)}`;
}

function renderCategoryStrip() {
  const options = [
    { key: 'All', label: 'ALL' },
    { key: 'Anime', label: 'ANIME' },
    { key: 'Movies', label: 'MOVIES' },
    { key: 'Stream', label: 'STREAM' }
  ];

  refs.categoryStrip.innerHTML = options
    .map((option) => `<button type="button" class="pill-btn ${option.key === state.activeCategory ? 'active' : ''}" data-category="${option.key}">${option.label}</button>`)
    .join('');

  refs.categoryStrip.querySelectorAll('.pill-btn').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeCategory = button.dataset.category;
      applyFiltersAndRender();
    });
  });
}

function buildGroupCard(group) {
  const node = refs.groupCardTemplate.content.firstElementChild.cloneNode(true);
  node.querySelector('.card-image').src = group.thumbnail;
  node.querySelector('.card-image').alt = group.name;
  node.querySelector('.card-chip').textContent = `${group.totalEpisodes} eps`;
  node.querySelector('.card-title').textContent = group.name;
  node.querySelector('.card-meta').textContent = `${group.category} · ${group.totalEpisodes} eps`;
  node.querySelector('.card-media').addEventListener('click', () => openGroup(group));
  return node;
}

function renderGroups(groups) {
  refs.groupsRoot.innerHTML = '';
  if (groups.length === 0) {
    refs.groupsRoot.innerHTML = '<div class="empty">No groups match this filter.</div>';
    return;
  }

  const titleMap = {
    All: 'Popular',
    Anime: 'Anime',
    Movies: 'Movies',
    Stream: 'Stream'
  };

  const section = document.createElement('section');
  section.className = 'groups-section';
  section.innerHTML = `
    <div class="section-head">
      <h3>${titleMap[state.activeCategory] || 'Popular'}</h3>
      <p>${groups.length} groups</p>
    </div>
    <div class="groups-grid"></div>
  `;

  const grid = section.querySelector('.groups-grid');
  groups.forEach((group) => grid.appendChild(buildGroupCard(group)));
  refs.groupsRoot.appendChild(section);
}

function applyFiltersAndRender() {
  let groups = [...state.groups];

  if (state.activeCategory === 'Anime') {
    groups = groups.filter((group) => group.category === 'Anime');
  } else if (state.activeCategory === 'Movies') {
    groups = groups.filter((group) => group.category === 'Peliculas y Series');
  } else if (state.activeCategory === 'Stream') {
    groups = groups.filter((group) => ['Directos', 'General', 'Other'].includes(group.category));
  }

  if (state.query) {
    const query = normalize(state.query);
    groups = groups.filter((group) => {
      if (normalize(group.name).includes(query)) return true;
      if (group.aliases.some((alias) => normalize(alias).includes(query))) return true;
      return group.episodes.some((episode) => normalize(episode.title).includes(query));
    });
  }

  groups.sort((a, b) => b.totalEpisodes - a.totalEpisodes);
  state.filtered = groups;

  renderCategoryStrip();
  renderGroups(groups);
  renderHeroCarousel(groups);
}

function wireEvents() {
  refs.heroPrev.addEventListener('click', () => {
    setHeroIndex(state.heroIndex - 1);
    startHeroAutoplay();
  });

  refs.heroNext.addEventListener('click', () => {
    setHeroIndex(state.heroIndex + 1);
    startHeroAutoplay();
  });

  refs.searchInput.addEventListener('input', (event) => {
    state.query = event.target.value.trim();
    applyFiltersAndRender();
  });

  refs.loginBtn.addEventListener('click', () => {
    window.alert('Login flow placeholder: connect your auth provider here.');
  });

  refs.closeSinglePanel.addEventListener('click', closeSinglePanel);

  refs.playerModal.addEventListener('click', (event) => {
    if (event.target === refs.playerModal) closePlayer();
  });

  refs.closePlayer.addEventListener('click', closePlayer);

  document.addEventListener('keydown', (event) => {
    if (event.key === '/') {
      event.preventDefault();
      refs.searchInput.focus();
    }

    if (event.key === 'Escape') {
      if (refs.playerModal.classList.contains('open')) closePlayer();
      if (refs.singlePanel.classList.contains('open')) closeSinglePanel();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopHeroAutoplay();
    else startHeroAutoplay();
  });
}

async function init() {
  wireEvents();

  const response = await fetch('data.json');
  if (!response.ok) throw new Error('Could not load data.json');

  const rawData = await response.json();
  state.groups = flattenAndMerge(rawData);

  applyFiltersAndRender();
  hydrateInternetImages();
}

init().catch((error) => {
  refs.groupsRoot.innerHTML = `<div class="empty">Error loading project: ${error.message}</div>`;
});
