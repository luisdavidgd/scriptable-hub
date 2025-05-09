class Macros {
  static FormatDocument() {
    var spreadsheet = SpreadsheetApp.getActive();
    spreadsheet.getRange('A:A').activate();
    spreadsheet.getActiveRangeList().setNumberFormat('yyyy"-"mm"-"dd');
    spreadsheet.getActiveSheet().sort(1, false);
    spreadsheet.getRange('B:B').activate();
    spreadsheet.getActiveRangeList().setNumberFormat('h":"mm');
    spreadsheet.getRange('C:C').activate();
    spreadsheet.getActiveRangeList().setNumberFormat('0');
    spreadsheet.getRange('D:D').activate();
    spreadsheet.getActiveRangeList().setNumberFormat('0');
  };
}