//TypeSheet should be our main coordination class for using the methods on 
// DataModel and SheetsService to make changes to the underlying structure of the sheets


export default class TypeSheet {
  // refactor to sheets service
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
  static getTableValuesAsArray (table: GoogleAppsScript.Spreadsheet.Sheet ): any[] {
    var allValues = table.getDataRange().getValues(); 
    return allValues;
  }
  static getTableValuesAsJSON (table: GoogleAppsScript.Spreadsheet.Sheet ): any {
    const rows = this.getTableValuesAsArray(table)
    const headers = rows.shift()
    const jsonValues = rows.map(function(row) {
      let jsonValue = {}
      row.forEach(function(value, index) {
        let key = headers[index].split('::')[0].toLowerCase();
        jsonValue[key] = value;
      })
      return jsonValue
    })

    return jsonValues
  }
  static filterTablesByParams (parameter, valuesAsJSON) {
    //remove table key
    delete parameter['table'];
    var filters = [];
    
    for (var key in parameter) {
      var filter = {
        prop: null,
        value: null
      }
      filter.prop = key;
      filter.value = parameter[key]; 
      filters.push(filter); 
    }
    
    return TypeSheet.recursiveFilterProcess(filters, valuesAsJSON); 
  }
  
  static recursiveFilterProcess (arrayOfFilters, arrayOfValues) {
    
    if (arrayOfFilters.length > 0) {
      var filterToCheck = arrayOfFilters[0];
      var filteredArray = arrayOfValues.filter(value => value[filterToCheck.prop] === filterToCheck.value)
      // remove filter we just used
      arrayOfFilters.shift();
      // if there are still filters to be checked, 
      // call again. If not, resolve
      if (arrayOfFilters.length > 0) {
        return TypeSheet.recursiveFilterProcess(arrayOfFilters, filteredArray)
      } else {
        return filteredArray; 
      }
    } else {
      return arrayOfValues; 
    }
    
  }
}