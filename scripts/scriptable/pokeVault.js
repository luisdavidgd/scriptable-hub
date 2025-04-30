// — Configuration —
const SEARCH_TERM = args.plainTexts[0] || "Pikachu"; // Default to Pikachu if no input provided

const fm = FileManager.iCloud();
const configFolderPath = fm.joinPath(fm.documentsDirectory(), "Config");
const configFilePath = fm.joinPath(configFolderPath, "pokeVault.json");
const dataDir = fm.joinPath(fm.documentsDirectory(), "Data");
const filePath = fm.joinPath(dataDir, "ptcgp.csv");

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
    throw new Error("Invalid configuration file. Please check pokeVault.json.");
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

// — Utility Functions —

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
  fm.writeString(filePath, csv);
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
      return fm.readString(filePath);
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
    // Fetch the CSV (either from iCloud or Google Script)
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