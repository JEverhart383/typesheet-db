import SheetsService from "./services/SheetsService";
import DataModel from "./DataModel";
import API from "./API";
import Helper from "./Helper";

export default class TypeSheet {
  private tableName: string = null
  private searchParameters: object = null
  private payload: Payload = null
  private dataModel: DataModel = null
  constructor(typeSheetRequest: TypeSheetRequest){
    if (typeSheetRequest.tableName) this.tableName = typeSheetRequest.tableName
    if (typeSheetRequest.searchParameters) this.searchParameters = typeSheetRequest.searchParameters
    if (typeSheetRequest.payload) this.payload = typeSheetRequest.payload
    this.dataModel = new DataModel(this.tableName, this.payload)
  }
  public methodBlueprint () {
    //pre data model stuff
      //if invalid data or not in data model reject
      //transform input to match columns if needed
      //run pre hooks to resolve any stuff there
    //read, write, update, delete, etc.
      //transform output if reading
    //run any post hooks
    //return response
    

  }
  public getRecords () {
    //TODO: add type coercion
    if (this.tableName === 'dataModel') {
      return API.sendSuccessResponse(`Returned data model`, DataModel.getMasterPropsAsJSON())
    }
    const table = SheetsService.getTableByName(this.tableName)
    const tableValues = SheetsService.getTableValuesAsJSON(table)
    const filteredValues = TypeSheet.filterTablesByParams(this.searchParameters, tableValues)
    return API.sendSuccessResponse(`Successfully read ${filteredValues.length} record${filteredValues.length > 1 || filteredValues.length === 0 ? 's' : ''} from '${this.tableName}' table`, filteredValues)
  }

  public createRecord () {
    //TODO: add type validation, add required validation
    if (!this.dataModel.tableExists()) return API.sendBadRequestErrorResponse(DataModelValidationErrorMessages.TABLE_DOES_NOT_EXIST)
    if (!this.dataModel.requiredFieldsPresent()) return API.sendBadRequestErrorResponse(DataModelValidationErrorMessages.MISSING_REQUIRED_FIELD)
    if (!this.dataModel.allTypesCoerced()) return API.sendBadRequestErrorResponse(DataModelValidationErrorMessages.TYPE_ERROR)
    
    const table = SheetsService.getTableByName(this.tableName);
    const rowToAdd = this.dataModel.processPayloadForInsert()
    table.appendRow(rowToAdd)
    return API.sendSuccessResponse(`Successfully created a record in the '${this.tableName}' table`, rowToAdd)
  }

  public updateRecord () {
    //TODO: add type validation, add required validation
    if (!this.dataModel.tableExists()) return API.sendBadRequestErrorResponse(DataModelValidationErrorMessages.TABLE_DOES_NOT_EXIST)
    const table = SheetsService.getTableByName(this.tableName)
    const recordLocation = SheetsService.getRecordLocationInTable(table, this.payload.id)
    
    if (recordLocation === -1) return API.sendNotFoundResponse(DataModelValidationErrorMessages.RECORD_NOT_FOUND)
    if (!this.dataModel.requiredFieldsPresent()) return API.sendBadRequestErrorResponse(DataModelValidationErrorMessages.MISSING_REQUIRED_FIELD)
    if (!this.dataModel.allTypesCoerced()) return API.sendBadRequestErrorResponse(DataModelValidationErrorMessages.TYPE_ERROR)
    
    const rowToUpdate = this.dataModel.processPayloadForUpdate()
    table.getRange(recordLocation, 1, 1, rowToUpdate.length).setValues([rowToUpdate])
    return API.sendSuccessResponse(`Successfully updated record with the id ${this.payload.id} in ${this.tableName} table`, this.payload)
  }

  public deleteRecord () {
    if (!this.dataModel.tableExists()) return API.sendBadRequestErrorResponse(DataModelValidationErrorMessages.TABLE_DOES_NOT_EXIST)
    const table = SheetsService.getTableByName(this.tableName)
    const recordLocation = SheetsService.getRecordLocationInTable(table, this.payload.id)
    if (recordLocation === -1) return API.sendNotFoundResponse(DataModelValidationErrorMessages.RECORD_NOT_FOUND)

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

enum DataModelValidationErrorMessages {
  TABLE_DOES_NOT_EXIST = `The specified table doesn't exist in your data model. Add it to perform create, update, and delete operations.`,
  RECORD_NOT_FOUND = `A record with the specified id cannot be found in specified table`,
  MISSING_REQUIRED_FIELD = `The payload is missing one or more required fields`,
  TYPE_ERROR = `There was an error converting one or more fields to the type specified by the data model`
}