import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT_DIR = path.resolve(__dirname, "../..");
export const DATA_JS_PATH = path.join(ROOT_DIR, "data.js");
export const DATA_JSON_PATH = path.join(ROOT_DIR, "data.json");
export const ALIAS_MAP_PATH = path.join(ROOT_DIR, "alias_map.js");
export const REFERENCE_IMAGES_JS_PATH = path.join(ROOT_DIR, "reference_images.js");
export const CONTENT_STATE_JS_PATH = path.join(ROOT_DIR, "content_state.js");
export const CONTENT_STATE_JSON_PATH = path.join(ROOT_DIR, "content_state.json");
export const CONTENT_METRICS_JSON_PATH = path.join(ROOT_DIR, "content_metrics.json");
export const CONTENT_SNAPSHOTS_JSON_PATH = path.join(ROOT_DIR, "content_snapshots.json");
export const REFERENCE_IMAGE_DIR = path.join(ROOT_DIR, "images", "reference");

const MOVIEISH_PATTERN = /(pelicula|peliculas|movie|film|ova|ovas|special|prisioneros del cielo|super hero|parte 1\/2|parte 2\/2)/i;
const EPISODIC_PATTERN = /(\bcap\b|epis|season|temporada|temp|\bs\d+\b)/i;

const MARVEL_TITLES = new Set([
  "Iron Man",
  "The Avengers",
  "Avengers: Age of Ultron",
  "Avengers: Infinity War",
  "Captain America: Civil War",
  "Doctor Strange",
  "Guardians of the Galaxy",
  "The Incredible Hulk",
  "Black Panther",
  "Thor: Ragnarok",
  "Ant-Man",
  "Spider-Man: Homecoming",
]);

const WIKI_TITLE_OVERRIDES = {
  "Marvel": "Marvel Cinematic Universe",
  "MonsterVerse": "MonsterVerse",
  "One Piece: Live Action": "One Piece (2023 TV series)",
  "The Amazing Spider-Man": "The Amazing Spider-Man (2012 film)",
  "The Amazing Spider-Man 2": "The Amazing Spider-Man 2",
  "Black Panther": "Black Panther (film)",
  "Doctor Strange": "Doctor Strange (2016 film)",
  "Iron Man": "Iron Man (2008 film)",
  "Guardians of the Galaxy": "Guardians of the Galaxy (film)",
  "The Incredible Hulk": "The Incredible Hulk (film)",
  "Delicious in Dungeon": "Delicious in Dungeon",
};

export function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isMovieishText(value) {
  return MOVIEISH_PATTERN.test(String(value || ""));
}

function isSpiderManText(value) {
  return /(spider man|spiderman|amazing spider man|hombre tarantula|homecoming)/.test(normalizeText(value));
}

function isMonsterVerseText(value) {
  const normalized = normalizeText(value);
  return !normalized.includes("monsters vs aliens") && /(monsterverse|godzilla|kong skull island|kong vs godzilla|godzilla vs kong|godzilla x kong)/.test(normalized);
}

function isMushokuText(value) {
  return /(mushoku tensei|pajin|roxygod)/.test(normalizeText(value));
}

function isLostCanvasText(value) {
  return /lost canvas/.test(normalizeText(value));
}

export function slugify(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
}

