import API from '../API'
import TypeSheet from '../TypeSheet'
import DataModel from '../DataModel';

export default class PutController {
  private table:string;
  private data: any;
  private httpEvent: any;
  constructor(httpEvent: any, postData:any) {
    this.table = postData.table
    this.data = postData.data
    this.httpEvent = httpEvent
  }

   processRequest () {
    var tableName = this.table;
    var tableDef = DataModel.getTableDefinitionFromMasterProps(tableName);
    var table = TypeSheet.getTableByName(tableName);
    var recordToUpdate = this.data;
    var recordId = recordToUpdate.id; 
    var recordLocation = TypeSheet.getRecordLocationInTable(table, recordId);
    
    if (recordLocation === false) {
      return API.sendNotFoundResponse('A record with the id  '+ recordId + ' cannot be found in ' + this.table + ' table')
    }
    
    var rowToUpdate = tableDef.columns.map(function(column) {
      var lowercaseColumnName = column.name.toLowerCase();
      var dataToReturn = recordToUpdate[lowercaseColumnName] ? recordToUpdate[lowercaseColumnName] : '';
      return dataToReturn;
    })
    
    table.getRange(recordLocation, 1, 1, rowToUpdate.length).setValues([rowToUpdate]);
    
    return API.sendSuccessResponse('Successfully updated record with the id '+ recordId + ' in ' + this.table + ' table', this.data)
  
  }
}