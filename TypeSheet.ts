//TypeSheet should be our main coordination class for using the methods on 
// DataModel and SheetsService to make changes to the underlying structure of the sheets


//This class should have the following methods
//deleteRecord, getRecords, createRecord, updateRecord
//createTable, updateTable, importTable, getTables, getTableByName

export default class TypeSheet {
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
        let key = headers[index].toLowerCase();
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