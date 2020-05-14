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
  return API.processRequest('POST', e)
}

function callUiService(callable: string, data: any) {
  const uiService = new UiService(callable, data)
  return uiService.delegate()
}

function getDataModel () {
  return DataModel.getMasterPropsAsJSON();
}

