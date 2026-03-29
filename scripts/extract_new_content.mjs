import {
  canonicalizeVideoHref,
  createItemFromMetadata,
  loadData,
  parseVideoId,
  regroupData,
  loadAliasMap,
  saveData,
  fetchOkMetadata,
} from "./lib/catalog-utils.mjs";

function parseArgs(argv) {
  const options = { urls: [] };
  for (const arg of argv) {
    if (arg.startsWith("--")) {
      const [key, value = "true"] = arg.replace(/^--/, "").split("=");
      options[key] = value;
    } else {
      options.urls.push(arg);
    }
  }
  return options;
}

const options = parseArgs(process.argv.slice(2));
const categoryName = options.category || "Peliculas y Series";
const subcategoryName = options.subcategory || "Nuevos";
const applyRegroup = options.regroup !== "false";

let urls = [...options.urls];
if (options["urls-file"]) {
  const fs = await import("fs");
  const raw = fs.readFileSync(options["urls-file"], "utf8");
  urls.push(...raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean));
}

urls = [...new Set(urls.map((url) => canonicalizeVideoHref(url)).filter(Boolean))];

if (!urls.length) {
  console.error("Provide one or more OK.ru video URLs with --urls-file=... or as positional arguments.");
  process.exit(1);
}

const data = loadData();
let category = data.find((entry) => entry.name === categoryName);
if (!category) {
  category = { name: categoryName, subcategories: [] };
  data.push(category);
}

let subcategory = category.subcategories.find((entry) => entry.name === subcategoryName);
if (!subcategory) {
  subcategory = { name: subcategoryName, items: [] };
  category.subcategories.push(subcategory);
}

const existingHrefs = new Set((subcategory.items || []).map((item) => canonicalizeVideoHref(item.href)));
const inserted = [];

for (const url of urls) {
  const metadata = await fetchOkMetadata(url);
  const item = createItemFromMetadata(url, metadata);
  if (existingHrefs.has(item.href)) continue;
  existingHrefs.add(item.href);
  subcategory.items.push(item);
  inserted.push({
    href: item.href,
    video_id: parseVideoId(item.href),
    title: item.title,
  });
}

const nextData = applyRegroup ? regroupData(data, loadAliasMap()) : data;
saveData(nextData);

console.log(JSON.stringify({
  category: categoryName,
  subcategory: subcategoryName,
  insertedCount: inserted.length,
  inserted,
}, null, 2));
