const spreadsheetId = "1bseqE1YdYwoqqa7GcscMF4xcIDhyfpbCKXscVWbGkN4";
const gid = "0";
const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
const localFileName = "persisted_list.json"; // Archivo local para persistencia

async function fetchCSV() {
  const req = new Request(csvUrl);
  const csv = await req.loadString();
  const rows = csv.split("\n").map(row => row.split(","));
  return rows;
}

// Guardar lista en archivo local
function saveListToFile(data) {
  const fileManager = FileManager.local();
  const filePath = fileManager.joinPath(fileManager.documentsDirectory(), localFileName);
  fileManager.writeString(filePath, JSON.stringify(data));
}

// Cargar lista desde archivo local
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
  // Intenta cargar datos persistidos
  let rows = loadListFromFile();

  // Si no hay datos persistidos, descarga el CSV
  if (!rows) {
    rows = await fetchCSV();
    saveListToFile(rows); // Guarda los datos descargados
  }

  const table = new UITable();

  // Mostrar solo la columna 2 (index 1) en la lista
  rows.slice(1).forEach((row, index) => {
    const dataRow = new UITableRow();
    const column2 = row[1]?.trim() || "No Data"; // Columna 2
    const column3 = row[2]?.trim(); // Columna 3 (URL)

    // Agregar columna 2 a la tabla
    dataRow.addText(column2);

    // Hacer la fila clickeable para abrir la URL de la columna 3
    dataRow.onSelect = async () => {
      if (column3 && column3.startsWith("http")) {
        await Safari.openInApp(column3); // Abrir URL en Safari (in-app)
      } else {
        const alert = new Alert();
        alert.title = `No URL Found`;
        alert.message = `Row ${index + 1} does not have a valid URL.`;
        alert.addAction("OK");
        await alert.present();
      }

      // Volver a mostrar la lista después de cerrar Safari o alerta
      await showColumnAsList();
    };

    table.addRow(dataRow);
  });

  // Presentar la tabla
  await table.present();
}

// Llamar a la función para mostrar la lista
await showColumnAsList();