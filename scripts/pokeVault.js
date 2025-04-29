// — Configuration —
const SHEET_ID = "1mUimZUbpPU3JXU_vw_o6XEe9DKdQCiJMYx0ZL2bQzA4";
const GID = "837318860";
const SEARCH_TERM = args.plainTexts[0] || "Pikachu"; // Default to Pikachu if no input provided
const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;
const filePath = FileManager.iCloud().joinPath(FileManager.iCloud().documentsDirectory(), "ptcgp.csv");

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
 * Saves the CSV to iCloud.
 * @param {string} csv - The raw CSV string.
 */
function saveCSVToFile(csv) {
  const fm = FileManager.iCloud();
  fm.writeString(filePath, csv);
}

/**
 * Reads the CSV from iCloud.
 * If the file doesn't exist, attempts to download it from Google Spreadsheet.
 * @returns {Promise<string>} - The raw CSV string.
 */
async function readCSVFromFile() {
  const fm = FileManager.iCloud();
  if (!fm.fileExists(filePath)) {
    console.log("CSV file does not exist. Downloading from Google Spreadsheet...");
    const csv = await fetchCSVFromGoogle();
    saveCSVToFile(csv);
    return csv;
  }
  return fm.readString(filePath);
}

/**
 * Checks if the CSV file is older than 48 hours.
 * @returns {boolean} - True if the file is older than 48 hours, false otherwise.
 */
function isCSVOutdated() {
  const fm = FileManager.iCloud();
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
  if (isCSVOutdated()) {
    console.log("CSV is outdated or missing. Downloading from Google Spreadsheet...");
    const csv = await fetchCSVFromGoogle();
    saveCSVToFile(csv);
    return csv;
  } else {
    console.log("Using cached CSV from iCloud.");
    return readCSVFromFile();
  }
}

// — Main Logic —

async function main() {
  try {
    // Fetch the CSV (either from iCloud or Google Spreadsheet)
    const csv = await getCSV();

    // Parse the CSV into rows
    let rows = csv.trim().split("\n").map(row => row.split(","));

    // Skip the header row
    rows = rows.slice(1);

    // Filter rows based on the search term
    let matches = filterRows(rows, SEARCH_TERM);

    // Format the output
    if (matches.length === 0) {
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