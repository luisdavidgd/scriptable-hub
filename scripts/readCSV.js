const spreadsheetId = "1bseqE1YdYwoqqa7GcscMF4xcIDhyfpbCKXscVWbGkN4";
const gid = "0";
const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;

async function fetchCSV() {
  const req = new Request(csvUrl);
  const csv = await req.loadString();
  const rows = csv.split("\n").map(row => row.split(","));
  return rows;
}

async function showColumnAsList() {
  const rows = await fetchCSV();

  // Create UITable
  const table = new UITable();

  // Parse and display only Column 2 (index 1)
  rows.slice(1).forEach((row, index) => {
    const dataRow = new UITableRow();
    const column2 = row[1]?.trim() || "No Data"; // Safely handle missing data
    const fullRow = row.join(", "); // Combine full row for details

    // Add column 2 data to the UITable
    dataRow.addText(column2);

    // Make row clickable to show full details
    dataRow.onSelect = () => {
      const alert = new Alert();
      alert.title = `Row ${index + 1} Details`;
      alert.message = `Full Data: ${fullRow}`;
      alert.addAction("OK");
      alert.present();
    };

    table.addRow(dataRow);
  });

  // Present the table
  table.present();
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