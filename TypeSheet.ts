export default class TypeSheet {
  static getTableByName(tableName: string): GoogleAppsScript.Spreadsheet.Sheet {
    try {
      var tables: GoogleAppsScript.Spreadsheet.Sheet[] = SpreadsheetApp.getActiveSpreadsheet().getSheets()    
      var filteredTables = tables.filter(function(table){
        return (table.getName().toLowerCase() === tableName.toLowerCase())
      })
      
      var table = filteredTables[0];
      return table; 
      
    } catch (err) {
      Logger.log(err)
    }
  
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
      var filter = {}
      filter.prop = key;
      filter.value = parameter[key]; 
      filters.push(filter); 
    }
    
    return TypeSheet.recursiveFilterProcess(filters, valuesAsJSON); 
  }
  
  static recursiveFilterProcess (arrayOfFilters, arrayOfValues) {
    
    if (arrayOfFilters.length > 0) {
      var filterToCheck = arrayOfFilters[0];
      var filteredArray = arrayOfValues.filter(function(value){
        if (value[filterToCheck.prop] === filterToCheck.value) {
          return true;
        } else {
          return false; 
        }
      })
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