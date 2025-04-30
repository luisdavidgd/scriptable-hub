function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetById(0);
  const data = JSON.parse(e.postData.contents);

  if (data.action === "create") {
    const now = new Date().toISOString();
    const row = {
      date: data.date || "",
      time: data.time || "",
      pushups: data.pushups || 0,
      squats: data.squats || 0,
      tabata: data.tabata ? "Yes" : "No",
      createdAt: now,
      updatedAt: now,
    };

    // Convert the object to an array in the desired order
    sheet.appendRow([
      row.date,
      row.time,
      row.pushups,
      row.squats,
      row.tabata,
      row.createdAt,
      row.updatedAt,
    ]);

    return ContentService.createTextOutput("Saved");
  }

  // Future: Add support for 'read', 'edit', 'delete'
  return ContentService.createTextOutput("Unsupported action");
}