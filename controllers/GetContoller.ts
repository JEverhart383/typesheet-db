import API from '../API'
import TypeSheet from '../TypeSheet'
import DataModel from '../DataModel'
export default class GetController {
  private table: string = null
  private parameters: any = null
  constructor(event: any) {
    this.table = event.parameter.table
    this.parameters = event.parameter
  }

  processRequest() {
    if (this.table === 'dataModel') {
      return API.sendSuccessResponse(`Returned data model`, DataModel.getMasterPropsAsJSON())
    }
    //TODO: think about this pattern, new TypeSheet(table)
    //const items = TypeSheet.getTypes(parameters)
    var table = TypeSheet.getTableByName(this.table); 
    var tableValues = TypeSheet.getTableValuesAsJSON(table);
    var filteredValues = TypeSheet.filterTablesByParams(this.parameters, tableValues);
    return API.sendSuccessResponse(`Successfully read ${filteredValues.length} record from '${this.table}' table`, filteredValues)
  }
}