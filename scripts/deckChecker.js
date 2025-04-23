const SHEET_ID = "1mUimZUbpPU3JXU_vw_o6XEe9DKdQCiJMYx0ZL2bQzA4";
const GID = "837318860";

const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

// Default deck if no input provided
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

// Get deck input from args (via Shortcut or Share Sheet)
const deckText = args.plainTexts?.[0] || defaultDeck;
if (!deckText) {
    throw new Error("Deck input not found. Paste text or share a note.");
}

// Parse deck text into card objects
function parseDeckFromText(text) {
    const lines = text.split("\n");
    const deck = [];
    const invalidLines = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!/^\d/.test(trimmed)) continue; // Skip headers or empty lines

        const parts = trimmed.split(" ");
        const quantity = parseInt(parts[0]);
        const set = parts[parts.length - 2];
        const number = parts[parts.length - 1];
        const name = parts.slice(1, -2).join(" ");

        if (!quantity || !set || !number || !name) {
            invalidLines.push(trimmed);
            continue;
        }

        deck.push({ needed: quantity, name, set, number });
    }

    return { deck, invalidLines };
}

// Read the CSV collection from Google Sheets
async function readCollection() {
    const req = new Request(url);
    const csv = await req.loadString();
    const rows = csv.trim().split("\n").slice(1).map(r => r.split(","));

    const collection = {};
    for (const row of rows) {
        const quantity = parseInt(row[0]) || 0;
        const set = row[3];
        const number = row[4];
        if (!set || !number) continue;
        const key = `${set}-${number}`;
        collection[key] = quantity;
    }
    return collection;
}

// Compare the deck list with your collection
function compareDeckWithCollection(deckList, collection) {
    const missing = [];

    for (const card of deckList) {
        const key = `${card.set}-${card.number}`;
        const owned = collection[key] || 0;
        if (owned < card.needed) {
            missing.push({
                key,
                name: card.name,
                needed: card.needed,
                owned,
                missing: card.needed - owned
            });
        }
    }

    return missing;
}

// Main execution function
async function main() {
    try {
        const { deck, invalidLines } = parseDeckFromText(deckText);
        const collection = await readCollection();
        const missingCards = compareDeckWithCollection(deck, collection);

        const result = {
            missingCards,
            ignoredLines: invalidLines
        };

        console.log(JSON.stringify(result, null, 2));
        Script.setShortcutOutput(result);
    } catch (err) {
        console.error("Error:", err);
        Script.setShortcutOutput({ error: err.message });
    } finally {
        Script.complete();
    }
}

// Only run main() if not already running via external loader
if (typeof __runFromLoader__ === "undefined") {
    main();
}
