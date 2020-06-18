import API from '../API'
import SheetsService from '../services/SheetsService'
import DataModel from '../DataModel';

export default class DeleteController {
  private table:string;
  private data: any;
  constructor(postData:any) {
    this.table = postData.table
    this.data = postData.data
  }

   processRequest () {
    // TODO: All of this should be refactored into TypeSheet class, and processRequest should just
    // call one method on TypeSheet, which calls both SheetsService and DataModel
    const tableDef = DataModel.getTableDefinitionFromMasterProps(this.table);
    
    //TODO: Deal with this later, but there is a philospical underpinning here that needs to be examined.
    //Namely, do we add items using the data model we can extract from the spreadsheet in a flexible way,
    //or do we enforce consistency to provide more secure data; right now, we're favoring consistency 
    if (!tableDef) {
      return API.sendBadRequestErrorResponse(`The specified table doesn't exist in your data model. Add it to perform create, update, and delete operations.`)
    }
    const table = SheetsService.getTableByName(this.table);
    const recordLocation = SheetsService.getRecordLocationInTable(table, this.data.id);
    
    if (recordLocation === -1) {
      return API.sendNotFoundResponse(`A record with the id ${this.data.id} cannot be found in ${this.table} table`)
    }
    table.deleteRow(recordLocation)

    return API.sendSuccessResponse(`Successfully deleted record with the id  ${this.data.id} in ${this.table} table`, this.data)
  }
}