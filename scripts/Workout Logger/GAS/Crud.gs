class Crud {
  // === CREATE ===
  static createWorkout(sheet, params) {
    const now = new Date().toISOString();
    const row = {
      date: params.date || "",
      time: params.time || "",
      pushups: params.pushups || 0,
      squats: params.squats || 0,
      tabata: params.tabata ? "Yes" : "No",
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

    Macros.FormatDocument();

    return ContentService.createTextOutput("Workout created successfully");
  }

  // === READ ===
  static readWorkouts(sheet, params) {
    const range = sheet.getDataRange();
    const values = range.getValues();

    // Optionally filter by date or other criteria
    const filtered = values.filter((row, index) => {
      if (index === 0) return false; // Skip header row
      if (params.date && row[0] !== params.date) return false; // Filter by date
      return true;
    });

    return ContentService.createTextOutput(JSON.stringify(filtered));
  }

  // === EDIT ===
  static editWorkout(sheet, params) {
    if (!params.row) {
      return ContentService.createTextOutput("Error: 'row' parameter is required for editing.");
    }

    const rowNumber = parseInt(params.row, 10);
    const range = sheet.getRange(rowNumber, 1, 1, 7); // Get the range for the row
    const values = range.getValues()[0]; // Get the current values in the row

    // Update the row with new params
    range.setValues([[
      params.date || values[0],
      params.time || values[1],
      params.pushups || values[2],
      params.squats || values[3],
      params.tabata ? "Yes" : "No",
      values[5], // Keep createdAt
      new Date().toISOString(), // Update updatedAt
    ]]);

    Macros.FormatDocument();

    return ContentService.createTextOutput("Workout updated successfully");
  }

  // === DELETE ===
  static deleteWorkout(sheet, params) {
    if (!params.row) {
      return ContentService.createTextOutput("Error: 'row' parameter is required for deletion.");
    }

    const rowNumber = parseInt(params.row, 10);
    sheet.deleteRow(rowNumber);

    Macros.FormatDocument();

    return ContentService.createTextOutput("Workout deleted successfully");
  }

  // === LIST ===
  static listWorkouts(sheet) {
    const range = sheet.getDataRange();
    const values = range.getValues();

    // Map rows to include the row number
    const workouts = values.map((row, index) => {
      if (index === 0) return null; // Skip header row
      return {
        row: index + 1, // Row number in the sheet
        date: Utilities.formatDate(new Date(row[0]), Session.getScriptTimeZone(), "yyyy-MM-dd"), // Format date as YYYY-MM-DD
        time: Utilities.formatDate(new Date(row[1]), Session.getScriptTimeZone(), "HH:mm"), // Format time as HH:mm
        pushups: row[2],
        squats: row[3],
        tabata: row[4],
        createdAt: row[5],
        updatedAt: row[6],
      };
    }).filter(workout => workout !== null); // Remove null values (header row)

    return ContentService.createTextOutput(JSON.stringify(workouts));
  }

  // === LIST BY DATE ===
  static listWorkoutsByDate(sheet, params) {
    const date = params.date;
    if (!date) {
      return ContentService.createTextOutput("Error: 'date' parameter is required for filtering.");
    }

    // Reuse listWorkouts to get all workouts
    const allWorkouts = JSON.parse(listWorkouts(sheet).getContent());

    // Filter workouts by date
    const filteredWorkouts = allWorkouts.filter(workout => {
      const workoutDate = new Date(workout.date).toISOString().split("T")[0]; // Convert to YYYY-MM-DD
      return workoutDate === date;
    });

    return ContentService.createTextOutput(JSON.stringify(filteredWorkouts)).setMimeType(ContentService.MimeType.JSON);
  }
}