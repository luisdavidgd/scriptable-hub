function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetById(0);
  const data = JSON.parse(e.postData.contents);

  if (data.action === "create") {
    return createWorkout(sheet, data);
  } else if (data.action === "read") {
    return readWorkouts(sheet, data);
  } else if (data.action === "edit") {
    return editWorkout(sheet, data);
  } else if (data.action === "delete") {
    return deleteWorkout(sheet, data);
  } else if (data.action === "list") {
    return listWorkouts(sheet);
  }

  return ContentService.createTextOutput("Unsupported action");
}

// === CREATE ===
function createWorkout(sheet, data) {
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

  sheet.appendRow([
    row.date,
    row.time,
    row.pushups,
    row.squats,
    row.tabata,
    row.createdAt,
    row.updatedAt,
  ]);

  FormatDocument();

  return ContentService.createTextOutput("Workout created successfully");
}

// === READ ===
function readWorkouts(sheet, data) {
  const range = sheet.getDataRange();
  const values = range.getValues();

  // Optionally filter by date or other criteria
  const filtered = values.filter((row, index) => {
    if (index === 0) return false; // Skip header row
    if (data.date && row[0] !== data.date) return false; // Filter by date
    return true;
  });

  return ContentService.createTextOutput(JSON.stringify(filtered));
}

// === EDIT ===
function editWorkout(sheet, data) {
  if (!data.row) {
    return ContentService.createTextOutput("Error: 'row' parameter is required for editing.");
  }

  const rowNumber = parseInt(data.row, 10);
  const range = sheet.getRange(rowNumber, 1, 1, 7); // Get the range for the row
  const values = range.getValues()[0]; // Get the current values in the row

  // Update the row with new data
  range.setValues([[
    data.date || values[0],
    data.time || values[1],
    data.pushups || values[2],
    data.squats || values[3],
    data.tabata ? "Yes" : "No",
    values[5], // Keep createdAt
    new Date().toISOString(), // Update updatedAt
  ]]);

  FormatDocument();

  return ContentService.createTextOutput("Workout updated successfully");
}

// === DELETE ===
function deleteWorkout(sheet, data) {
  if (!data.row) {
    return ContentService.createTextOutput("Error: 'row' parameter is required for deletion.");
  }

  const rowNumber = parseInt(data.row, 10);
  sheet.deleteRow(rowNumber);

  FormatDocument();

  return ContentService.createTextOutput("Workout deleted successfully");
}

// === LIST ===
function listWorkouts(sheet) {
  const range = sheet.getDataRange();
  const values = range.getValues();

  // Map rows to include the row number
  const workouts = values.map((row, index) => {
    if (index === 0) return null; // Skip header row
    return {
      row: index + 1, // Row number in the sheet
      date: row[0],
      time: row[1],
      pushups: row[2],
      squats: row[3],
      tabata: row[4],
      createdAt: row[5],
      updatedAt: row[6],
    };
  }).filter(workout => workout !== null); // Remove null values (header row)

  return ContentService.createTextOutput(JSON.stringify(workouts));
}