function FormatDocument() {
    var spreadsheet = SpreadsheetApp.getActive();
    spreadsheet.getRange('A:A').activate();
    spreadsheet.getActiveRangeList().setNumberFormat('yyyy"-"mm"-"dd');
    spreadsheet.getRange('B:B').activate();
    spreadsheet.getActiveRangeList().setNumberFormat('h":"mm');
    spreadsheet.getRange('C:C').activate();
    spreadsheet.getActiveRangeList().setNumberFormat('0');
    spreadsheet.getRange('D:D').activate();
    spreadsheet.getActiveRangeList().setNumberFormat('0');
    spreadsheet.getRange('A1').activate();
    spreadsheet.getActiveSheet().getFilter().sort(1, false);
};