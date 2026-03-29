/* global ALIAS_MAP */

const WIKI_LOOKUP = {
  "DanMachi": "Is It Wrong to Try to Pick Up Girls in a Dungeon?",
  "KonoSuba": "KonoSuba: God's Blessing on This Wonderful World!",
  "Dragon Ball": "Dragon Ball (manga)",
  "Dragon Ball Z": "Dragon Ball Z",
  "Dragon Ball GT": "Dragon Ball GT",
  "Dragon Ball Super": "Dragon Ball Super",
  "Dragon Ball Z: Broly - The Legendary Super Saiyan": "Dragon Ball Z: Broly – The Legendary Super Saiyan",
  "Dragon Ball Z: Bojack Unbound": "Dragon Ball Z: Bojack Unbound",
  "Mushoku Tensei": "Mushoku Tensei: Jobless Reincarnation",
  "Fire Force": "Fire Force",
  "Delicious in Dungeon": "Delicious in Dungeon",
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
  "Fullmetal Alchemist": "Fullmetal Alchemist",
  "Neon Genesis Evangelion": "Neon Genesis Evangelion",
  "Gintama": "Gintama",
  "Hajime no Ippo": "Hajime no Ippo",
  "Digimon": "Digimon Adventure",
  "The Seven Deadly Sins": "The Seven Deadly Sins (manga)",
  "Re:Zero − Starting Life in Another World": "Re:Zero − Starting Life in Another World",
  "Sword Art Online": "Sword Art Online",
  "Assassination Classroom": "Assassination Classroom",
  "Blue Lock": "Blue Lock",
  "Ranking of Kings": "Ranking of Kings",
  "The Legend of Korra": "The Legend of Korra",
  "Ghost in the Shell": "Ghost in the Shell (1995 film)",
  "Sakamoto Days": "Sakamoto Days",
  "Overlord": "Overlord (novel series)",
  "Violet Evergarden": "Violet Evergarden",
  "The Eminence in Shadow": "The Eminence in Shadow",
  "Deadman Wonderland": "Deadman Wonderland",
  "A Silent Voice": "A Silent Voice (film)",
  "Your Lie in April": "Your Lie in April",
  "Summer Time Rendering": "Summer Time Rendering",
  "Food Wars! Shokugeki no Soma": "Food Wars!: Shokugeki no Soma",
  "Wolf Children": "Wolf Children",
  "Weathering with You": "Weathering with You",
  "I Want to Eat Your Pancreas": "I Want to Eat Your Pancreas",
  "Kaiju No. 8": "Kaiju No. 8",
  "Ao no Exorcist": "Blue Exorcist",
  "Made in Abyss": "Made in Abyss",
  "Avatar: The Last Airbender": "Avatar: The Last Airbender",
  "The Amazing Spider-Man": "The Amazing Spider-Man (2012 film)",
  "Iron Man": "Iron Man (2008 film)",
  "Captain America: Civil War": "Captain America: Civil War",
  "Doctor Strange": "Doctor Strange (2016 film)",
  "Suicide Squad": "Suicide Squad (2016 film)",
  "Guardians of the Galaxy": "Guardians of the Galaxy (film)",
  "Marvel": "Marvel Cinematic Universe",
  "The Matrix": "The Matrix",
  "Kong: Skull Island": "Kong: Skull Island",
  "Godzilla vs. Kong": "Godzilla vs. Kong",
  "Brokeback Mountain": "Brokeback Mountain",
  "Cars": "Cars (film)",
  "Jingle All the Way": "Jingle All the Way",
  "Ant-Man": "Ant-Man (film)",
  "Game of Thrones": "Game of Thrones",
  "Alien": "Alien (film)",
  "The Conjuring": "The Conjuring",
  "It": "It (2017 film)",
  "Saw": "Saw (film)",
  "Megamind": "Megamind",
  "The Incredible Hulk": "The Incredible Hulk (film)",
  "Rambo": "Rambo (2008 film)",
  "Avengers: Age of Ultron": "Avengers: Age of Ultron",
  "Godzilla": "Godzilla",
  "Hunter x Hunter": "Hunter × Hunter",
  "Death Note": "Death Note",
  "Monster": "Monster (manga)",
  "Vinland Saga": "Vinland Saga (manga)",
  "Gurren Lagann": "Gurren Lagann",
  "Thor: Ragnarok": "Thor: Ragnarok",
  "Black Panther": "Black Panther (film)",
  "Avengers: Infinity War": "Avengers: Infinity War",
  "Spider-Man: Homecoming": "Spider-Man: Homecoming",
  "The Amazing Spider-Man 2": "The Amazing Spider-Man 2",
  "MonsterVerse": "MonsterVerse",
  "One Piece: Live Action": "One Piece (2023 TV series)",
  "K-ON": "K-On!"
};

const MOVIE_COLLECTION_IDS = new Set([
  "Marvel",
  "Spider-Man",
  "MonsterVerse",
  "Saint Seiya: The Lost Canvas"
]);

const CATEGORY_PRIORITY = {
  "Peliculas y Series": 0,
  "Anime": 1,
  "Directos": 2,
  "General": 3
};

const KNOWN_SERIES_IDS = new Set([
  "Mindhunter",
  "Game of Thrones",
  "La Casa de Papel",
  "The Shannara Chronicles",
  "One Piece: Live Action"
]);

function resolveCanonical(rawName) {
  const norm = String(rawName || '').trim().toLowerCase();
  if (typeof ALIAS_MAP !== 'undefined' && ALIAS_MAP[norm]) {
    return ALIAS_MAP[norm];
  }
  return String(rawName || '').trim();
}

function getWikiTitle(realName) {
  const strippedName = String(realName || '')
    .replace(/: Movies & Specials$/, '')
    .replace(/: Live Action$/, '');
  if (WIKI_LOOKUP[realName]) return WIKI_LOOKUP[realName];
  if (WIKI_LOOKUP[strippedName]) return WIKI_LOOKUP[strippedName];
  return strippedName;
}

