import API from '../API'
import SheetsService from '../services/SheetsService'
import DataModel from '../DataModel'
import TypeSheet from '../TypeSheet'
export default class GetController {
  private table: string = null
  private parameters: any = null
  constructor(event: any) {
    this.table = event.parameter.table
    this.parameters = event.parameter
  }

  processRequest() {
    // TODO: All of this should be refactored into TypeSheet class, and processRequest should just
    // call one method on TypeSheet, which calls both SheetsService and DataModel
    if (this.table === 'dataModel') {
      return API.sendSuccessResponse(`Returned data model`, DataModel.getMasterPropsAsJSON())
    }
    //TODO: think about this pattern, new TypeSheet(table)
    //const items = TypeSheet.getTypes(parameters)
    var table = SheetsService.getTableByName(this.table); 
    var tableValues = TypeSheet.getTableValuesAsJSON(table);
    var filteredValues = TypeSheet.filterTablesByParams(this.parameters, tableValues);
    return API.sendSuccessResponse(`Successfully read ${filteredValues.length} record${filteredValues.length > 1 || filteredValues.length === 0 ? 's' : ''} from '${this.table}' table`, filteredValues)
  }
}