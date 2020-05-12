import API from '../API'
import TypeSheet from '../TypeSheet'
import DataModel from '../DataModel';

export default class DeleteController {
  private table:string;
  private data: any;
  constructor(postData:any) {
    this.table = postData.table
    this.data = postData.data
  }

   processRequest () {
    const tableDef = DataModel.getTableDefinitionFromMasterProps(this.table);
    
    //TODO: Deal with this later, but there is a philospical underpinning here that needs to be examined.
    //Namely, do we add items using the data model we can extract from the spreadsheet in a flexible way,
    //or do we enforce consistency to provide more secure data; right now, we're favoring consistency 
    if (!tableDef) {
      return API.sendBadRequestErrorResponse(`The specified table doesn't exist in your data model. Add it to perform create, update, and delete operations.`)
    }
    const table = TypeSheet.getTableByName(this.table);
    const recordLocation = TypeSheet.getRecordLocationInTable(table, this.data.id);
    
    if (recordLocation === -1) {
      return API.sendNotFoundResponse(`A record with the id ${this.data.id} cannot be found in ${this.table} table`)
    }
    table.deleteRow(recordLocation)

    return API.sendSuccessResponse(`Successfully deleted record with the id  ${this.data.id} in ${this.table} table`, this.data)
  }
}