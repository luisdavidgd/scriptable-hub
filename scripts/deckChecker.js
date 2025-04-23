// Pokémon Deck Checker — Scriptable single-file with default deck input

// — CONFIG: point to your Google Sheet CSV
const SHEET_ID = "1mUimZUbpPU3JXU_vw_o6XEe9DKdQCiJMYx0ZL2bQzA4";
const GID = "837318860";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

// — Default deck if no input provided via Share Sheet or Shortcut
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
const deckText = args.plainTexts?.[0] || defaultDeck;

// — 2️⃣ Parse deck text into structured array, capturing invalid lines
function parseDeck(text) {
    const lines = text.split("\n");
    const deck = [];
    const invalid = [];

    for (let raw of lines) {
        let line = raw.trim();
        if (!/^\d/.test(line)) continue;  // skip headers or non-card lines

        let parts = line.split(" ");
        let qty = parseInt(parts.shift());
        let number = parts.pop();
        let set = parts.pop();
        let name = parts.join(" ");

        if (!qty || !set || !number || !name) {
            invalid.push(raw);
        } else {
            deck.push({ key: `${set}-${number}`, name, needed: qty, set, number });
        }
    }

    return { deck, invalid };
}

// — 3️⃣ Fetch your collection CSV and build a lookup by “SET-NUMBER”
async function readCollection() {
    let req = new Request(CSV_URL);
    let csv = await req.loadString();
    let rows = csv.trim().split("\n").slice(1).map(r => r.split(","));
    let col = {};
    for (let r of rows) {
        let qty = parseInt(r[0]) || 0;
        let name = r[2];
        let set = r[3];
        let number = r[4];
        if (!set || !number || !name) continue;
        col[`${set}-${number}`] = { qty, name, set, number };
    }
    return col;
}

// — 4️⃣ Compare deck vs collection, generate missing + suggestions
function compare(deck, collection) {
    let missing = [];
    for (let card of deck) {
        let own = (collection[card.key]?.qty) || 0;
        if (own >= card.needed) continue;
        // find other prints of same Pokémon
        let suggestions = Object.entries(collection)
            .filter(([k, c]) => c.name === card.name && k !== card.key && c.qty > 0)
            .map(([k, c]) => ({ key: k, set: c.set, number: c.number, qty: c.qty }));

        missing.push({
            key: card.key,
            name: card.name,
            needed: card.needed,
            owned: own,
            missing: card.needed - own,
            suggestions
        });
    }
    return missing;
}

// — 5️⃣ Format & log results in console
function formatAndLog({ deck, invalid, missing }) {
    console.log(`🃏 Deck contains ${deck.length} card entries; ${invalid.length} invalid lines ignored.`);
    if (invalid.length) console.log("Ignored lines:", invalid);

    let totalNeeded = deck.reduce((s, c) => s + c.needed, 0);
    let totalOwned = deck.reduce((s, c) => {
        let own = collection[c.key]?.qty || 0;
        return s + Math.min(own, c.needed);
    }, 0);
    console.log(`Progress: ${totalOwned}/${totalNeeded} cards owned.`);

    if (!missing.length) {
        console.log("✅ Deck complete! You have every card.");
        return;
    }

    console.log("\n❌ Missing Cards:");
    missing.forEach(c => {
        console.log(`– ${c.missing}× ${c.name} (${c.key})`);
        if (c.suggestions.length) {
            console.log("   Suggestions:");
            c.suggestions.forEach(s => console.log(`     • ${s.qty}× ${c.name} (${s.key})`));
        }
    });
}

// — ▶️ MAIN
let collection;
try {
    const { deck, invalid } = parseDeck(deckText);
    collection = await readCollection();
    const missing = compare(deck, collection);
    formatAndLog({ deck, invalid, missing });
    Script.setShortcutOutput({ deck, invalid, missing });
} catch (e) {
    console.error(e.message);
    Script.setShortcutOutput({ error: e.message });
} finally {
    Script.complete();
}
