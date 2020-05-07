import API from './API'
import TypeSheet from './TypeSheet'


/********
Bootstrap Methods 

These methods are what essentially bootstrap the application each time the 
spreadsheet is opened. 
********/
function onOpen () {
  SpreadsheetApp.getUi()
    .createMenu('RESTful Sheets')
    .addItem('Edit Options', 'showOptionsSidebar')
    .addToUi();  
  
}

function showOptionsSidebar () {
  const html = HtmlService.createTemplateFromFile('options')
    .evaluate()
    .setTitle('RESTful Sheets Options')
    .setWidth(350)
  
  SpreadsheetApp.getUi()
   .showSidebar(html)
}

function showDocumentationPage () {
  return HtmlService.createTemplateFromFile('docs').evaluate();
}


function getPublicURL () {
  return ScriptApp.getService().getUrl(); 
}


/******
HTTP Method Handlers

This is the basis of the REST API and its guts
*******/

function doGet (e) {
  return API.processRequest('GET', e)
}

function doPost (e) {
  return API.processRequest('POST', e)
}

function processPostRequest (postData) {
  //TODO: Move this stuff to the validateRequest method of HTTP Controller
  if (!postData.table) {
    var result = API.createResultObject(false, 500, 'Each POST request must specify a table key:value property', null)
  } else if (!postData.operation) {
    var result = API.createResultObject(false, 500, 'Each POST request must specify an operation key:value property: create, update, delete', null)
  } else if (postData) {
   var result = routePostRequestOperation(postData)
  } else {
   var result = API.createResultObject(false, 500, 'Each POST request must have a vaild POST body in JSON', null)
  }
  
  return API.sendResultAsJSON(result);
}


function routePostRequestOperation (postData) {
  //TODO this should go in HTTPController.processHTTPRequest
  if (postData.operation) {
    switch (postData.operation.toLowerCase()) {
      case 'create':
        var result =  processCreateOperation(postData); 
        break;
      case 'update':
        var result =  processUpdateOperation(postData);
        break;
      case 'delete':
        var result =  processDeleteOperation(postData);
        break;
    }
  } else {
    var result = API.createResultObject(false, 500, 'Each POST request must have a vaild operation type: create, update, delete', postData)
  } 
  
  return result; 
}

function processCreateOperation (postData) {
  //TODO: This should go in PostController.ts
  //get table definition from master props
  var tableName = postData.table;
  var tableDef = DataModel.getTableDefinitionFromMasterProps(tableName)

  var recordToAdd = postData.record;
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
  
  return API.createResultObject(true, 200, 'Created a resource in ' + postData.table + ' table', rowToAdd); 

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
  var recordLocation = getRecordLocationInTable(table, recordId);
  
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
  var recordLocation = getRecordLocationInTable(table, recordId);
  
  if (recordLocation === false) {
    return API.createResultObject(false, 500, 'A record with the id  '+ recordId + ' cannot be found in ' + postData.table + ' table');
  }
  table.deleteRow(recordLocation)
  return API.createResultObject(true, 200, 'Successfully deleted record with the id  '+ recordId + ' in ' + postData.table + ' table', postData);
}

/********
Data Model Methods

These methods work with the Apps Script PropertiesService 
to perform CRUD operations on the underlying data model of the various 
sheets. When querying the API, it uses the data models defined here to process
requests


The basic data model will look something like this: 

"tables": {
"tableName": {
   "name": "tableName"
   "autoIncrementId": true/false
   // If true, the first column is automatically created as and auto incrementing ID column
   // and added to the columns array below 
   "columns": [
     {
      "name": "columnName"
      "type": "string, int, float
      "autoIncrement": true
     }
   ]
  }
}

********/

function getDataModel () {
  return DataModel.getMasterPropsAsJSON();
}

/*********
UI Helper Methods

All of these methods create some sort of change in the UI
through calls from client-side scripts. Mostly, they are ways of manipulating
spreadsheet or individual sheets
**********/
function setActiveTable (tableName) {
  const table = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tableName)
  SpreadsheetApp.setActiveSheet(table)
}

function addTableToSpreadsheet (newTable) {
  const table = SpreadsheetApp.getActiveSpreadsheet().insertSheet(newTable.name)
  
    var idColumn = {
      'name': 'ID',
      'type': 'String'
    }
  newTable.columns.unshift(idColumn); 
  
  const row = newTable.columns.map(function(column) {
    return column.name + '::' + column.type
  })
 
  table.appendRow(row)
  
  //update data model with new table
  DataModel.updateMasterPropsAndSave(newTable);
  
  return 'Successfully added ' + table;
}

function deleteTable (tableName) {

  const table = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tableName)
  SpreadsheetApp.getActiveSpreadsheet().deleteSheet(table)
  
  // Remove from data model
  DataModel.deleteTableFromMasterProps(tableName); 
  
  return 'Successfully deleted ' + tableName;

}


/********
SS CRUD Methods

These methods perform basic CRUD operations on the various sheets
in the spreadsheet. Typically, they interoperate with changes to the underlying data 
model methods. These are generelly either called directly from client-side scripts for Read operations
or called from coordination methods. In most cases, if there is a deleteTableFromSpreadsheet there will be a corresponding 
deleteTableFromModel method
********/

/*
* @return mappedTables: An array of table names
**/
function getAllTables () {

  try {
  const tables = SpreadsheetApp.getActiveSpreadsheet().getSheets()
  Logger.log(tables)
  const mappedTables = tables.map(function(sheet){ return sheet.getName()})
  Logger.log(mappedTables)
  return mappedTables
  } catch (err) {
    Logger.log(err)
  }
}


/*
* @param table : A Google Sheet object for a particular sheet
* @param id: The UUID of a record in a Google Sheet
* @return Either the row location of the record as a positive INT, or false if the records isn't found
**/
function getRecordLocationInTable (table, id) {
  var lastRow = table.getLastRow();
  var idValues = table.getRange(1, 1, lastRow).getValues().map(function(cell){ return cell[0]});
  Logger.log(idValues);
  var recordLocation = idValues.indexOf(id)
  if (recordLocation === -1) {
    return false;
  }
  return recordLocation + 1;
}


