import SheetsService from "./services/SheetsService";
import DataModel from "./DataModel";
import API from "./API";


//This class should have the following methods
//createRecord, updateRecord
//TODO: consider another class here, and maybe this is all in DataModel
//createTable, updateTable, importTable, getTables, getTableByName

export default class TypeSheet {
  private tableName: string = null
  private searchParameters: object = null
  private payload: Payload = null
  private dataModel: Object = null
  constructor(typeSheetRequest: TypeSheetRequest){
    if (typeSheetRequest.tableName) this.tableName = typeSheetRequest.tableName
    if (typeSheetRequest.searchParameters) this.searchParameters = typeSheetRequest.searchParameters
    if (typeSheetRequest.payload) this.payload = typeSheetRequest.payload
    this.dataModel = DataModel.getMasterPropsAsJSON()
  }

  public getRecords () {
    if (this.tableName === 'dataModel') {
      return API.sendSuccessResponse(`Returned data model`, DataModel.getMasterPropsAsJSON())
    }
    //TODO: think about this pattern, new TypeSheet(table)
    //const items = TypeSheet.getTypes(parameters)
    var table = SheetsService.getTableByName(this.tableName); 
    var tableValues = SheetsService.getTableValuesAsJSON(table);
    var filteredValues = TypeSheet.filterTablesByParams(this.searchParameters, tableValues);
    return API.sendSuccessResponse(`Successfully read ${filteredValues.length} record${filteredValues.length > 1 || filteredValues.length === 0 ? 's' : ''} from '${this.tableName}' table`, filteredValues)
  }

  public deleteRecord () {
    // TODO: All of this should be refactored into TypeSheet class, and processRequest should just
    // call one method on TypeSheet, which calls both SheetsService and DataModel
    const tableDef = DataModel.getTableDefinitionFromMasterProps(this.tableName);
    
    //TODO: Deal with this later, but there is a philospical underpinning here that needs to be examined.
    //Namely, do we add items using the data model we can extract from the spreadsheet in a flexible way,
    //or do we enforce consistency to provide more secure data; right now, we're favoring consistency 
    if (!tableDef) {
      return API.sendBadRequestErrorResponse(`The specified table doesn't exist in your data model. Add it to perform create, update, and delete operations.`)
    }
    const table = SheetsService.getTableByName(this.tableName);
    const recordLocation = SheetsService.getRecordLocationInTable(table, this.payload.id);
    
    if (recordLocation === -1) {
      return API.sendNotFoundResponse(`A record with the id ${this.payload.id} cannot be found in ${this.tableName} table`)
    }
    table.deleteRow(recordLocation)
    return API.sendSuccessResponse(`Successfully deleted record with the id  ${this.payload.id} in ${this.tableName} table`, this.payload)
  }

  static filterTablesByParams (parameters, valuesAsJSON) {
    var filters = [];
    for (var key in parameters) {
      var filter = { prop: key, value: parameters[key] }
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

interface TypeSheetRequest {
  tableName: string;
  payload?: Payload;
  searchParameters?: object;
}

interface Payload {
  id: string
}