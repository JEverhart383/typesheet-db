import API from '../API'
import TypeSheet from '../TypeSheet'
export default class GetController {
  private table: string = null
  private parameters: any = null
  constructor(event: any) {
    this.table = event.parameter.table
    this.parameters = event.parameter
  }

  processRequest() {
    var table = TypeSheet.getTableByName(this.table); 
    var tableValues = TypeSheet.getTableValuesAsJSON(table);
    var filteredValues = TypeSheet.filterTablesByParams(this.parameters, tableValues);
    return API.sendSuccessResponse(`Successfully read ${filteredValues.length} record from '${this.table}' table`, filteredValues)
  }
}