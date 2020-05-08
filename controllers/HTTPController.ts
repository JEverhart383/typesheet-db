import API from '../API'
import GetController from './GetContoller'
import PostController from './PostController'
import DeleteController from './DeleteController'
import TypeSheet from '../TypeSheet'
import DataModel from '../DataModel'

export default class HTTPController {
  private httpMethod:string = null
  private httpEvent: any = null
  private postData: any = null
  constructor(httpMethod:string, event: any) {
    this.httpMethod = httpMethod
    this.httpEvent = event
    if (this.httpMethod === 'POST') {
      this.postData = JSON.parse(this.httpEvent.postData ? this.httpEvent.postData.contents : null)
    }
  }
  processHTTPRequest() {
    const errors = this.validateRequest()
    if (errors.length > 0) {
      return API.sendBadRequestErrorResponse(errors.join(', '))
    }

    try {
      if (this.httpMethod === 'GET') {
        if (this.httpEvent.queryString.length === 0) {
          return API.sendResponseAsHTML('docs')
        }
        const getController = new GetController(this.httpEvent)
        return getController.processRequest()
      }

      if (this.httpMethod === 'POST') {
        let response = null;
        switch (this.postData.operation.toLowerCase()) {
          case 'create':
            const postController = new PostController(this.httpEvent, this.postData)
            response = postController.processRequest()
            break;
          case 'update':
            response =  processUpdateOperation(this.postData);
            break;
          case 'delete':
            const deleteController = new DeleteController(this.httpEvent, this.postData)
            response =  deleteController.processRequest()
            break;
        }
        return response;
      }
    } catch (error) {
      return API.sendInternalErrorResponse(error.message)
    }
  }

  validateRequest():string[] {
    const errors = []
    if (this.httpMethod === 'GET') {
      if (this.httpEvent.queryString.length > 0 && !this.httpEvent.parameter.table) {
        errors.push(ValidationErrorMessages.MISSING_TABLE_GET)
      }
    }

    if (this.httpMethod === 'POST') {
      if(!this.postData) {
        errors.push(ValidationErrorMessages.MISSING_POST_BODY)
      } else {
        if (!this.postData.table) {
          errors.push(ValidationErrorMessages.MISSING_TABLE_POST)
        }
        if (!this.postData.operation) {
          errors.push(ValidationErrorMessages.MISSING_OPERATION)
        }
        if((this.postData.operation === 'update' || this.postData.operation === 'delete') && !this.postData.data.id) {
          errors.push(ValidationErrorMessages.MISSING_ID)
        }
      }
    }
    return errors
  }
  
}
// This ENUM should cover all of the 400 bad request error messages
enum ValidationErrorMessages {
  MISSING_TABLE_GET = 'Each GET request must specify a table parameter at minimum',
  MISSING_TABLE_POST = 'Each POST request must specify a table key:value property',
  MISSING_OPERATION = 'Each POST request must specify an operation key:value property: create, update, delete',
  MISSING_POST_BODY = 'Each POST request must have a vaild POST body in JSON',
  MISSING_ID = 'Each requests using the update or delete operations need to specify an id key:value property as a part of postBody.data'
}

function processUpdateOperation (postData) {
  //TODO: This should go in PutController.ts
  //Think about moving some of this up to HTTPController.validateRequest
  var tableName = postData.table;
  var tableDef = DataModel.getTableDefinitionFromMasterProps(tableName);
  var table = TypeSheet.getTableByName(tableName);
  var recordToUpdate = postData.record;
  var recordId = recordToUpdate.id; 
  if (!recordId) {
    return API.createResultObject(false, 500, 'You must supply an id as a part of the record you wish to update');
  }
  var recordLocation = TypeSheet.getRecordLocationInTable(table, recordId);
  
  if (recordLocation === false) {
    return API.createResultObject(false, 404, 'A record with the id  '+ recordId + ' cannot be found in ' + postData.table + ' table');
  }
  
  var rowToUpdate = tableDef.columns.map(function(column) {
    var lowercaseColumnName = column.name.toLowerCase();
    var dataToReturn = recordToUpdate[lowercaseColumnName] ? recordToUpdate[lowercaseColumnName] : '';
    return dataToReturn;
  })
  
  table.getRange(recordLocation, 1, 1, rowToUpdate.length).setValues([rowToUpdate]);
  
  return API.createResultObject(true, 200, 'Successfully updated record with the id  '+ recordId + ' in ' + postData.table + ' table', postData);
}

function processDeleteOperation (postData) {
  //TODO: This should go in DeleteController.ts
  //Think about moving some of this up to HTTPController.validateRequest
  var tableName = postData.table;
  var table = TypeSheet.getTableByName(tableName);
  var recordToDelete = postData.record;
  var recordId = recordToDelete.id; 
  if (!recordId) {
    return API.createResultObject(false, 500, 'You must supply an id as a part of the record you wish to delete');
  }
  var recordLocation = TypeSheet.getRecordLocationInTable(table, recordId);
  
  if (recordLocation === false) {
    return API.createResultObject(false, 500, 'A record with the id  '+ recordId + ' cannot be found in ' + postData.table + ' table');
  }
  table.deleteRow(recordLocation)
  return API.createResultObject(true, 200, 'Successfully deleted record with the id  '+ recordId + ' in ' + postData.table + ' table', postData);
}