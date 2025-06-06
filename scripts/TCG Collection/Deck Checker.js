// === CONFIG ===
const fm = FileManager.iCloud();
const configFolderPath = fm.joinPath(fm.documentsDirectory(), "Config");
const configFilePath = fm.joinPath(configFolderPath, "deckChecker.json");
const dataDir = fm.joinPath(fm.documentsDirectory(), "Data");
const csvFilePath = fm.joinPath(dataDir, "ptcgp.csv");

// Ensure the Config and Data directories exist
if (!fm.fileExists(configFolderPath)) {
    fm.createDirectory(configFolderPath);
}
if (!fm.fileExists(dataDir)) {
    fm.createDirectory(dataDir);
}

// Load or create configuration
let config = {};
if (fm.fileExists(configFilePath)) {
    await fm.downloadFileFromiCloud(configFilePath); // Ensure the file is local
    try {
        config = JSON.parse(fm.readString(configFilePath));
    } catch (e) {
        console.error("Failed to parse configuration file:", e);
        throw new Error("Invalid configuration file. Please check deckChecker.json.");
    }
} else {
    console.log("Configuration file not found. Creating a new one with default values.");
    config = {
        GOOGLE_DEPLOYMENT_ID: "YOUR_GOOGLE_DEPLOYMENT_ID_HERE",
    };
    fm.writeString(configFilePath, JSON.stringify(config, null, 2)); // Save default config
    console.log("Default configuration file created at:", configFilePath);
}

// Extract the Google Script URL from the configuration
const GOOGLE_SCRIPT_URL = `https://script.google.com/macros/s/${config.GOOGLE_DEPLOYMENT_ID}/exec`;
if (!GOOGLE_SCRIPT_URL) {
    throw new Error("GOOGLE_SCRIPT_URL is missing in the configuration file.");
}

// — Default deck if no input provided
const defaultDeck = `
Pokemon
2 Weedle A2b 1
2 Kakuna A2b 2
1 Beedrill ex A2b 3
1 Pinsir A2b 4
2 Sprigatito A2b 5
2 Floragato A2b 6
1 Meowscarada A2b 7
2 Buneary A2b 66
1 Lopunny A2b 67

Supporter
1 Red A2b 71
2 Professor’s Research PROMO 7

Item
1 X Speed PROMO 2
2 Poké Ball PROMO 5
`.trim();

// === Utility Functions ===

/**
 * Fetches collection data from Google Script and converts it to CSV format.
 * @returns {Promise<string>} - The CSV string.
 */
async function fetchCollectionFromGoogle() {
    const req = new Request(GOOGLE_SCRIPT_URL);
    req.method = "POST";
    req.headers = { "Content-Type": "application/json" };
    req.body = JSON.stringify({ action: "getCollection" });

    try {
        const response = await req.loadJSON();
        const rows = response.data.map(item => [
            item.qty,
            item.name,
            item.set,
            item.number,
        ]);
        const csv = rows.map(row => row.join(",")).join("\n");
        return csv;
    } catch (e) {
        console.error("Failed to fetch collection data:", e);
        throw new Error("Unable to fetch collection data. Please check your Google Script.");
    }
}

/**
 * Saves the CSV to iCloud in the Data directory.
 * @param {string} csv - The raw CSV string.
 */
function saveCSVToFile(csv) {
    fm.writeString(csvFilePath, csv);
}

/**
 * Checks if the CSV file is older than 48 hours.
 * @returns {boolean} - True if the file is older than 48 hours, false otherwise.
 */
function isCSVOutdated() {
    if (!fm.fileExists(csvFilePath)) {
        return true; // File doesn't exist, so it's outdated
    }
    const fileDate = fm.modificationDate(csvFilePath);
    const now = new Date();
    const diffInHours = (now - fileDate) / (1000 * 60 * 60);
    return diffInHours > 48;
}

/**
 * Fetches the CSV, either from iCloud or Google Script if outdated.
 * @returns {Promise<string>} - Returns the raw CSV string.
 */
async function getCSV() {
    try {
        if (isCSVOutdated()) {
            console.log("CSV is outdated or missing. Downloading from Google Script...");
            const csv = await fetchCollectionFromGoogle();
            saveCSVToFile(csv);
            console.log("CSV file downloaded and saved successfully.");
            return csv;
        } else {
            console.log("Using cached CSV from iCloud.");
            return fm.readString(csvFilePath);
        }
    } catch (error) {
        console.error("Error in getCSV:", error.message);
        throw new Error("Failed to fetch the CSV file.");
    }
}

