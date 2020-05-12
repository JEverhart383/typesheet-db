import API from './API'
import TypeSheet from './TypeSheet'
import DataModel from './DataModel'
import UiService from './services/UiService';


/********
Bootstrap Methods 

These methods are what essentially bootstrap the application each time the 
spreadsheet is opened. 
********/
function onOpen () {
  SpreadsheetApp.getUi()
    .createMenu('TypeSheetDB')
    .addItem('Edit Data Model', 'showOptionsSidebar')
    .addToUi();  
  
}

function showOptionsSidebar () {
  const html = HtmlService.createTemplateFromFile('ui/modal/index')
    .evaluate()
    .setTitle('RESTful Sheets Options')
    .setWidth(750)
    .setHeight(800)
  
  SpreadsheetApp.getUi()
   .showModalDialog(html, 'Edit Data Model')
}


function getPublicURL () {
  return ScriptApp.getService().getUrl(); 
}


function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}


/******
HTTP Method Handlers

This is the basis of the REST API and its guts
*******/

function doGet (e) {
  return API.processRequest('GET', e)
}

function doPost (e) {
  Logger.log(e.postData)
  return API.processRequest('POST', e)
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

function callUiService(callable: string, data: any) {
  const uiService = new UiService(callable, data)
  return uiService.delegate()
}

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