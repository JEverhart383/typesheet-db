import API from '../API'
export default class HTTPContoller {
  private method:string = null
  private httpEvent: any = null
  constructor(method:string, event: any) {
    this.method = method
    this.httpEvent = event
  }
  processHTTPRequest() {
    if (this.method === 'GET') {
      return API.sendSuccessResponse('This was a successful GET request')
    }

    if (this.method === 'POST') {
      return API.sendSuccessResponse('This was a successful POST request')
    }
  }

  validateRequest() {

  }
  
}
// This ENUM should cover all of the 400 bad request error messages
enum ValidationStateMessages {
  VALID_REQUEST = 'valid request',
  MISSING_TABLE_GET = 'Each GET request must specify a table parameter at minimum',
  MISSING_TABLE_POST = 'Each POST request must specify a table key:value property',
  MISSING_OPERATION = 'Each POST request must specify an operation key:value property: create, update, delete',
  MISSING_POST_BODY = 'Each POST request must have a vaild POST body in JSON'
}