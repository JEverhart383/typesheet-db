import HTTPController from "./controllers/HTTPController";

export default class API {
  static processRequest(method:string, event ) {
     const lock = LockService.getScriptLock()
     lock.waitLock(30000)
     const httpController = new HTTPController(method, event)
     return httpController.processHTTPRequest()
     lock.releaseLock();
  }
  static sendResponseAsJSON (result): GoogleAppsScript.Content.TextOutput {
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON)
  }
  static sendResponseAsHTML (fileLocation:string = 'docs') : GoogleAppsScript.HTML.HtmlOutput {
    return HtmlService.createTemplateFromFile(fileLocation).evaluate();
  }
  static createResultObject(success: boolean, status: number, message: string, data:any = null ): APIResult {
    return {
      success: success, 
      statusCode: status, 
      message: message, 
      data: data
    };  
  }
  static sendSuccessResponse (message:string, data = []) {
    return API.sendResponseAsJSON(API.createResultObject(true, 200, message, data))
  }
  static sendInternalErrorResponse(message:string) {
    return API.sendResponseAsJSON(API.createResultObject(false, 500, message))
  }
  static sendNotFoundResponse(message: string) {
    return API.sendResponseAsJSON(API.createResultObject(false, 404, message))
  }
  static sendBadRequestErrorResponse(message: string) {
    return API.sendResponseAsJSON(API.createResultObject(false, 400, message))
  }
}


interface APIResult {
  success: boolean;
  statusCode: number;
  message: string;
  data?: any;
}