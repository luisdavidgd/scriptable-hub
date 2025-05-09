class Utils {
  /**
   * Extracts the year from the provided parameters.
   * If the year is invalid or not present, returns the current year.
   * @param {Object} params - The parameters provided in the request.
   * @returns {string} - A valid year as a string.
   */
  static getYearFromParams(params) {
    // Prioritize the year parameter if it exists and is valid
    if (params && params.year && !isNaN(params.year)) {
      return params.year.toString();
    }

    // If no year is provided, check for a date parameter
    if (params && params.date) {
      const date = new Date(params.date);
      if (!isNaN(date.getTime())) {
        return date.getFullYear().toString();
      }
    }

    // If no valid year is found, return the current year
    const currentYear = new Date().getFullYear().toString();
    return currentYear;
  }

  /**
   * Retrieves or creates a sheet for the specified year.
   * If the sheet does not exist, it will be created with default headers.
   * @param {string} year - The year for which the sheet is needed.
   * @returns {Sheet} - The Google Sheets object for the specified year.
   */
  static getSpreadsheetByYear(year) {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(year);

    if (!sheet) {
      // Create the sheet if it doesn't exist
      sheet = spreadsheet.insertSheet(year);
      // Add default headers to the new sheet
      sheet.appendRow(["Date", "Time", "Pushups", "Squats", "Tabata", "CreatedAt", "UpdatedAt"]);
    }

    return sheet;
  }
}