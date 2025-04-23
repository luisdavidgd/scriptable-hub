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

const deckText = args.plainTexts?.[0] || defaultDeck;

// Parse deck lines
function parseDeck(text) {
    const lines = text.split("\n");
    const deck = [];
    const invalid = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!/^\d/.test(trimmed)) continue;

        const parts = trimmed.split(" ");
        const qty = parseInt(parts[0]);
        const set = parts[parts.length - 2];
        const number = parts[parts.length - 1];
        const name = parts.slice(1, -2).join(" ");

        if (!qty || !set || !number || !name) {
            invalid.push(trimmed);
            continue;
        }

        deck.push({ needed: qty, name, set, number });
    }

    return { deck, invalid };
}

// Read collection CSV from Google Sheets
async function getCollection() {
    const req = new Request(url);
    const csv = await req.loadString();
    const rows = csv.trim().split("\n").slice(1).map(r => r.split(","));

    const collection = {};
    for (const row of rows) {
        const qty = parseInt(row[0]) || 0;
        const name = row[2];
        const set = row[3];
        const number = row[4];
        const key = `${set}-${number}`;
        if (!set || !number || !name) continue;
        collection[key] = { qty, name, set, number };
    }

    return collection;
}

// Compare deck vs collection with suggestions
function compare(deck, collection) {
    const missing = [];

    for (const card of deck) {
        const key = `${card.set}-${card.number}`;
        const owned = collection[key]?.qty || 0;

        if (owned >= card.needed) continue;

        const suggestions = Object.entries(collection)
            .filter(([k, c]) => c.name === card.name && k !== key && c.qty > 0)
            .map(([k, c]) => ({
                key: k,
                set: c.set,
                number: c.number,
                quantity: c.qty
            }));

        missing.push({
            key,
            name: card.name,
            needed: card.needed,
            owned,
            missing: card.needed - owned,
            suggested: suggestions
        });
    }

    return missing;
}

// Main logic
async function main() {
    const { deck, invalid } = parseDeck(deckText);
    const collection = await getCollection();
    const missing = compare(deck, collection);

    const result = {
        missingCards: missing,
        ignoredLines: invalid
    };

    console.log(JSON.stringify(result, null, 2));
    Script.setShortcutOutput(result);
    Script.complete();
}

// Only run main() if not already running via external loader
if (typeof __runFromLoader__ === "undefined") {
    main();
}
