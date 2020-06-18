//TODO: refactor all logic dealing with the manipulation of the sheets

import DataModel from "../DataModel";
export default class SheetsService {
  static getAllTableNames () {
    return SpreadsheetApp.getActiveSpreadsheet().getSheets().map(sheet => sheet.getName())
  }
  static getTableByName(tableName: string): GoogleAppsScript.Spreadsheet.Sheet {
    try {
      var tables: GoogleAppsScript.Spreadsheet.Sheet[] = SpreadsheetApp.getActiveSpreadsheet().getSheets()    
      var filteredTables = tables.filter(function(table){
        return (table.getName().toLowerCase() === tableName.toLowerCase())
      })
      var table = filteredTables[0];
      return table; 
      
    } catch (err) {
      //Throw an error here if table doesn't exist
      Logger.log(err)
    }
  
  }

  static getRecordLocationInTable (table: GoogleAppsScript.Spreadsheet.Sheet, id:string): any {
    //TODO: Update this method to return recordLocation as number
    var lastRow = table.getLastRow();
    var idValues = table.getRange(1, 1, lastRow).getValues().map(function(cell){ return cell[0]});
    Logger.log(idValues);
    var recordLocation = idValues.indexOf(id)
    if (recordLocation === -1) {
      return -1;
    }
    return recordLocation + 1;
  }

  static addTableToSpreadsheet (newTable): boolean {
    const table = SpreadsheetApp.getActiveSpreadsheet().insertSheet(newTable.name)
    newTable.columns.unshift({
      'name': 'ID',
      'type': 'String'
    }); 
    const headers = newTable.columns.map(column => column.name)
    table.appendRow(headers)
    return true
  }

  static addColumnToTable (newColumn, tableName: string): boolean {
    const table = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tableName)
    return true
  }

  static deleteTable (tableName:string): boolean {
    const table = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tableName)
    SpreadsheetApp.getActiveSpreadsheet().deleteSheet(table)
    return true
  
  }
  static setActiveTable (tableName:string) {
    const table = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tableName)
    SpreadsheetApp.setActiveSheet(table)
    const dataModel = DataModel.getMasterPropsAsJSON()
    if (dataModel.tables[tableName.toLowerCase()]){
      return dataModel.tables[tableName.toLowerCase()]
    }

    const headers = table.getDataRange().getValues().shift().map(column => {name:column})
    return {name: tableName, columns: headers}
    //return data model representation of table, as this should only get called in the UI when things are selected.
    //If tableName is present in the DataModel, then return it if not get 
  }
}