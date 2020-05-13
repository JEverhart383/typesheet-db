//TODO: refactor all logic dealing with the manipulation of the sheets
// into here
export default class SheetsService {
  static getAllTableNames () {
    return SpreadsheetApp.getActiveSpreadsheet().getSheets().map(sheet => sheet.getName())
  }
}