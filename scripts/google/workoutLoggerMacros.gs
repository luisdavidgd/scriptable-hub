function FormatDocument() {
    var spreadsheet = SpreadsheetApp.getActive();
    spreadsheet.getRange('A:A').activate();
    spreadsheet.getActiveRangeList().setNumberFormat('yyyy"-"mm"-"dd');
    spreadsheet.getRange('B:B').activate();
    spreadsheet.getActiveRangeList().setNumberFormat('h":"mm":"ss');
    spreadsheet.getRange('A1').activate();
    spreadsheet.getActiveSheet().getFilter().sort(1, false);
  };