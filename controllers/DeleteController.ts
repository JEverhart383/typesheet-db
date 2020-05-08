import API from '../API'
import TypeSheet from '../TypeSheet'

export default class DeleteController {
  private table:string;
  private data: any;
  private httpEvent: any;
  constructor(httpEvent: any, postData:any) {
    this.table = postData.table
    this.data = postData.data
    this.httpEvent = httpEvent
  }

   processRequest () {
    //TODO: This should go in PostController.ts
    //get table definition from master props
    var tableName = this.table;
    var table = TypeSheet.getTableByName(tableName);
    var recordToDelete = this.data;
    var recordId = recordToDelete.id; 
    var recordLocation = TypeSheet.getRecordLocationInTable(table, recordId);
    
    if (recordLocation === false) {
      return API.sendNotFoundResponse('A record with the id  '+ recordId + ' cannot be found in ' + this.table + ' table')
    }
    table.deleteRow(recordLocation)

    return API.sendSuccessResponse('Successfully deleted record with the id  '+ recordId + ' in ' + this.table + ' table', this.data)
  }
}