// — 2️⃣ Parse deck text into structured array
function parseDeck(text) {
    const lines = text.split("\n");
    const deck = [];
    const invalid = [];
    for (let raw of lines) {
        const line = raw.trim();
        if (!/^\d/.test(line)) continue;
        let parts = line.split(/\s+/);
        const qty = parseInt(parts.shift(), 10);
        const number = parts.pop();
        const set = parts.pop();
        const name = parts.join(" ").trim();
        if (!qty || !set || !number || !name) {
            invalid.push(raw);
        } else {
            deck.push({ key: `${set}-${number}`, name, needed: qty, set, number });
        }
    }
    return { deck, invalid };
}

// — 3️⃣ Fetch collection CSV and build lookup by SET-NUMBER
async function readCollection() {
    const csv = await getCSV();
    const rows = csv.trim().split("\n").map(row => row.split(","));
    const collection = {};
    rows.forEach(row => {
        const [qty, name, set, number] = row;
        const key = `${set}-${number}`;
        collection[key] = {
            qty: parseInt(qty, 10) || 0,
            name,
            set,
            number,
        };
    });
    return collection;
}

// — 4️⃣ Compare deck vs collection, generate missing + suggestions if owned < needed
function compare(deck, collection) {
    const missing = [];
    for (let card of deck) {
        const own = collection[card.key]?.qty || 0;
        if (own >= card.needed) continue;
        const suggestions = Object.values(collection)
            .filter(c =>
                c.name.toLowerCase() === card.name.toLowerCase() &&
                c.set !== card.set &&
                c.qty > 0
            )
            .map(c => ({ key: `${c.set}-${c.number}`, set: c.set, number: c.number, qty: c.qty }));
        missing.push({ ...card, owned: own, missing: card.needed - own, suggestions });
    }
    return missing;
}

// — 5️⃣ Build a human‑readable report
function buildReport({ deck, invalid, missing }, collection) {
    const lines = [];
    lines.push(`Deck entries: ${deck.length}`);
    if (invalid.length) lines.push(`Ignored (${invalid.length}): ${invalid.join(', ')}`);
    const totalNeeded = deck.reduce((s, c) => s + c.needed, 0);
    const totalOwned = deck.reduce(
        (s, c) => s + Math.min(collection[c.key]?.qty || 0, c.needed),
        0
    );
    lines.push(`Progress: ${totalOwned}/${totalNeeded} owned.`);

    // Show full deck list with owned vs needed
    lines.push(`\n📋 Deck List:`);
    deck.forEach(c => {
        const own = collection[c.key]?.qty || 0;
        lines.push(`- ${c.needed}× ${c.name} (${c.key}) — Owned: ${own}`);
    });

    if (!missing.length) {
        lines.push(`\n✅ Deck complete!`);
    } else {
        lines.push(`\n❌ Missing Cards:`);
        for (let c of missing) {
            lines.push(`- ${c.missing}× ${c.name} (${c.key})`);
            if (c.suggestions.length) {
                lines.push(`  Suggestions:`);
                c.suggestions.forEach(s =>
                    lines.push(`    • ${s.qty}× ${c.name} (${s.key})`)
                );
            }
        }
    }

    // Add the file modification date at the end
    const fileDate = fm.modificationDate(csvFilePath);
    const formattedDate = fileDate.toLocaleString(); // Format the date as a readable string
    lines.push(`\n\nBased on data last updated on: ${formattedDate}`);

    return lines.join("\n");
}

// — ▶️ MAIN LOGIC (to be called if standalone)
async function main(input = []) {
    // — 1️⃣ Get deck text from args or fallback to default
    const deckText = input[0] || defaultDeck;
    const { deck, invalid } = parseDeck(deckText);
    const collection = await readCollection();
    const missing = compare(deck, collection);
    const report = buildReport({ deck, invalid, missing }, collection);
    console.log(report);
    return report;
}

// — 🧪 Run only if not imported
if (typeof __runFromLoader__ === "undefined") {
    try {
        const result = await main(args.plainTexts);
        Script.setShortcutOutput(result);
    } catch (e) {
        console.error(e.message);
        Script.setShortcutOutput(e.message);
    } finally {
        Script.complete();
    }
}