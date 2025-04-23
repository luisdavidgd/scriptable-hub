const SHEET_ID = "1mUimZUbpPU3JXU_vw_o6XEe9DKdQCiJMYx0ZL2bQzA4";
const GID = "837318860";

const SEARCH_TERM = args.plainTexts[0] || "Pikachu"; // Default to Pikachu if no input provided

const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

async function main() {
  let req = new Request(url);
  let csv = await req.loadString();

  let rows = csv.trim().split("\n").map(r => r.split(","));

  // Skip the header
  rows = rows.slice(1);

  let matches = rows.filter(row => row[2] && row[2].toLowerCase().includes(SEARCH_TERM.toLowerCase()));

  let output = {
    searchTerm: SEARCH_TERM,
    results: matches.map(row => ({
      quantity: row[0],
      name: row[2],
      set: row[3],
      number: row[4]
    }))
  };

  return output;
}

// Only run main() if not already running via external loader
if (typeof __runFromLoader__ === "undefined") {
  main().then(output => {
    Script.setShortcutOutput(output);
    Script.complete();
  });
}