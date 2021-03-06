import HTTPController from "./controllers/HTTPController";

export default class API {
  static processRequest(method:string, event ) {
     const lock = LockService.getScriptLock()
     lock.waitLock(30000)
     const httpController = new HTTPController(method, event)
     lock.releaseLock()
     return httpController.processHTTPRequest()
  }
  static sendResponseAsJSON (apiResult: APIResult): GoogleAppsScript.Content.TextOutput {
    return ContentService.createTextOutput(JSON.stringify(apiResult)).setMimeType(ContentService.MimeType.JSON)
  }
  static sendResponseAsHTML (fileLocation:string = 'ui/web-app/index') : GoogleAppsScript.HTML.HtmlOutput {
    return HtmlService.createTemplateFromFile(fileLocation).evaluate();
  }
  static createResultObject(success: boolean, statusCode: number, message: string, data:any = null ): APIResult {
    return {
      success,
      statusCode,
      message,
      data
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