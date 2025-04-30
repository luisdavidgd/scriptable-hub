function FormatCellsMacro() {
    var spreadsheet = SpreadsheetApp.getActive();
    var sheet = spreadsheet.getActiveSheet();
    sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).activate();
    spreadsheet.getActiveRangeList().setNumberFormat('@');
};

function FormatDocument() {
    var spreadsheet = SpreadsheetApp.getActive();
    var sheet = spreadsheet.getActiveSheet();
    sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).activate();
    spreadsheet.getActiveRangeList().setNumberFormat('@');
    spreadsheet.getRange('A1').activate();
    spreadsheet.getActiveSheet().getFilter().sort(1, true);
};