// — Configuration —
const SHEET_ID = "1mUimZUbpPU3JXU_vw_o6XEe9DKdQCiJMYx0ZL2bQzA4";
const GID = "837318860";
const SEARCH_TERM = args.plainTexts[0] || "Pikachu"; // Default to Pikachu if no input provided
const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

// — Utility Functions —

/**
 * Fetches and parses the CSV from Google Spreadsheet.
 * @returns {Promise<Array>} - Returns an array of rows from the CSV.
 */
async function fetchCSV() {
  let req = new Request(url);
  let csv = await req.loadString();
  return csv.trim().split("\n").map(row => row.split(","));
}

/**
 * Filters rows based on the search term.
 * @param {Array} rows - The rows from the CSV.
 * @param {string} searchTerm - The term to search for.
 * @returns {Array} - Filtered rows matching the search term.
 */
function filterRows(rows, searchTerm) {
  return rows.filter(row => row[2] && row[2].toLowerCase().includes(searchTerm.toLowerCase()));
}

/**
 * Formats the filtered rows into a structured JSON object.
 * @param {Array} matches - The filtered rows.
 * @param {string} searchTerm - The search term used.
 * @returns {Object} - A JSON object with the search term and results.
 */
function formatOutput(matches, searchTerm) {
  return {
    searchTerm,
    results: matches.map(row => ({
      quantity: row[0],
      name: row[2],
      set: row[3],
      number: row[4]
    }))
  };
}

// — Main Logic —

async function main() {
  try {
    // Fetch and parse the CSV
    let rows = await fetchCSV();

    // Skip the header row
    rows = rows.slice(1);

    // Filter rows based on the search term
    let matches = filterRows(rows, SEARCH_TERM);

    // Format the output
    if (matches.length === 0) {
      return `No results found for "${SEARCH_TERM}".`;
    }

    let output = `Search Results for "${SEARCH_TERM}":\n\n`;
    matches.forEach((row, index) => {
      output += `${index + 1}. ${row[2]} (Set: ${row[3]}, Number: ${row[4]}, Quantity: ${row[0]})\n`;
    });

    // Log and return the output
    console.log(output);
    return output;
  } catch (error) {
    console.error("Error:", error.message);
    return `Error: ${error.message}`;
  }
}

// — Run Logic —

if (typeof __runFromLoader__ === "undefined") {
  await main().then(output => {
    Script.setShortcutOutput(output);
    Script.complete();
  });
}