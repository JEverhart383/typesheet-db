//TypeSheet should be our main coordination class for using the methods on 
// DataModel and SheetsService to make changes to the underlying structure of the sheets

import SheetsService from "./services/SheetsService";
import DataModel from "./DataModel";
import API from "./API";


//This class should have the following methods
//deleteRecord, getRecords, createRecord, updateRecord
//createTable, updateTable, importTable, getTables, getTableByName
//This might also work better as an instance class

export default class TypeSheet {
  private tableName: string = null
  private searchParameters: object = null
  private dataModel: Object = null
  constructor(tableName: string, searchParameters:object){
    this.tableName = tableName
    this.searchParameters = searchParameters
    this.dataModel = DataModel.getMasterPropsAsJSON()
  }

  public getRecords () {
    if (this.tableName === 'dataModel') {
      return API.sendSuccessResponse(`Returned data model`, DataModel.getMasterPropsAsJSON())
    }
    //TODO: think about this pattern, new TypeSheet(table)
    //const items = TypeSheet.getTypes(parameters)
    var table = SheetsService.getTableByName(this.tableName); 
    var tableValues = TypeSheet.getTableValuesAsJSON(table);
    var filteredValues = TypeSheet.filterTablesByParams(this.searchParameters, tableValues);
    return API.sendSuccessResponse(`Successfully read ${filteredValues.length} record${filteredValues.length > 1 || filteredValues.length === 0 ? 's' : ''} from '${this.tableName}' table`, filteredValues)
  }
  static getTableValuesAsJSON (table: GoogleAppsScript.Spreadsheet.Sheet ): any {
    const rows = SheetsService.getTableValuesAsArray(table)
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
  static filterTablesByParams (parameters, valuesAsJSON) {
    //remove table key
    delete parameters['table'];
    var filters = [];
    
    for (var key in parameters) {
      var filter = {
        prop: null,
        value: null
      }
      filter.prop = key;
      filter.value = parameters[key]; 
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