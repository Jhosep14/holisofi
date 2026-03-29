import {
  CONTENT_METRICS_JSON_PATH,
  CONTENT_SNAPSHOTS_JSON_PATH,
  appendSnapshots,
  buildRankings,
  buildShowGroups,
  loadAliasMap,
  loadData,
  readJsonIfExists,
  regroupData,
  saveContentState,
  saveData,
  syncReferenceImages,
  updateMetrics,
  writeJson,
} from "./lib/catalog-utils.mjs";

const args = new Map();
for (const arg of process.argv.slice(2)) {
  const [key, value = "true"] = arg.replace(/^--/, "").split("=");
  args.set(key, value);
}

const ttlHours = Number(args.get("ttl-hours") || 24);
const concurrency = Number(args.get("concurrency") || 4);
const force = args.get("force") === "true";
const skipImages = args.get("skip-images") === "true";

const aliasMap = loadAliasMap();
const rawData = loadData();
const regroupedData = regroupData(rawData, aliasMap);
saveData(regroupedData);

const shows = buildShowGroups(regroupedData);
const allItems = shows.flatMap((show) => show.items || []);
const metricsCache = readJsonIfExists(CONTENT_METRICS_JSON_PATH, {});
const updatedMetrics = await updateMetrics(allItems, metricsCache, { ttlHours, concurrency, force });
writeJson(CONTENT_METRICS_JSON_PATH, updatedMetrics);
const snapshotsCache = readJsonIfExists(CONTENT_SNAPSHOTS_JSON_PATH, {});
const updatedSnapshots = appendSnapshots(updatedMetrics, snapshotsCache);
writeJson(CONTENT_SNAPSHOTS_JSON_PATH, updatedSnapshots);

if (!skipImages) {
  await syncReferenceImages(shows.map((show) => show.name));
}

const contentState = buildRankings(shows, updatedMetrics, updatedSnapshots);
saveContentState(contentState);

console.log(JSON.stringify({
  shows: shows.length,
  items: allItems.length,
  rankingsGeneratedAt: contentState.generated_at,
  recentAddedTop5: contentState.rankings.recent_added.slice(0, 5),
  popularesTop5: contentState.rankings.populares_sofi_tv.slice(0, 5),
}, null, 2));
