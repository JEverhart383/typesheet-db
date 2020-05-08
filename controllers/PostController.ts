import API from '../API'
import TypeSheet from '../TypeSheet'
import DataModel from '../DataModel'
import Helper from '../Helper'

export default class PostController {
  private table:string;
  private data: any;
  private httpEvent: any;
  constructor(httpEvent: any, postData:any) {
    this.table = postData.table
    this.data = postData.data
    this.httpEvent = httpEvent
  }

   processRequest () {
    const tableDef = DataModel.getTableDefinitionFromMasterProps(this.table)
    //TODO: Deal with this later, but there is a philospical underpinning here that needs to be examined.
    //Namely, do we add items using the data model we can extract from the spreadsheet in a flexible way,
    //or do we enforce consistency to provide more secure data; right now, we're favoring consistency 
    if (!tableDef) {
      return API.sendBadRequestErrorResponse(`The specified table doesn't exist in your data model. Add it to perform create, update, and delete operations.`)
    }
    const table = TypeSheet.getTableByName(this.table);
    const rowToAdd = tableDef.columns.map(function(column) {
      var columnName = column.name.toLowerCase();
      if (columnName === 'id') {
        return Helper.createUUID();
      }
      return this.data[columnName] ? this.data[columnName] : '';
    })
    //append array to sheet
    table.appendRow(rowToAdd)
    //return success to caller
    
    return API.sendSuccessResponse(`Successfully created a record in the '${this.table}' table`, rowToAdd)
  }
}