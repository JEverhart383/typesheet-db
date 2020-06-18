import SheetsService from "./services/SheetsService";
import DataModel from "./DataModel";
import API from "./API";
import Helper from "./Helper";


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
    const table = SheetsService.getTableByName(this.tableName)
    const tableValues = SheetsService.getTableValuesAsJSON(table)
    const filteredValues = TypeSheet.filterTablesByParams(this.searchParameters, tableValues)
    return API.sendSuccessResponse(`Successfully read ${filteredValues.length} record${filteredValues.length > 1 || filteredValues.length === 0 ? 's' : ''} from '${this.tableName}' table`, filteredValues)
  }

  public createRecord () {
    const tableDef = DataModel.getTableDefinitionFromMasterProps(this.tableName)
    if (!tableDef) {
      return API.sendBadRequestErrorResponse(`The specified table doesn't exist in your data model. Add it to perform create, update, and delete operations.`)
    }
    const table = SheetsService.getTableByName(this.tableName);
    const rowToAdd = tableDef.columns.map( column => {
      var columnName = column.name.toLowerCase();
      if (columnName === 'id') {
        return Helper.createUUID();
      }
      return this.payload[columnName] ? this.payload[columnName] : '';
    })
    table.appendRow(rowToAdd)
    return API.sendSuccessResponse(`Successfully created a record in the '${this.tableName}' table`, rowToAdd)
  }

  public deleteRecord () {
    const tableDef = DataModel.getTableDefinitionFromMasterProps(this.tableName)
    if (!tableDef) {
      return API.sendBadRequestErrorResponse(`The specified table doesn't exist in your data model. Add it to perform create, update, and delete operations.`)
    }
    const table = SheetsService.getTableByName(this.tableName)
    const recordLocation = SheetsService.getRecordLocationInTable(table, this.payload.id)
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
  
  static recursiveFilterProcess (filters: any[], values: any[]) {
    
    if (filters.length > 0) {
      const filterToCheck = filters[0];
      const filteredArray = values.filter(value => value[filterToCheck.prop] === filterToCheck.value)
      filters.shift();
      if (filters.length > 0) return TypeSheet.recursiveFilterProcess(filters, filteredArray)
      return filteredArray;
    }
    return values;
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