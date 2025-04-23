// Pokémon Deck Checker — Scriptable single-file with default deck input

// — CONFIG: point to your Google Sheet CSV
const SHEET_ID = "1mUimZUbpPU3JXU_vw_o6XEe9DKdQCiJMYx0ZL2bQzA4";
const GID = "837318860";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

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

// — 1️⃣ Get deck text from args or fallback to default
// Place this at the very top, before parseDeck, so deckText always has a value
const deckText = args.plainTexts?.[0] || defaultDeck;

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
    const req = new Request(CSV_URL);
    const csv = await req.loadString();
    const rows = csv.trim().split("\n");
    const header = rows.shift().split(",").map(h => h.trim());
    const idxNormal = header.indexOf("Normal");
    const idxName = header.indexOf("Name");
    const idxSet = header.indexOf("Set");
    const idxNumber = header.indexOf("Number");
    const col = {};
    for (let line of rows) {
        const cells = line.split(",").map(c => c.trim());
        const qty = parseInt(cells[idxNormal], 10) || 0;
        const name = cells[idxName] || "";
        const set = cells[idxSet] || "";
        const number = cells[idxNumber] || "";
        if (!set || !number || !name) continue;
        const key = `${set}-${number}`;
        col[key] = { qty, name: name.trim(), set: set.trim(), number: number.trim() };
    }
    return col;
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
        return lines.join("\n");
    }

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
    return lines.join("\n");
}

// — ▶️ MAIN
let report;
try {
    // Parse deck (using default if no args)
    const { deck, invalid } = parseDeck(deckText);
    // Load collection
    const collection = await readCollection();
    // Compute missing + suggestions
    const missing = compare(deck, collection);
    // Generate report text
    report = buildReport({ deck, invalid, missing }, collection);
    console.log(report);
    Script.setShortcutOutput(report);
} catch (e) {
    console.error(e.message);
    Script.setShortcutOutput(e.message);
} finally {
    Script.complete();
}