function dedupeItemsByHref(items) {
  const seen = new Set();
  return (items || []).filter(item => {
    const href = String(item?.href || "").trim();
    const key = href || `${item?.title || ""}|${item?.html_title || ""}`;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isMovieishText(value) {
  return /(pel[ií]cula|movie|film|special|ova|one shot|standalone)/i.test(String(value || ""));
}

function isSpiderManText(value) {
  const normalized = normalizeLooseText(value);
  return /(spider man|spiderman|amazing spider man|hombre tarantula|homecoming)/.test(normalized);
}

function isMonsterVerseText(value) {
  const normalized = normalizeLooseText(value);
  return !normalized.includes("monsters vs aliens") && /(monsterverse|godzilla|kong skull island|kong vs godzilla|godzilla vs kong|godzilla x kong)/.test(normalized);
}

function isMushokuText(value) {
  return /(mushoku tensei|pajin|roxygod)/.test(normalizeLooseText(value));
}

function isLostCanvasText(value) {
  return /(lost canvas)/.test(normalizeLooseText(value));
}

function inferCanonicalShowName(subcategoryName, item) {
  const itemTitle = item?.html_title || item?.title || "";
  const base = resolveCanonical(subcategoryName);
  const combined = `${base} ${subcategoryName} ${itemTitle}`;
  const normalized = normalizeLooseText(combined);
  const baseNormalized = normalizeLooseText(base);

  if (isLostCanvasText(combined)) return "Saint Seiya: The Lost Canvas";
  if (isMonsterVerseText(combined)) return "MonsterVerse";

  if (baseNormalized !== "marvel" && isSpiderManText(combined)) {
    return "Spider-Man";
  }

  if (isMushokuText(combined)) {
    return isMovieishText(itemTitle) ? "Mushoku Tensei: Movies & Specials" : "Mushoku Tensei";
  }

  return base;
}

function sortCollectionItems(collectionId, items) {
  const priorityRules = {
    "Spider-Man": [
      /hombre tarantula|spider-man(?!.*homecoming)|the amazing spiderman$/,
      /the amazing spiderman 2|spider-man 2/,
      /homecoming/
    ],
    "MonsterVerse": [
      /godzilla \(2014\)|\bgodzilla\b(?!.*kong)/,
      /godzilla 2|king of the monsters/,
      /kong.*isla calavera|kong skull island/,
      /kong vs godzilla|godzilla vs kong|godzilla x kong/
    ]
  };

  const rules = priorityRules[collectionId] || [];
  return [...items].sort((left, right) => {
    const leftText = `${left?.html_title || ""} ${left?.title || ""}`;
    const rightText = `${right?.html_title || ""} ${right?.title || ""}`;
    const leftIndex = rules.findIndex(rule => rule.test(leftText.toLowerCase()));
    const rightIndex = rules.findIndex(rule => rule.test(rightText.toLowerCase()));

    if (leftIndex !== rightIndex) {
      return (leftIndex === -1 ? 999 : leftIndex) - (rightIndex === -1 ? 999 : rightIndex);
    }

    const leftEpisode = extractEpisodeNumber(left);
    const rightEpisode = extractEpisodeNumber(right);
    if (leftEpisode !== null && rightEpisode !== null && leftEpisode !== rightEpisode) {
      return leftEpisode - rightEpisode;
    }

    return String(left?.html_title || left?.title || "").localeCompare(String(right?.html_title || right?.title || ""));
  });
}

function getShowSignature(show) {
  return normalizeLooseText([
    show?.name,
    show?.category,
    ...(show?.items || []).flatMap(item => [item?.title, item?.html_title])
  ].filter(Boolean).join(" "));
}

function showMatchesAny(show, patterns) {
  const signature = getShowSignature(show);
  return patterns.some(pattern => pattern.test(signature));
}

function uniqueShows(shows) {
  const seen = new Set();
  return (shows || []).filter(show => {
    if (!show?.id || seen.has(show.id)) return false;
    seen.add(show.id);
    return true;
  });
}

function filterShowsByPatterns(shows, patterns) {
  return uniqueShows(shows.filter(show => showMatchesAny(show, patterns)));
}

function getCatalogPage(show) {
  const kind = classifyShowKind(show);
  const signature = getShowSignature(show);
  const episodicPattern = /(cap(?:itulo)?|episod|episode|season|temporada|temp\b|\bs\d+\b|\bep\b|\bpart\s*\d+)/i;
  const movieish = isMovieishText(signature) || MOVIE_COLLECTION_IDS.has(show?.id);

  if (kind === "anime") return "anime";
  if (KNOWN_SERIES_IDS.has(show?.id)) return "series";
  if (show?.id === "Spider-Man" || show?.id === "Marvel" || show?.id === "MonsterVerse") return "movies";
  if (kind === "series") return "series";
  if (kind === "movie") return "movies";
  if ((kind === "live" || kind === "other") && episodicPattern.test(signature) && !movieish) return "series";
  if ((kind === "live" || kind === "other") && movieish) return "movies";
  return null;
}

function applySpecialCollections(shows) {
  const byId = new Map(shows.map(show => [show.id, {
    ...show,
    items: [...(show.items || [])],
    categories: [...new Set(show.categories || [show.category].filter(Boolean))]
  }]));

  const replaceOrInsertShow = (nextShow) => {
    const existing = byId.get(nextShow.id);
    byId.set(nextShow.id, {
      ...(existing || {}),
      ...nextShow,
      items: sortCollectionItems(nextShow.id, dedupeItemsByHref(nextShow.items)),
      categories: [...new Set(nextShow.categories || existing?.categories || [nextShow.category].filter(Boolean))],
      count: dedupeItemsByHref(nextShow.items).length
    });
  };

  const spiderItems = [];
  byId.forEach(show => {
    (show.items || []).forEach(item => {
      const combined = `${show.name} ${item?.html_title || ""} ${item?.title || ""}`;
      if (isSpiderManText(combined) && !normalizeLooseText(combined).includes("so im a spider")) {
        spiderItems.push(item);
      }
    });
  });
  if (spiderItems.length) {
    replaceOrInsertShow({
      id: "Spider-Man",
      name: "Spider-Man",
      category: "Peliculas y Series",
      categories: ["Peliculas y Series", "Directos"],
      img: byId.get("Spider-Man")?.img || byId.get("The Amazing Spider-Man")?.img || byId.get("Marvel")?.img || spiderItems[0]?.img || "images/logo.png",
      kindOverride: "movie",
      items: spiderItems
    });
    byId.delete("The Amazing Spider-Man");
    byId.delete("The Amazing Spider-Man 2");
  }

  const monsterItems = [];
  byId.forEach(show => {
    (show.items || []).forEach(item => {
      const combined = `${show.name} ${item?.html_title || ""} ${item?.title || ""}`;
      if (isMonsterVerseText(combined)) monsterItems.push(item);
    });
  });
  if (monsterItems.length) {
    replaceOrInsertShow({
      id: "MonsterVerse",
      name: "MonsterVerse",
      category: "Peliculas y Series",
      categories: ["Peliculas y Series", "General"],
      img: byId.get("MonsterVerse")?.img || byId.get("Godzilla")?.img || byId.get("Godzilla vs. Kong")?.img || monsterItems[0]?.img || "images/logo.png",
      kindOverride: "movie",
      items: monsterItems
    });
    byId.delete("Godzilla");
    byId.delete("Godzilla vs. Kong");
    byId.delete("Kong: Skull Island");
  }

  const mushokuItems = [];
  byId.forEach(show => {
    (show.items || []).forEach(item => {
      const combined = `${show.name} ${item?.html_title || ""} ${item?.title || ""}`;
      if (isMushokuText(combined) && !isMovieishText(combined)) mushokuItems.push(item);
    });
  });
  if (mushokuItems.length) {
    replaceOrInsertShow({
      id: "Mushoku Tensei",
      name: "Mushoku Tensei",
      category: "Anime",
      categories: ["Anime", "Directos"],
      img: byId.get("Mushoku Tensei")?.img || mushokuItems[0]?.img || "images/logo.png",
      items: mushokuItems
    });
    byId.delete("Mushoku Tensei S3cap");
  }

  return Array.from(byId.values()).map(show => ({
    ...show,
    count: (show.items || []).length
  }));
}

function pickDisplayCategory(show) {
  const candidates = [...new Set((show.categories || [show.category]).filter(Boolean))];
  if (!candidates.length) return show.category || "";

  const kind = classifyShowKind(show);
  if (kind === "anime" && candidates.includes("Anime")) return "Anime";
  if ((kind === "movie" || kind === "series") && candidates.includes("Peliculas y Series")) return "Peliculas y Series";

  return [...candidates].sort((left, right) => {
    return (CATEGORY_PRIORITY[left] ?? 99) - (CATEGORY_PRIORITY[right] ?? 99);
  })[0];
}

const THUMB_CACHE_KEY = 'holisofi-thumb-cache-v3';
function loadThumbCache() {
  try { return JSON.parse(localStorage.getItem(THUMB_CACHE_KEY) || '{}'); } catch (e) { return {}; }
}
function saveThumbCache(cache) {
  try { localStorage.setItem(THUMB_CACHE_KEY, JSON.stringify(cache)); } catch (e) {}
}

async function getWikiData(title) {
  if (!title) return { image: null };
  const wikiTitle = getWikiTitle(title);
  try {
    const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`);
    if (!response.ok) return { image: null };
    const data = await response.json();
    return {
      image: data?.originalimage?.source || data?.thumbnail?.source || null
    };
  } catch (_error) {
    return { image: null };
  }
}

function getShowSearchTerms(show) {
  const terms = new Set();
  const addTerm = (value) => {
    const text = String(value || '').trim().toLowerCase();
    if (text) terms.add(text);
  };

  addTerm(show.name);
  addTerm(resolveCanonical(show.name));
  addTerm(show.category);

  (show.items || []).forEach(item => {
    addTerm(item.title);
    addTerm(item.html_title);
  });

  if (typeof ALIAS_MAP !== 'undefined') {
    Object.entries(ALIAS_MAP).forEach(([alias, canonical]) => {
      if (String(canonical || '').trim().toLowerCase() === String(show.name || '').trim().toLowerCase()) {
        addTerm(alias);
      }
    });
  }

  return Array.from(terms);
}

function classifyShowKind(show) {
  if (show?.kindOverride) return show.kindOverride;
  const showName = String(show.name || '');
  if (showName.endsWith(': Movies & Specials')) return 'movie';
  if (showName.endsWith(': Live Action')) return 'series';
  if (MOVIE_COLLECTION_IDS.has(showName)) return 'movie';

  const category = String(show.category || '').toLowerCase();
  if (category.includes('anime')) return 'anime';
  if (category.includes('direct')) return 'live';
  if (category.includes('general')) return 'other';

  const combinedText = [show.name]
    .concat((show.items || []).flatMap(item => [item.title, item.html_title]))
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const episodicPattern = /(cap(?:itulo)?|episod|episode|season|temporada|temp\b|\bs\d+\b|\bep\b|\bpart\s*\d+)/i;
  const moviePattern = /(pel[ií]cula|movie|film|special|one shot|standalone)/i;

  if ((show.count || 0) === 1 && moviePattern.test(combinedText)) return 'movie';
  if (moviePattern.test(combinedText) && !episodicPattern.test(combinedText)) return 'movie';
  if ((show.count || 0) >= 3 && !episodicPattern.test(combinedText) && !category.includes('anime')) return 'movie';
  if ((show.count || 0) >= 3) return 'series';
  if (episodicPattern.test(combinedText)) return 'series';
  if ((show.count || 0) <= 1) return 'movie';
  if ((show.count || 0) === 2 && !episodicPattern.test(combinedText)) return 'movie';

  return 'series';
}

function normalizeLooseText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getDetailGroupKind(show) {
  if (show?.kindOverride) return show.kindOverride;
  const showName = String(show.name || '');
  if (showName.endsWith(': Movies & Specials')) return 'movie';
  if (showName.endsWith(': Live Action')) return 'series';
  if (MOVIE_COLLECTION_IDS.has(showName)) return 'movie';

  const combinedText = [show.name]
    .concat((show.items || []).flatMap(item => [item.title, item.html_title]))
    .filter(Boolean)
    .join(' ');

  const episodicPattern = /(cap(?:itulo)?|episod|episode|season|temporada|temp\b|\bs\d+\b|\bep\b|\bpart\s*\d+)/i;
  const moviePattern = /(pel[ií]cula|movie|film|special|ova|one shot|standalone)/i;
  if (moviePattern.test(combinedText) && !episodicPattern.test(combinedText)) return 'movie';
  if ((show.count || 0) >= 2 && episodicPattern.test(combinedText)) return 'series';
  if ((show.count || 0) >= 3) return 'series';
  return 'movie';
}

function getFranchiseKey(rawName) {
  const normalized = normalizeLooseText(resolveCanonical(rawName));
  if (!normalized) return '';
  if (/spider man|spiderman|amazing spider man|homecoming/.test(normalized)) return 'spider-man';
  if (/monsterverse|godzilla|kong skull island|kong vs godzilla|godzilla vs kong|godzilla x kong/.test(normalized)) return 'monsterverse';
  if (/lost canvas/.test(normalized)) return 'saint seiya lost canvas';
  if (/mushoku tensei|pajin|roxygod/.test(normalized)) return 'mushoku tensei';
  if (/(dragon ball|padre ball|bolas dragon)/.test(normalized)) return 'dragon ball';
  if (normalized.includes('saint seiya')) return 'saint seiya';
  if (normalized.includes('bleach')) return 'bleach';
  if (normalized.includes('naruto')) return 'naruto';
  if (normalized.includes('one piece')) return 'one piece';

  const withoutDecorators = normalized
    .replace(/\b(movie|film|pelicula|special|ova|capitulos|capitulo|episodios|episodio|season|temporada|temp|part)\b.*$/, '')
    .replace(/\s+/g, ' ')
    .trim();

  const beforeColon = withoutDecorators.split(':')[0].trim();
  return beforeColon || withoutDecorators || normalized;
}

function extractEpisodeNumber(item) {
  const text = `${item?.html_title || ''} ${item?.title || ''}`;
  const patterns = [
    /\[cap\s*(\d+)(?:-\d+)?\]/i,
    /\[\s*s(\d+)\s*\|\s*cap\s*(\d+)(?:-\d+)?\s*\]/i,
    /\bcap(?:itulo)?\s*(\d+)\b/i,
    /\bepisod(?:io|e)?\s*(\d+)\b/i,
    /\bep\s*(\d+)\b/i,
    /\bs(\d+)\s*e(\d+)\b/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[2] ? Number(match[2]) : Number(match[1]);
    }
  }

  const fallback = text.match(/\b(\d{1,4})\b/);
  return fallback ? Number(fallback[1]) : null;
}

function getCategorySortValue(categoryName) {
  const normalized = normalizeLooseText(categoryName);
  if (normalized.includes('ova') || normalized.includes('pelicula')) return 999;
  const match = normalized.match(/(\d+)/);
  return match ? Number(match[1]) : 1;
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const data = window.HOLISOFI_DATA || [];
        const contentState = window.CONTENT_STATE || {};
        const urlPath = window.location.pathname;
        const path = urlPath.split("/").pop() || "index.html";
        const urlParams = new URLSearchParams(window.location.search);
        
        const groupMap = new Map();

            // First pass: Merge items logically using Alias_Map
            data.forEach(cat => {
                (cat.subcategories || []).forEach(sub => {
                    if(!sub.items || sub.items.length === 0) return;

                    sub.items.forEach(item => {
                        const canonicalName = inferCanonicalShowName(sub.name, item);

                        if (!groupMap.has(canonicalName)) {
                            groupMap.set(canonicalName, {
                                id: canonicalName,
                                name: canonicalName,
                                category: cat.name,
                                categories: new Set([cat.name]),
                                items: [],
                                img: item.img || sub.items[0].img || 'images/logo.png',
                                wikiImg: null
                            });
                        }

                        const group = groupMap.get(canonicalName);
                        group.categories.add(cat.name);
                        group.items.push(item);
                        if (!group.img && item.img) group.img = item.img;
                    });
                });
            });

            // Deduplicate items by href within each group
            groupMap.forEach(group => {
                const seen = new Set();
                group.items = group.items.filter(item => {
                    const href = String(item.href || '').trim();
                    if (!href || seen.has(href)) return false;
                    seen.add(href);
                    return true;
                });
            });

            let allShows = Array.from(groupMap.values()).map(g => ({
                ...g,
                categories: Array.from(g.categories || []),
                count: g.items.length
            }));

            allShows = applySpecialCollections(allShows).map(show => ({
                ...show,
                category: pickDisplayCategory(show)
            }));
            
            // Check cache
            const cache = loadThumbCache();
            const referenceImages = window.REFERENCE_IMAGES || {};
            allShows.forEach(show => {
                if (referenceImages[show.name]) {
                    show.img = referenceImages[show.name];
                    show.wikiImg = referenceImages[show.name];
                    return;
                }
                const cached = cache[show.name];
                if(cached && cached.image) {
                    show.img = cached.image;
                    show.wikiImg = cached.image;
                }
            });

            const container = document.getElementById("catalog-container");
            const searchInput = document.getElementById("search-input");
            const searchStatus = document.getElementById("search-status");

            const clearContainer = () => {
                if (container) container.innerHTML = "";
            };

            const renderShowRow = (title, shows) => {
                if(!container) return;
                const section = document.createElement("section");
                section.className = "catalog-row-section";
                
                const header = document.createElement("div");
                header.className = "catalog-row-header";

                const titleEl = document.createElement("h2");
                titleEl.className = "font-headline text-2xl font-bold tracking-tight text-on-surface uppercase border-l-4 border-primary-container pl-4";
                titleEl.textContent = title;
                header.appendChild(titleEl);

                const controls = document.createElement("div");
                controls.className = "catalog-row-controls";

                const prevBtn = document.createElement("button");
                prevBtn.className = "catalog-row-nav";
                prevBtn.type = "button";
                prevBtn.setAttribute("aria-label", `Ver contenido anterior en ${title}`);
                prevBtn.innerHTML = '<span class="material-symbols-outlined">chevron_left</span>';

                const nextBtn = document.createElement("button");
                nextBtn.className = "catalog-row-nav";
                nextBtn.type = "button";
                nextBtn.setAttribute("aria-label", `Ver mas contenido en ${title}`);
                nextBtn.innerHTML = '<span class="material-symbols-outlined">chevron_right</span>';

                controls.appendChild(prevBtn);
                controls.appendChild(nextBtn);
                header.appendChild(controls);
                section.appendChild(header);

                const rowDiv = document.createElement("div");
                rowDiv.className = "catalog-row-track no-scrollbar";

                shows.forEach(show => {
                    const card = document.createElement("a");
                    card.href = `details.html?show=${encodeURIComponent(show.id)}`;
                    card.className = "flex-none flex flex-col gap-3 group w-40 md:w-48 cursor-pointer";

                    const imgWrap = document.createElement("div");
                    imgWrap.className = "relative aspect-[2/3] bg-surface-container rounded-xl overflow-hidden shadow-2xl border-2 border-transparent group-hover:border-primary-container transition-colors";
                    
                    const img = document.createElement("img");
                    img.src = show.img;
                    img.className = "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100 show-thumbnail-" + btoa(unescape(encodeURIComponent(show.name))).replace(/[^a-zA-Z]/g, '');
                    img.alt = show.name;
                    
                    imgWrap.appendChild(img);

                    const titleText = document.createElement("h3");
                    titleText.className = "text-sm font-bold text-on-surface truncate";
                    titleText.textContent = show.name;

                    const subText = document.createElement("p");
                    subText.className = "text-[10px] text-on-surface-variant uppercase tracking-tighter truncate opacity-80";
                    subText.textContent = `${show.category} • ${show.count} vídeos`;

                    card.appendChild(imgWrap);
                    card.appendChild(titleText);
                    card.appendChild(subText);
                    rowDiv.appendChild(card);
                });

                const syncRowButtons = () => {
                  const maxScrollLeft = Math.max(0, rowDiv.scrollWidth - rowDiv.clientWidth);
                  prevBtn.disabled = rowDiv.scrollLeft <= 8;
                  nextBtn.disabled = rowDiv.scrollLeft >= maxScrollLeft - 8;
                };

                const scrollRow = (direction) => {
                  const amount = Math.max(rowDiv.clientWidth * 0.85, 260);
                  rowDiv.scrollBy({ left: amount * direction, behavior: "smooth" });
                };

                prevBtn.addEventListener("click", () => scrollRow(-1));
                nextBtn.addEventListener("click", () => scrollRow(1));
                rowDiv.addEventListener("scroll", syncRowButtons, { passive: true });
                window.requestAnimationFrame(syncRowButtons);
                
                section.appendChild(rowDiv);
                container.appendChild(section);
            };

            const renderShowGrid = (title, shows, emptyMessage) => {
                if (!container) return;

                const section = document.createElement("section");
                section.className = "mb-12";

                const titleEl = document.createElement("h2");
                titleEl.className = "font-headline text-2xl font-bold tracking-tight text-on-surface mb-6 uppercase border-l-4 border-primary-container pl-4";
                titleEl.textContent = title;
                section.appendChild(titleEl);

                if (!shows.length) {
                    const emptyEl = document.createElement("p");
                    emptyEl.className = "text-sm text-on-surface-variant";
                    emptyEl.textContent = emptyMessage;
                    section.appendChild(emptyEl);
                    container.appendChild(section);
                    return;
                }

                const grid = document.createElement("div");
                grid.className = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5";

                shows.forEach(show => {
                    const card = document.createElement("a");
                    card.href = `details.html?show=${encodeURIComponent(show.id)}`;
                    card.className = "flex flex-col gap-3 group min-w-0";

                    const imgWrap = document.createElement("div");
                    imgWrap.className = "relative aspect-[2/3] bg-surface-container rounded-xl overflow-hidden shadow-2xl border border-transparent group-hover:border-primary-container/70 transition-colors";

                    const img = document.createElement("img");
                    img.src = show.img;
                    img.className = "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100 show-thumbnail-" + btoa(unescape(encodeURIComponent(show.name))).replace(/[^a-zA-Z]/g, '');
                    img.alt = show.name;

                    const meta = document.createElement("p");
                    meta.className = "text-[10px] text-on-surface-variant uppercase tracking-tighter opacity-80";
                    meta.textContent = `${show.category} • ${show.count} videos`;

                    const titleText = document.createElement("h3");
                    titleText.className = "text-sm font-bold text-on-surface line-clamp-2";
                    titleText.textContent = show.name;

                    imgWrap.appendChild(img);
                    card.appendChild(imgWrap);
                    card.appendChild(titleText);
                    card.appendChild(meta);
                    grid.appendChild(card);
                });

                section.appendChild(grid);
                container.appendChild(section);
            };

            const shuffle = (array) => {
                let arr = [...array];
                for (let i = arr.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                }
                return arr;
            };

            const resolveRankedShows = (rankingKey, fallbackShows, limit) => {
                const orderedIds = contentState?.rankings?.[rankingKey] || [];
                const byId = new Map(fallbackShows.map(show => [show.id, show]));
                const ranked = orderedIds
                    .map(id => byId.get(id))
                    .filter(Boolean);

                const seen = new Set(ranked.map(show => show.id));
                const fill = fallbackShows.filter(show => !seen.has(show.id));
                return ranked.concat(fill).slice(0, limit);
            };

            const getShowStats = (show) => contentState?.show_stats?.[show?.id] || {};

            const sortShowsByStats = (shows, primaryKey, secondaryKey = "latestTimestamp") => {
                return [...shows].sort((left, right) => {
                    const leftStats = getShowStats(left);
                    const rightStats = getShowStats(right);
                    const leftPrimary = Number(leftStats[primaryKey] || 0);
                    const rightPrimary = Number(rightStats[primaryKey] || 0);

                    if (rightPrimary !== leftPrimary) return rightPrimary - leftPrimary;

                    const leftSecondary = Number(leftStats[secondaryKey] || 0);
                    const rightSecondary = Number(rightStats[secondaryKey] || 0);
                    if (rightSecondary !== leftSecondary) return rightSecondary - leftSecondary;

                    return String(left.name || "").localeCompare(String(right.name || ""));
                });
            };

            const getShowById = (id) => allShows.find(show => show.id === id);

            const getExistingShows = (ids) => ids
                .map(getShowById)
                .filter(Boolean);

            const buildCatalogSections = (pageKey, shows) => {
                const latestShows = sortShowsByStats(shows, "latestTimestamp");
                const popularShows = sortShowsByStats(shows, "viewsLast180d", "totalViews");

                if (pageKey === "anime") {
                    return [
                        { title: "Nuevos episodios", type: "row", shows: resolveRankedShows("recent_added", latestShows, 14) },
                        { title: "Top anime de la semana", type: "row", shows: resolveRankedShows("top_anime_semana", sortShowsByStats(shows, "viewsLast7d", "totalViews"), 14) },
                        { title: "Shonen y batallas", type: "row", shows: filterShowsByPatterns(shows, [/dragon ball|naruto|bleach|one piece|jujutsu|chainsaw|baki|kengan|jojo|black clover|fairy tail|my hero|fire force|dr stone|record of ragnarok|mob psycho|one punch/i]) },
                        { title: "Fantasia e isekai", type: "row", shows: filterShowsByPatterns(shows, [/mushoku|re zero|overlord|konosuba|frieren|danmachi|fate|sword art|no game no life|tsukimichi|made in abyss|eminence in shadow|iruma/i]) },
                        { title: "Romance y drama", type: "row", shows: filterShowsByPatterns(shows, [/dress up darling|golden time|silent voice|your lie in april|quintessential|komi|alya|violet evergarden|kaguya|weathering with you|i want to eat your pancreas/i]) },
                        { title: "Deportes y competencia", type: "row", shows: filterShowsByPatterns(shows, [/haikyu|blue lock|kuroko|ippo|uma musume/i]) },
                        { title: "Todo el anime", type: "grid", shows: popularShows, empty: "No encontramos anime para mostrar." }
                    ];
                }

                if (pageKey === "movies") {
                    return [
                        { title: "Estrenos recientes", type: "row", shows: resolveRankedShows("recent_added", latestShows, 14) },
                        { title: "Tendencias ahora", type: "row", shows: resolveRankedShows("populares_sofi_tv", popularShows, 14) },
                        { title: "Universos y sagas", type: "row", shows: getExistingShows(["Spider-Man", "Marvel", "MonsterVerse"]) },
                        { title: "Superheroes y accion", type: "row", shows: filterShowsByPatterns(shows, [/marvel|spider man|spiderman|iron man|avengers|doctor strange|thor|black panther|ant man|hulk|monsterverse|godzilla|kong|rambo/i]) },
                        { title: "Suspenso y terror", type: "row", shows: filterShowsByPatterns(shows, [/mindhunter|conjuring|saw|alien|\bit\b|matrix|knowing|codigo traje rojo/i]) },
                        { title: "Familia y animacion", type: "row", shows: filterShowsByPatterns(shows, [/cars|megamind|rise of the guardians|jingle all the way|monsters vs aliens/i]) },
                        { title: "Todo en peliculas", type: "grid", shows: popularShows, empty: "No encontramos peliculas para mostrar." }
                    ];
                }

                return [
                    { title: "Nuevas en catalogo", type: "row", shows: latestShows.slice(0, 14) },
                    { title: "Tendencias para maraton", type: "row", shows: popularShows.slice(0, 14) },
                    { title: "Crimen y suspenso", type: "row", shows: filterShowsByPatterns(shows, [/mindhunter|game of thrones|casa de papel|psycho pass|monster|shannara|death note/i]) },
                    { title: "Fantasia y sci-fi", type: "row", shows: filterShowsByPatterns(shows, [/code geass|steins gate|shannara|ghost in the shell|ergo proxy|summertime|legend of korra|one piece live action/i]) },
                    { title: "Culto y maratones", type: "row", shows: filterShowsByPatterns(shows, [/mindhunter|game of thrones|casa de papel|one piece live action|shannara/i]) },
                    { title: "Todas las series", type: "grid", shows: popularShows, empty: "No encontramos series para mostrar." }
                ];
            };

            const renderCatalogSections = (sections) => {
                sections.forEach(section => {
                    if (!section.shows || !section.shows.length) return;
                    if (section.type === "grid") {
                        renderShowGrid(section.title, uniqueShows(section.shows), section.empty || "No encontramos contenido para mostrar.");
                        return;
                    }
                    renderShowRow(section.title, uniqueShows(section.shows));
                });
            };

            const scoreSearchMatch = (show, rawQuery, normalizedQuery) => {
                const query = String(rawQuery || "").trim().toLowerCase();
                const normalized = String(normalizedQuery || "").trim().toLowerCase();
                const terms = getShowSearchTerms(show);

                let score = 0;
                terms.forEach(term => {
                    if (!term) return;
                    if (term === query || term === normalized) score = Math.max(score, 120);
                    else if (term.startsWith(query) || term.startsWith(normalized)) score = Math.max(score, 90);
                    else if (term.includes(query) || term.includes(normalized)) score = Math.max(score, 70);
                });

                const showName = String(show.name || "").toLowerCase();
                if (showName === query || showName === normalized) score += 20;
                else if (showName.startsWith(query) || showName.startsWith(normalized)) score += 10;

                return score;
            };

            const parseSeason = (title) => {
                const lower = title.toLowerCase();
                const sMatch = lower.match(/(?:temp |s|temporada )(\d+)/) || title.match(/\[\s*S(\d+)/i);
                if (sMatch) return `Temporada ${sMatch[1]}`;
                if (lower.includes("ova") || lower.includes("pelicula") || lower.includes("película")) return "OVAs y Películas";
                return "Temporada 1";
            };

            const createEpisodeCard = (item, playlist, playlistIndex, badgeText) => {
                const card = document.createElement("div");
                card.className = "flex flex-col gap-3 group cursor-pointer border border-transparent hover:border-primary-container/60 p-2 rounded-xl transition-all";
                card.setAttribute("role", "button");
                card.setAttribute("tabindex", "0");

                const wrap = document.createElement("div");
                wrap.className = "relative aspect-video rounded-xl overflow-hidden bg-surface-container shadow-xl";

                const img = document.createElement("img");
                img.src = item.img || 'images/logo.png';
                img.className = "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100";
                img.alt = item.html_title || item.title || "Video";

                const playBg = document.createElement("div");
                playBg.className = "absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity";
                playBg.innerHTML = `<span class="material-symbols-outlined text-white" style="font-size:52px;font-variation-settings:'FILL' 1;text-shadow:0 2px 16px rgba(0,0,0,0.8);">play_circle</span>`;

                const badge = document.createElement("div");
                badge.className = "absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#e50914] text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm";
                badge.textContent = "Ver ahora";

                wrap.appendChild(img);
                wrap.appendChild(playBg);
                wrap.appendChild(badge);

                const title = document.createElement("h3");
                title.className = "text-sm font-bold text-on-surface line-clamp-2 leading-snug";
                title.textContent = item.html_title || item.title || "Video";

                const meta = document.createElement("p");
                meta.className = "text-[10px] text-on-surface-variant uppercase tracking-widest opacity-60 mt-0.5";
                meta.textContent = badgeText;

                card.appendChild(wrap);
                card.appendChild(title);
                card.appendChild(meta);

                const handlePlay = (event) => {
                    event.preventDefault();
                    if (window.SofiPlayer) window.SofiPlayer.open(playlist, playlistIndex);
                };

                card.addEventListener("click", handlePlay);
                card.addEventListener("keydown", event => {
                    if (event.key === "Enter" || event.key === " ") handlePlay(event);
                });

                return card;
            };

            const renderDetailSectionTitle = (title, level = "h2") => {
                const heading = document.createElement(level);
                heading.className = level === "h2"
                    ? "font-headline text-2xl font-bold tracking-tight text-on-surface mb-6 border-l-4 border-primary-container pl-4 mt-8"
                    : "font-headline text-lg font-semibold tracking-tight text-on-surface mb-4";
                heading.textContent = title;
                container.appendChild(heading);
            };

            const animeShows = allShows.filter(show => getCatalogPage(show) === "anime");
            const movieShows = allShows.filter(show => getCatalogPage(show) === "movies");
            const seriesShows = allShows.filter(show => getCatalogPage(show) === "series");

            const renderSearchState = (query) => {
                if (!container) return;
                clearContainer();

                const rawQuery = String(query || "").trim().toLowerCase();
                const normalizedQuery = resolveCanonical(rawQuery).toLowerCase();

                if (searchStatus) {
                    searchStatus.textContent = rawQuery
                        ? `Resultados para "${query.trim()}"`
                        : "Explora por nombre, alias o categoria";
                }

                if (!rawQuery) {
                    renderShowRow("Resultados populares", resolveRankedShows("populares_sofi_tv", sortShowsByStats(allShows, "viewsLast180d", "totalViews"), 12));
                    renderShowRow("Recien agregados", resolveRankedShows("recent_added", sortShowsByStats(allShows, "latestTimestamp"), 12));
                    return;
                }

                const matches = allShows
                    .map(show => ({
                        show,
                        score: scoreSearchMatch(show, rawQuery, normalizedQuery)
                    }))
                    .filter(entry => entry.score > 0)
                    .sort((left, right) => {
                        if (right.score !== left.score) return right.score - left.score;

                        const leftStats = getShowStats(left.show);
                        const rightStats = getShowStats(right.show);
                        const growthDiff = Number(rightStats.viewsLast180d || 0) - Number(leftStats.viewsLast180d || 0);
                        if (growthDiff !== 0) return growthDiff;

                        const viewsDiff = Number(rightStats.totalViews || 0) - Number(leftStats.totalViews || 0);
                        if (viewsDiff !== 0) return viewsDiff;

                        return Number(rightStats.latestTimestamp || 0) - Number(leftStats.latestTimestamp || 0);
                    })
                    .map(entry => entry.show);

                renderShowGrid("Resultados", matches, "No encontramos series o peliculas con ese termino.");
            };

            // Initial Render (fast)
            if (path === "details.html" || path.includes("details")) {
                const showId = urlParams.get('show');
                const show = allShows.find(s => s.id === showId);
                
                if(show) {
                    const franchiseKey = getFranchiseKey(show.name);
                    const relatedShows = allShows.filter(candidate => getFranchiseKey(candidate.name) === franchiseKey);
                    const movieCollections = relatedShows.filter(candidate => getDetailGroupKind(candidate) === "movie");
                    const episodicCollections = relatedShows.filter(candidate => getDetailGroupKind(candidate) === "series");
                    const standaloneMovieItems = getDetailGroupKind(show) === "movie"
                        ? sortCollectionItems(show.id, dedupeItemsByHref(show.items || []))
                        : [];

                    const heroTitle = document.querySelector('h1.font-headline');
                    if(heroTitle) heroTitle.innerHTML = relatedShows.length > 1 ? show.name : show.name;
                    
                    const pDesc = document.querySelector('p.text-on-surface-variant.max-w-2xl');
                    if(pDesc) {
                        const summaryParts = [];
                        if (movieCollections.length) summaryParts.push(`${movieCollections.length} pelicula${movieCollections.length === 1 ? "" : "s"}`);
                        if (episodicCollections.length) summaryParts.push(`${episodicCollections.length} bloque${episodicCollections.length === 1 ? "" : "s"} de episodios`);
                        pDesc.textContent = `Contenido organizado en una sola vista con ${summaryParts.join(" y ")} para ${show.name}.`;
                    }
                    
                    const heroSec = document.querySelector('section[class*="h-[870px]"]');
                    if(heroSec) {
                        const heroBg = heroSec.querySelector('img.object-cover');
                        if(heroBg) heroBg.src = show.img;
                    }
                    
                    if(container) {
                        clearContainer();

                        if (standaloneMovieItems.length > 1) {
                            renderDetailSectionTitle("Peliculas");
                            const movieGrid = document.createElement("div");
                            movieGrid.className = "grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12";

                            standaloneMovieItems.forEach((item, index) => {
                                movieGrid.appendChild(createEpisodeCard(item, standaloneMovieItems, index, "Pelicula"));
                            });

                            container.appendChild(movieGrid);
                        } else if (movieCollections.length) {
                            renderDetailSectionTitle("Peliculas");
                            const movieGrid = document.createElement("div");
                            movieGrid.className = "grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12";

                            movieCollections.forEach(movieShow => {
                                const playlist = sortCollectionItems(movieShow.id, [...movieShow.items]);
                                const item = playlist[0];
                                movieGrid.appendChild(createEpisodeCard(item, playlist, 0, "Pelicula"));
                            });

                            container.appendChild(movieGrid);
                        }

                        episodicCollections
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .forEach(collection => {
                                const sortedPlaylist = [...collection.items].sort((left, right) => {
                                    const leftCategory = parseSeason(left.html_title || left.title || "");
                                    const rightCategory = parseSeason(right.html_title || right.title || "");
                                    const categoryDiff = getCategorySortValue(leftCategory) - getCategorySortValue(rightCategory);
                                    if (categoryDiff !== 0) return categoryDiff;

                                    const leftEpisode = extractEpisodeNumber(left);
                                    const rightEpisode = extractEpisodeNumber(right);
                                    if (leftEpisode !== null && rightEpisode !== null && leftEpisode !== rightEpisode) {
                                        return leftEpisode - rightEpisode;
                                    }

                                    return String(left.html_title || left.title || "").localeCompare(String(right.html_title || right.title || ""));
                                });

                                renderDetailSectionTitle(collection.name);

                                const groupedItems = new Map();
                                sortedPlaylist.forEach(item => {
                                    const categoryName = parseSeason(item.html_title || item.title || "");
                                    if (!groupedItems.has(categoryName)) groupedItems.set(categoryName, []);
                                    groupedItems.get(categoryName).push(item);
                                });

                                Array.from(groupedItems.entries())
                                    .sort((left, right) => getCategorySortValue(left[0]) - getCategorySortValue(right[0]))
                                    .forEach(([categoryName, items]) => {
                                        renderDetailSectionTitle(categoryName, "h3");

                                        const grid = document.createElement("div");
                                        grid.className = "grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12";

                                        items.forEach((item, index) => {
                                            const playlistIndex = sortedPlaylist.indexOf(item);
                                            const episodeNumber = extractEpisodeNumber(item);
                                            const badgeText = episodeNumber !== null
                                                ? `Ep ${episodeNumber}`
                                                : `Ep ${index + 1}`;
                                            grid.appendChild(createEpisodeCard(item, sortedPlaylist, playlistIndex, badgeText));
                                        });

                                        container.appendChild(grid);
                                    });
                            });
                    }
                } else {
                    if (container) container.innerHTML = "<h2 class='text-on-surface text-xl mb-96'>Serie no encontrada.</h2>";
                }
            } 
            else if (path.includes("animes.html")) {
                renderCatalogSections(buildCatalogSections("anime", animeShows));
            }
            else if (path.includes("movies.html")) {
                renderCatalogSections(buildCatalogSections("movies", movieShows));
            }
            else if (path.includes("series.html")) {
                renderCatalogSections(buildCatalogSections("series", seriesShows));
            }
            else if (path.includes("my_list.html")) {
                renderShowRow("Tendencias para guardar", resolveRankedShows("populares_sofi_tv", sortShowsByStats(allShows, "viewsLast180d", "totalViews"), 12));
                renderShowRow("Peliculas para tu lista", resolveRankedShows("noche_de_peliculas", sortShowsByStats(movieShows, "viewsLast180d", "totalViews"), 10));
                renderShowRow("Animes destacados", resolveRankedShows("top_anime_semana", sortShowsByStats(animeShows, "viewsLast7d", "totalViews"), 10));
            }
            else if (path.includes("profile.html")) {
                clearContainer();
            }
            else if (path.includes("search.html")) {
                if (searchInput) {
                    const initialQuery = urlParams.get("q") || "";
                    searchInput.value = initialQuery;
                    renderSearchState(initialQuery);
                    searchInput.addEventListener("input", (event) => {
                        const nextQuery = event.target.value;
                        const nextUrl = nextQuery.trim() ? `?q=${encodeURIComponent(nextQuery.trim())}` : window.location.pathname.split("/").pop();
                        window.history.replaceState({}, "", nextQuery.trim() ? nextUrl : "search.html");
                        renderSearchState(nextQuery);
                    });
                } else {
                    renderSearchState("");
                }
            }
            else {
                // index.html
                renderShowRow("Agregado Recientemente", resolveRankedShows("recent_added", allShows.slice().reverse(), 12));
                renderShowRow("Populares en Sofi TV", resolveRankedShows("populares_sofi_tv", shuffle(allShows), 12));
                renderShowRow("Sagas y universos", getExistingShows(["Spider-Man", "Marvel", "MonsterVerse"]));
                renderShowRow("Top Animes de la Semana", resolveRankedShows("top_anime_semana", animeShows, 10));
                renderShowRow("Noche de Peliculas", resolveRankedShows("noche_de_peliculas", movieShows, 10));
            }

            // Hydrate Wiki Images asynchronously
            const needsFetch = allShows.filter(s => !s.wikiImg && !referenceImages[s.name]);
            for (let i = 0; i < needsFetch.length; i++) {
                const show = needsFetch[i];
                const res = await getWikiData(show.name);
                if (res.image) {
                    show.img = res.image;
                    show.wikiImg = res.image;
                    cache[show.name] = { image: res.image };
                    
                    // Update DOM incrementally
                    const safeClass = btoa(unescape(encodeURIComponent(show.name))).replace(/[^a-zA-Z]/g, '');
                    const imgElems = document.querySelectorAll(".show-thumbnail-" + safeClass);
                    imgElems.forEach(el => el.src = res.image);
                }
            }
            saveThumbCache(cache);
        } catch (err) {
            console.error("Error loading data:", err);
        }
});