function dedupeItems(items) {
  const seen = new Set();
  return (items || []).filter((item) => {
    const href = String(item?.href || "").trim();
    const key = href || `${item?.title || ""}|${item?.html_title || ""}`;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function evaluateScript(filePath, trailer = "") {
  const context = { window: {}, console };
  vm.createContext(context);
  const source = fs.readFileSync(filePath, "utf8");
  vm.runInContext(`${source}\n${trailer}`, context);
  return context;
}

export function loadAliasMap() {
  const context = evaluateScript(ALIAS_MAP_PATH, "this.__aliasMap = ALIAS_MAP;");
  return context.__aliasMap || {};
}

export function loadData() {
  const context = evaluateScript(DATA_JS_PATH);
  return context.window.HOLISOFI_DATA || [];
}

export function saveData(data) {
  fs.writeFileSync(DATA_JSON_PATH, `${JSON.stringify(data, null, 2)}\n`);
  fs.writeFileSync(DATA_JS_PATH, `window.HOLISOFI_DATA =\n${JSON.stringify(data, null, 2)};\n`);
}

export function readJsonIfExists(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_error) {
    return fallback;
  }
}

export function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export function appendSnapshots(metrics, previousSnapshots = {}, options = {}) {
  const capturedAt = options.capturedAt || new Date().toISOString();
  const nextSnapshots = { ...previousSnapshots };

  for (const [href, metric] of Object.entries(metrics || {})) {
    const viewsTotal = Number(metric?.views_total || 0);
    if (!href) continue;

    const history = Array.isArray(nextSnapshots[href]) ? [...nextSnapshots[href]] : [];
    const lastEntry = history[history.length - 1];
    if (!lastEntry || lastEntry.views_total !== viewsTotal) {
      history.push({
        captured_at: capturedAt,
        views_total: viewsTotal,
      });
    }

    nextSnapshots[href] = history.slice(-180);
  }

  return nextSnapshots;
}

function getGrowthFromSnapshots(history, now, windowDays) {
  if (!Array.isArray(history) || !history.length) return 0;

  const nowMs = now.getTime();
  const targetMs = nowMs - windowDays * 24 * 60 * 60 * 1000;
  const current = history[history.length - 1];

  let baseline = null;
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const entry = history[index];
    const entryMs = new Date(entry.captured_at).getTime();
    if (entryMs <= targetMs) {
      baseline = entry;
      break;
    }
  }

  if (!baseline) baseline = history[0];
  return Math.max(0, Number(current?.views_total || 0) - Number(baseline?.views_total || 0));
}

export function parseVideoId(href) {
  const match = canonicalizeVideoHref(href).match(/\/video\/(\d+)/);
  return match ? match[1] : "";
}

export function canonicalizeVideoHref(href) {
  const videoId = String(href || "").match(/\/video\/(\d+)/)?.[1];
  return videoId ? `https://ok.ru/video/${videoId}` : String(href || "").trim();
}

function baseCanonical(subcategoryName, aliasMap) {
  const normalized = String(subcategoryName || "").trim().toLowerCase();
  return aliasMap[normalized] || String(subcategoryName || "").trim();
}

export function inferCanonicalFromItem(subcategoryName, title, aliasMap) {
  const base = baseCanonical(subcategoryName, aliasMap);
  const text = normalizeText(title);
  const source = normalizeText(subcategoryName);
  const canonical = normalizeText(base);
  const combined = `${text} ${source} ${canonical}`;

  if (isLostCanvasText(combined)) return "Saint Seiya: The Lost Canvas";
  if (isMonsterVerseText(combined)) return "MonsterVerse";
  if (canonical !== "marvel" && isSpiderManText(combined)) return "Spider-Man";
  if (isMushokuText(combined)) {
    return isMovieishText(title) ? "Mushoku Tensei: Movies & Specials" : "Mushoku Tensei";
  }

  if (text.includes("avengers: infinity war")) return "Marvel";
  if (text.includes("black panther")) return "Marvel";
  if (text.includes("thor: ragnarok")) return "Marvel";
  if (text.includes("spiderman: homecoming")) return "Marvel";
  if (text.includes("doctor strange")) return "Marvel";
  if (text.includes("iron man")) return "Marvel";
  if (text.includes("guardians of the galaxy")) return "Marvel";
  if (text.includes("hulk")) return "Marvel";
  if (text.includes("ant-man")) return "Marvel";
  if (text.includes("civil war")) return "Marvel";
  if (text.includes("ultron")) return "Marvel";
  if (text.includes("live action")) return "One Piece: Live Action";
  if (text.includes("the amazing spiderman 2")) return "The Amazing Spider-Man 2";
  if (text.includes("the amazing spiderman")) return "The Amazing Spider-Man";

  if (/(kokun|dragon ball|padre ball|bolas al dragon)/.test(`${text} ${source} ${canonical}`)) {
    if (/super hero|zuper|zzzuper|dragon ball super/.test(text)) {
      return MOVIEISH_PATTERN.test(text) ? "Dragon Ball Super: Movies & Specials" : "Dragon Ball Super";
    }
    if (/\bgt\b/.test(text)) {
      return MOVIEISH_PATTERN.test(text) ? "Dragon Ball GT: Movies & Specials" : "Dragon Ball GT";
    }
    if (/\bz\b|kokun \d|kokun ova|kokun z/.test(text)) {
      return MOVIEISH_PATTERN.test(text) ? "Dragon Ball Z: Movies & Specials" : "Dragon Ball Z";
    }
    return MOVIEISH_PATTERN.test(text) ? "Dragon Ball: Movies & Specials" : "Dragon Ball";
  }

  if (/tybw|thousand year blood war|cour 3/.test(text)) {
    return MOVIEISH_PATTERN.test(text)
      ? "Bleach: Thousand-Year Blood War: Movies & Specials"
      : "Bleach: Thousand-Year Blood War";
  }

  if ((canonical.includes("bleach") || /bleach|blich|ichigo/.test(text)) && /peli|infierno/.test(text)) {
    return "Bleach: Movies & Specials";
  }

  if (/pecados capitales/.test(text) && /pelicula|prisioneros del cielo|jinetes/.test(text)) {
    return "The Seven Deadly Sins: Movies & Specials";
  }

  if (/konoshuba/.test(text) && /pelicula|ova/.test(text)) {
    return "KonoSuba: Movies & Specials";
  }

  if (/(kirito|sao|sword art)/.test(`${text} ${canonical}`) && /pelicula/.test(text)) {
    return "Sword Art Online: Movies & Specials";
  }

  if (/(ippo|ipoconda)/.test(`${text} ${canonical}`) && /pelicula/.test(text)) {
    return "Hajime no Ippo: Movies & Specials";
  }

  if (/naruto/.test(`${text} ${canonical}`) && /peli/.test(text)) {
    return "Naruto: Movies & Specials";
  }

  if (/one piece|\bop\b/.test(`${text} ${canonical}`) && /pelicula/.test(text)) {
    return "One Piece: Movies & Specials";
  }

  if (/mushoku|pajin|roxygod/.test(`${text} ${canonical}`) && /ova|pelicula/.test(text)) {
    return "Mushoku Tensei: Movies & Specials";
  }

  if (MARVEL_TITLES.has(base)) return "Marvel";
  if (canonical === "marvel") return "Marvel";

  if (MOVIEISH_PATTERN.test(text) && !EPISODIC_PATTERN.test(text) && !/: movies & specials$/i.test(base)) {
    return `${base}: Movies & Specials`;
  }

  return base;
}

export function regroupData(rawData, aliasMap) {
  return rawData.map((category) => {
    const grouped = new Map();

    for (const subcategory of category.subcategories || []) {
      for (const item of subcategory.items || []) {
        const canonical = inferCanonicalFromItem(subcategory.name, item.title || item.html_title || "", aliasMap);
        if (!grouped.has(canonical)) grouped.set(canonical, []);
        grouped.get(canonical).push({ ...item });
      }
    }

    const subcategories = [...grouped.entries()].map(([name, items]) => {
      const deduped = [];
      const seen = new Set();

      for (const item of items) {
        item.href = canonicalizeVideoHref(item.href);
        const key = item.href || `${item.title}|${item.html_title}`;
        if (seen.has(key)) continue;
        seen.add(key);
        deduped.push(item);
      }

      deduped.sort((left, right) => {
        const episodeDiff = extractEpisodeNumber(left.title || left.html_title) - extractEpisodeNumber(right.title || right.html_title);
        if (episodeDiff !== 0) return episodeDiff;
        return String(left.title || left.html_title || "").localeCompare(String(right.title || right.html_title || ""));
      });

      return { name, items: deduped };
    });

    return { name: category.name, subcategories };
  });
}

export function buildShowGroups(data) {
  const groups = new Map();

  for (const category of data) {
    for (const subcategory of category.subcategories || []) {
      if (!(subcategory.items || []).length) continue;

      if (!groups.has(subcategory.name)) {
        groups.set(subcategory.name, {
          id: subcategory.name,
          name: subcategory.name,
          category: category.name,
          items: [],
          img: subcategory.items[0]?.img || "images/logo.png",
        });
      }

      groups.get(subcategory.name).items.push(...subcategory.items);
    }
  }

  const shows = [...groups.values()].map((show) => ({
    ...show,
    count: show.items.length,
  }));

  const byId = new Map(shows.map((show) => [show.id, { ...show, items: [...(show.items || [])] }]));
  const spiderItems = [];
  byId.forEach((show) => {
    (show.items || []).forEach((item) => {
      const combined = `${show.name} ${item?.html_title || ""} ${item?.title || ""}`;
      if (isSpiderManText(combined) && !normalizeText(combined).includes("so i'm a spider")) {
        spiderItems.push(item);
      }
    });
  });

  if (spiderItems.length) {
    byId.set("Spider-Man", {
      ...(byId.get("Spider-Man") || {}),
      id: "Spider-Man",
      name: "Spider-Man",
      category: "Peliculas y Series",
      kindOverride: "movie",
      img: byId.get("Spider-Man")?.img || byId.get("Marvel")?.img || spiderItems[0]?.img || "images/logo.png",
      items: dedupeItems(spiderItems),
      count: dedupeItems(spiderItems).length,
    });
    byId.delete("The Amazing Spider-Man");
    byId.delete("The Amazing Spider-Man 2");
  }

  return [...byId.values()].map((show) => ({
    ...show,
    count: (show.items || []).length,
  }));
}

export function classifyShowKind(show) {
  if (show?.kindOverride) return show.kindOverride;
  const name = String(show.name || "");
  if (name.endsWith(": Movies & Specials")) return "movie";
  if (name.endsWith(": Live Action")) return "series";
  if (name === "Marvel") return "movie";
  if (name === "Spider-Man" || name === "MonsterVerse" || name === "Saint Seiya: The Lost Canvas") return "movie";

  const category = String(show.category || "").toLowerCase();
  if (category.includes("anime")) return "anime";
  if (category.includes("direct")) return "live";
  if (category.includes("general")) return "other";

  const combined = [show.name]
    .concat((show.items || []).flatMap((item) => [item.title, item.html_title]))
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const episodic = /(cap(?:itulo)?|episod|episode|season|temporada|temp\b|\bs\d+\b|\bep\b|\bpart\s*\d+)/i;
  const moviePattern = /(pel[ií]cula|movie|film|special|ova|one shot|standalone)/i;

  if (moviePattern.test(combined) && !episodic.test(combined)) return "movie";
  if ((show.count || 0) >= 3 && !episodic.test(combined) && !category.includes("anime")) return "movie";
  if ((show.count || 0) >= 3) return "series";
  if (episodic.test(combined)) return "series";
  if ((show.count || 0) <= 1) return "movie";
  return "series";
}

export function extractEpisodeNumber(value) {
  const text = String(value || "");
  const patterns = [
    /\[cap\s*(\d+)/i,
    /\bcap(?:itulo)?\s*(\d+)/i,
    /\bepisod(?:io|e)?\s*(\d+)/i,
    /\bs(\d+)\s*\|?\s*cap\s*(\d+)/i,
    /\bs(\d+)\s*e(\d+)/i,
    /\b(\d{1,4})-(\d{1,4})\b/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return Number(match[2] || match[1]);
  }

  return Number.MAX_SAFE_INTEGER;
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function getMetaContent(html, attribute, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta[^>]+${attribute}=["']${escaped}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+${attribute}=["']${escaped}["']`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeHtmlEntities(match[1]);
  }

  return "";
}

function parseJsonLd(html) {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[1]);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (_error) {
    return [];
  }
}

export function extractOkMetadataFromHtml(html, url) {
  const jsonLdEntries = parseJsonLd(html);
  const videoObject = jsonLdEntries.find((entry) => entry && entry["@type"] === "VideoObject") || {};
  const interactions = new Map(
    (videoObject.interactionStatistic || []).map((entry) => [entry?.interactionType?.["@type"], Number(entry?.userInteractionCount || 0)])
  );

  const canonicalUrl = getMetaContent(html, "property", "og:url") || String(url || "").replace("https://m.ok.ru", "https://ok.ru");
  const thumbnail = getMetaContent(html, "property", "og:image") || videoObject.thumbnailUrl || videoObject?.thumbnail?.contentUrl || "";
  const title = decodeHtmlEntities((videoObject.name || getMetaContent(html, "property", "og:title") || "").replace(/^Видео\s+/i, "").replace(/\s+\|\s+OK\.RU$/i, "").trim());

  return {
    href: canonicalUrl,
    video_id: parseVideoId(canonicalUrl),
    title,
    thumbnail,
    upload_date: getMetaContent(html, "property", "ya:ovs:upload_date") || videoObject.uploadDate || "",
    modify_date: getMetaContent(html, "property", "ya:ovs:modify_date") || "",
    views_total: Number(getMetaContent(html, "property", "ya:ovs:views_total") || interactions.get("WatchAction") || 0),
    likes: Number(getMetaContent(html, "property", "ya:ovs:likes") || interactions.get("LikeAction") || 0),
    comments: Number(getMetaContent(html, "property", "ya:ovs:comments") || interactions.get("CommentAction") || 0),
    duration_seconds: Number(getMetaContent(html, "property", "video:duration") || 0),
    fetched_at: new Date().toISOString(),
  };
}

export async function fetchOkMetadata(url) {
  const response = await fetch(String(url || ""), {
    headers: {
      "user-agent": "Mozilla/5.0 Codex Content Updater",
      "accept-language": "en-US,en;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const html = await response.text();
  return extractOkMetadataFromHtml(html, url);
}

export async function updateMetrics(items, existingMetrics, options = {}) {
  const ttlHours = Number(options.ttlHours ?? 24);
  const force = Boolean(options.force);
  const concurrency = Number(options.concurrency ?? 4);
  const itemList = [...items];
  const nextMetrics = { ...existingMetrics };
  let index = 0;

  function isFresh(metric) {
    if (!metric?.fetched_at) return false;
    const ageMs = Date.now() - new Date(metric.fetched_at).getTime();
    return ageMs < ttlHours * 60 * 60 * 1000;
  }

  async function worker() {
    while (index < itemList.length) {
      const currentIndex = index++;
      const item = itemList[currentIndex];
      const key = String(item.href || "").trim();
      item.href = canonicalizeVideoHref(item.href);
      if (!key) continue;

      if (!force && isFresh(nextMetrics[item.href])) continue;

      try {
        nextMetrics[item.href] = await fetchOkMetadata(item.href);
      } catch (error) {
        nextMetrics[item.href] = {
          ...(nextMetrics[item.href] || {}),
          href: item.href,
          video_id: parseVideoId(item.href),
          fetched_at: new Date().toISOString(),
          error: error.message,
        };
      }
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, () => worker()));
  return nextMetrics;
}

function metricTimestamp(metric) {
  if (metric?.upload_date) return new Date(metric.upload_date).getTime();
  if (metric?.modify_date) return new Date(metric.modify_date).getTime();
  if (metric?.video_id) return Number(metric.video_id);
  return 0;
}

export function buildRankings(shows, metrics, snapshots = {}) {
  const now = Date.now();
  const nowDate = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  const stats = shows.map((show) => {
    const entries = (show.items || []).map((item) => metrics[item.href] || { href: item.href, video_id: parseVideoId(item.href) });
    const histories = (show.items || []).map((item) => snapshots[item.href] || []);
    const latestTimestamp = Math.max(0, ...entries.map(metricTimestamp));
    const totalViews = entries.reduce((sum, entry) => sum + Number(entry.views_total || 0), 0);
    const viewsLast180d = entries
      .filter((entry) => metricTimestamp(entry) >= now - 180 * dayMs)
      .reduce((sum, entry) => sum + Number(entry.views_total || 0), 0);
    const viewsLast7d = entries
      .filter((entry) => metricTimestamp(entry) >= now - 7 * dayMs)
      .reduce((sum, entry) => sum + Number(entry.views_total || 0), 0);
    const monthlyGrowth = histories.reduce((sum, history) => sum + getGrowthFromSnapshots(history, nowDate, 30), 0);
    const weeklyGrowth = histories.reduce((sum, history) => sum + getGrowthFromSnapshots(history, nowDate, 7), 0);

    return {
      id: show.id,
      name: show.name,
      kind: classifyShowKind(show),
      latestTimestamp,
      totalViews,
      viewsLast180d,
      viewsLast7d,
      monthlyGrowth,
      weeklyGrowth,
    };
  });

  const byRecent = [...stats].sort((left, right) => right.latestTimestamp - left.latestTimestamp);
  const byPopular = [...stats].sort((left, right) => {
    const leftScore = left.monthlyGrowth || left.viewsLast180d || left.totalViews;
    const rightScore = right.monthlyGrowth || right.viewsLast180d || right.totalViews;
    if (rightScore !== leftScore) return rightScore - leftScore;
    return right.latestTimestamp - left.latestTimestamp;
  });
  const byMovieNight = stats
    .filter((entry) => entry.kind === "movie")
    .sort((left, right) => {
      const leftScore = left.monthlyGrowth || left.viewsLast180d || left.totalViews;
      const rightScore = right.monthlyGrowth || right.viewsLast180d || right.totalViews;
      if (rightScore !== leftScore) return rightScore - leftScore;
      return right.latestTimestamp - left.latestTimestamp;
    });
  const byAnimeWeek = stats
    .filter((entry) => entry.kind === "anime" || entry.name === "One Piece" || entry.name === "Bleach" || entry.name === "Naruto")
    .sort((left, right) => {
      const leftScore = left.weeklyGrowth || left.viewsLast7d || left.totalViews;
      const rightScore = right.weeklyGrowth || right.viewsLast7d || right.totalViews;
      if (rightScore !== leftScore) return rightScore - leftScore;
      return right.latestTimestamp - left.latestTimestamp;
    });

  return {
    generated_at: new Date().toISOString(),
    rankings: {
      recent_added: byRecent.map((entry) => entry.id),
      populares_sofi_tv: byPopular.map((entry) => entry.id),
      noche_de_peliculas: byMovieNight.map((entry) => entry.id),
      top_anime_semana: byAnimeWeek.map((entry) => entry.id),
    },
    show_stats: Object.fromEntries(stats.map((entry) => [entry.id, entry])),
    ranking_notes: {
      populares_sofi_tv: "month_over_month_view_growth_with_fallback_to_current_views",
      noche_de_peliculas: "month_over_month_movie_view_growth_with_fallback_to_current_views",
      top_anime_semana: "week_over_week_view_growth_with_fallback_to_current_views",
    },
  };
}

function getReferenceTitle(name) {
  const base = String(name || "")
    .replace(/: Movies & Specials$/, "")
    .replace(/: Live Action$/, "");
  return WIKI_TITLE_OVERRIDES[name] || WIKI_TITLE_OVERRIDES[base] || base;
}

async function fetchReferenceSummary(title) {
  const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, {
    headers: {
      "user-agent": "Mozilla/5.0 Codex Content Updater",
    },
  });
  if (!response.ok) return null;
  return response.json();
}

async function downloadImage(url, destinationBase) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 Codex Content Updater",
    },
  });
  if (!response.ok) return null;

  const type = response.headers.get("content-type") || "";
  const extension = type.includes("png") ? ".png" : type.includes("webp") ? ".webp" : ".jpg";
  const targetPath = `${destinationBase}${extension}`;
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, buffer);
  return targetPath;
}

export async function syncReferenceImages(showNames) {
  fs.mkdirSync(REFERENCE_IMAGE_DIR, { recursive: true });
  const currentMap = loadReferenceImages();
  const nextMap = { ...currentMap };

  for (const name of showNames) {
    if (nextMap[name]) continue;
    const wikiTitle = getReferenceTitle(name);
    if (!wikiTitle) continue;

    try {
      const summary = await fetchReferenceSummary(wikiTitle);
      const imageUrl = summary?.originalimage?.source || summary?.thumbnail?.source;
      if (!imageUrl) continue;

      const destinationBase = path.join(REFERENCE_IMAGE_DIR, slugify(name));
      const savedPath = await downloadImage(imageUrl, destinationBase);
      if (!savedPath) continue;
      nextMap[name] = `images/reference/${path.basename(savedPath)}`;
    } catch (_error) {
      // Ignore unknown or private/internal titles.
    }
  }

  saveReferenceImages(nextMap);
  return nextMap;
}

export function loadReferenceImages() {
  if (!fs.existsSync(REFERENCE_IMAGES_JS_PATH)) return {};
  const context = evaluateScript(REFERENCE_IMAGES_JS_PATH, "this.__referenceImages = window.REFERENCE_IMAGES;");
  return context.__referenceImages || {};
}

export function saveReferenceImages(referenceImages) {
  fs.writeFileSync(REFERENCE_IMAGES_JS_PATH, `window.REFERENCE_IMAGES = ${JSON.stringify(referenceImages, null, 2)};\n`);
}

export function saveContentState(contentState) {
  writeJson(CONTENT_STATE_JSON_PATH, contentState);
  fs.writeFileSync(CONTENT_STATE_JS_PATH, `window.CONTENT_STATE = ${JSON.stringify(contentState, null, 2)};\n`);
}

export function createItemFromMetadata(url, metadata) {
  const canonicalUrl = canonicalizeVideoHref(metadata?.href || String(url || ""));
  const title = metadata?.title || canonicalUrl;
  return {
    title,
    img: metadata?.thumbnail || "",
    href: canonicalUrl,
    html_title: title,
  };
}
