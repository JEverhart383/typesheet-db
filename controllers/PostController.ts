import API from '../API'
import TypeSheet from '../TypeSheet'
import DataModel from '../DataModel'

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
    //TODO: This should go in PostController.ts
    //get table definition from master props
    var tableName = this.table;
    var tableDef = DataModel.getTableDefinitionFromMasterProps(tableName)
  
    var recordToAdd = this.data;
    //get reference to table
    var table = TypeSheet.getTableByName(tableName);
    //if autoincrement enabled, get last row and return previous id
    //TODO
    //create new array of data
    var rowToAdd = tableDef.columns.map(function(column) {
      var lowercaseColumnName = column.name.toLowerCase();
      if (lowercaseColumnName === 'id') {
        return Helper.createUUID();
      }
      var dataToReturn = recordToAdd[lowercaseColumnName] ? recordToAdd[lowercaseColumnName] : '';
      return dataToReturn;
    })
    //append array to sheet
    table.appendRow(rowToAdd)
    //return success to caller
    
    return API.sendSuccessResponse(`Successfully created a record in the '${this.table}' table`, rowToAdd)
  }
}