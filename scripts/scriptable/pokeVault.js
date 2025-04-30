// — Configuration —
const SHEET_ID = "1mUimZUbpPU3JXU_vw_o6XEe9DKdQCiJMYx0ZL2bQzA4";
const GID = "837318860";
const SEARCH_TERM = args.plainTexts[0] || "Pikachu"; // Default to Pikachu if no input provided
const fm = FileManager.iCloud();
const dataDir = fm.joinPath(fm.documentsDirectory(), "Data");
const filePath = fm.joinPath(dataDir, "ptcgp.csv");
const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

// Ensure the Data directory exists
if (!fm.fileExists(dataDir)) {
  fm.createDirectory(dataDir);
}

// — Utility Functions —

/**
 * Fetches and parses the CSV from Google Spreadsheet.
 * @returns {Promise<string>} - Returns the raw CSV string.
 */
async function fetchCSVFromGoogle() {
  let req = new Request(url);
  return await req.loadString();
}

/**
 * Saves the CSV to iCloud in the Data directory.
 * @param {string} csv - The raw CSV string.
 */
function saveCSVToFile(csv) {
  fm.writeString(filePath, csv);
}

/**
 * Reads the CSV from iCloud in the Data directory.
 * If the file doesn't exist, attempts to download it from Google Spreadsheet.
 * @returns {Promise<string>} - The raw CSV string.
 */
async function readCSVFromFile() {
  try {
    if (!fm.fileExists(filePath)) {
      console.log("CSV file does not exist. Attempting to download from Google Spreadsheet...");
      const csv = await fetchCSVFromGoogle();
      saveCSVToFile(csv);
      console.log("CSV file downloaded and saved successfully.");
      return csv;
    }
    console.log("Reading CSV file from iCloud...");
    const csv = fm.readString(filePath);
    console.log("CSV file read successfully.");
    return csv;
  } catch (error) {
    console.error("Error in readCSVFromFile:", error.message);
    throw new Error("Failed to read or download the CSV file.");
  }
}

/**
 * Checks if the CSV file is older than 48 hours.
 * @returns {boolean} - True if the file is older than 48 hours, false otherwise.
 */
function isCSVOutdated() {
  if (!fm.fileExists(filePath)) {
    return true; // File doesn't exist, so it's outdated
  }
  const fileDate = fm.modificationDate(filePath);
  const now = new Date();
  const diffInHours = (now - fileDate) / (1000 * 60 * 60);
  return diffInHours > 48;
}

/**
 * Fetches the CSV, either from iCloud or Google Spreadsheet if outdated.
 * @returns {Promise<string>} - Returns the raw CSV string.
 */
async function getCSV() {
  try {
    if (isCSVOutdated()) {
      console.log("CSV is outdated or missing. Downloading from Google Spreadsheet...");
      const csv = await fetchCSVFromGoogle();
      saveCSVToFile(csv);
      console.log("CSV file downloaded and saved successfully.");
      return csv;
    } else {
      console.log("Using cached CSV from iCloud.");
      return await readCSVFromFile();
    }
  } catch (error) {
    console.error("Error in getCSV:", error.message);
    throw new Error("Failed to fetch the CSV file.");
  }
}

/**
 * Filters rows based on the search term.
 * @param {Array} rows - The rows from the CSV.
 * @param {string} searchTerm - The term to search for.
 * @returns {Array} - Filtered rows matching the search term.
 */
function filterRows(rows, searchTerm) {
  return rows.filter(row => {
    // Validar que la fila tenga al menos 3 columnas (para evitar errores de índice)
    if (row.length < 3) {
      console.warn("Skipping malformed row:", row);
      return false;
    }

    // Validar que el nombre del Pokémon (row[2]) exista y coincida con el término de búsqueda
    return row[2] && row[2].toLowerCase().includes(searchTerm.toLowerCase());
  });
}

// — Main Logic —

async function main() {
  try {
    console.log("Starting main logic...");
    // Fetch the CSV (either from iCloud or Google Spreadsheet)
    const csv = await getCSV();

    // Parse the CSV into rows
    console.log("Parsing CSV into rows...");
    let rows = csv.trim().split("\n").map(row => row.split(","));
    console.log(`Parsed ${rows.length} rows from the CSV.`);

    // Skip the header row
    rows = rows.slice(1);

    // Filter rows based on the search term
    console.log(`Filtering rows for search term: "${SEARCH_TERM}"...`);
    let matches = filterRows(rows, SEARCH_TERM);
    console.log(`Found ${matches.length} matches for "${SEARCH_TERM}".`);

    // Format the output
    if (matches.length === 0) {
      console.log("No matches found.");
      return `No results found for "${SEARCH_TERM}".`;
    }

    // Separate matches into "Already got it" and "Still missing"
    let alreadyGotIt = [];
    let stillMissing = [];

    matches.forEach(row => {
      const name = row[2].trim();
      const set = row[3].trim();
      const number = row[4].trim();
      const quantity = parseInt(row[0].trim(), 10) || 0;

      if (quantity > 0) {
        alreadyGotIt.push(`${name} ${set}-${number} (${quantity})`);
      } else {
        stillMissing.push(`${name} ${set}-${number}`);
      }
    });

    // Build the output
    let output = `Search Results for "${SEARCH_TERM}":\n\n`;

    if (alreadyGotIt.length > 0) {
      output += `Already got it:\n`;
      alreadyGotIt.forEach((item, index) => {
        output += `${index + 1}.\t  ${item}\n`;
      });
      output += `\n`;
    }

    if (stillMissing.length > 0) {
      output += `Still missing:\n`;
      stillMissing.forEach((item, index) => {
        output += `${index + 1}.\t ${item}\n`;
      });
    }

    // Add the file modification date at the end
    const fileDate = fm.modificationDate(filePath);
    const formattedDate = fileDate.toLocaleString(); // Format the date as a readable string
    output += `\n\nBased on data last updated on: ${formattedDate}`;

    // Log and return the output
    console.log("Output generated successfully.");
    console.log(output);
    return output;
  } catch (error) {
    console.error("Error in main:", error.message);
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