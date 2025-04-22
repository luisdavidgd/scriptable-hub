// Replace with your actual Sheet ID and GID
const SHEET_ID = "1mUimZUbpPU3JXU_vw_o6XEe9DKdQCiJMYx0ZL2bQzA4";
const GID = "837318860";
const SEARCH_TERM = "Pikachu"; // Change this to the Pokémon name you want to search for

const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID}`;

async function main() {
  let req = new Request(url);
  let csv = await req.loadString();

  let rows = csv.trim().split("\n").map(r => r.split(","));

  // Skip the header
  rows = rows.slice(1);

  let matches = rows.filter(row => row[2] && row[2].toLowerCase().includes(SEARCH_TERM.toLowerCase()));

  if (matches.length === 0) {
    console.log(`No matches found for "${SEARCH_TERM}".`);
  } else {
    matches.forEach(row => {
      console.log(`Qty: ${row[0]}, Name: ${row[2]}, Set: ${row[3]}, Number: ${row[4]}`);
    });
  }
}

// Only run main() if not already running via external loader
if (typeof __runFromLoader__ === "undefined") {
  console.log("from pokevault.js")
  main();
}