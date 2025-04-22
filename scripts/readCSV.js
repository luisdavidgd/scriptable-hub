const spreadsheetId = "1bseqE1YdYwoqqa7GcscMF4xcIDhyfpbCKXscVWbGkN4";
const gid = "0";
const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;

async function fetchCSV() {
  const req = new Request(csvUrl);
  const csv = await req.loadString();

  const rows = csv.split("\n").map(row => row.split(","));
  return rows;
}

async function createTableWidget() {
  const rows = await fetchCSV();
  
  const widget = new ListWidget();
  widget.backgroundColor = Color.dynamic(Color.white(), Color.black());
  
  const title = widget.addText("Tabla de Datos");
  title.font = Font.boldSystemFont(16);
  title.centerAlignText();
  widget.addSpacer(10);
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i].join(" | "); // Combina columnas con separador
    const text = widget.addText(row);
    text.font = Font.systemFont(12);
    text.textColor = Color.dynamic(Color.black(), Color.white());
  }
  
  return widget;
}

const widget = await createTableWidget();
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentMedium();
}
Script.complete();