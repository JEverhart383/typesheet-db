//TODO: refactor all logic dealing with the manipulation of the sheets

import DataModel from "../DataModel";

// into here
export default class SheetsService {
  static getAllTableNames () {
    return SpreadsheetApp.getActiveSpreadsheet().getSheets().map(sheet => sheet.getName())
  }

  static addTableToSpreadsheet (newTable) {
    const table = SpreadsheetApp.getActiveSpreadsheet().insertSheet(newTable.name)
    newTable.columns.unshift({
      'name': 'ID',
      'type': 'String'
    }); 
    const headers = newTable.columns.map(column => column.name)
    table.appendRow(headers)
    return true
  }

  static deleteTable (tableName:string) {
    const table = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tableName)
    SpreadsheetApp.getActiveSpreadsheet().deleteSheet(table)
    return true
  
  }
  static setActiveTable (tableName:string) {
    const table = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tableName)
    SpreadsheetApp.setActiveSheet(table)
  }
}