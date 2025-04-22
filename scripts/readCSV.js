const spreadsheetId = "1bseqE1YdYwoqqa7GcscMF4xcIDhyfpbCKXscVWbGkN4";
const gid = "0";
const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
const localFileName = "persisted_list.json";

async function fetchCSV() {
  const req = new Request(csvUrl);
  const csv = await req.loadString();
  const rows = csv.split("\n").map(row => row.split(","));
  return rows;
}

function saveListToFile(data) {
  const fileManager = FileManager.local();
  const filePath = fileManager.joinPath(fileManager.documentsDirectory(), localFileName);
  fileManager.writeString(filePath, JSON.stringify(data));
}

function loadListFromFile() {
  const fileManager = FileManager.local();
  const filePath = fileManager.joinPath(fileManager.documentsDirectory(), localFileName);
  if (fileManager.fileExists(filePath)) {
    const content = fileManager.readString(filePath);
    return JSON.parse(content);
  }
  return null;
}

async function showColumnAsList() {
  let rows = loadListFromFile();

  if (!rows) {
    rows = await fetchCSV();
    saveListToFile(rows);
  }

  const table = new UITable();

  rows.slice(1).forEach((row, index) => {
    const dataRow = new UITableRow();
    const column2 = row[1]?.trim() || "No Data"; // Columna 2
    const column3 = row[2]?.trim(); // Columna 3 (URL)

    dataRow.addText(column2);

    dataRow.onSelect = async () => {
      if (column3 && column3.startsWith("http")) {
        await Safari.openInApp(column3);
      } else {
        const alert = new Alert();
        alert.title = `No URL Found`;
        alert.message = `Row ${index + 1} does not have a valid URL.`;
        alert.addAction("OK");
        await alert.present();
      }

      await showColumnAsList();
    };

    table.addRow(dataRow);
  });

  await table.present();
}

async function main() {
  // Call the function to display the list
  await showColumnAsList();
}

// Only run main() if not already running via external loader
if (typeof __runFromLoader__ === "undefined") {
  console.log("from readCSV.js")
  main();
}