import API from '../API'
export default class HTTPContoller {
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
    if (this.httpMethod === 'GET') {
      if (this.httpEvent.queryString.length === 0) {
        return API.sendResponseAsHTML('docs')
      }
      return API.sendSuccessResponse('This was a successful GET request')
    }

    if (this.httpMethod === 'POST') {
      return API.sendSuccessResponse('This was a successful POST request')
    }
  }

  validateRequest():string[] {
    const errors = []
    if (this.httpMethod === 'GET') {
      if (this.httpEvent.queryString.length > 0 && !this.httpEvent.parameter.table) {
        errors.push(ValidationStateMessages.MISSING_TABLE_GET)
      }
    }

    if (this.httpMethod === 'POST') {
      if(!this.postData) {
        errors.push(ValidationStateMessages.MISSING_POST_BODY)
      } else {
        if (!this.postData.table) {
          errors.push(ValidationStateMessages.MISSING_TABLE_POST)
        }
        if (!this.postData.operation) {
          errors.push(ValidationStateMessages.MISSING_OPERATION)
        }
        if((this.postData.operation === 'update' || this.postData.operation === 'delete') && !this.postData.data.id) {
          errors.push(ValidationStateMessages.MISSING_ID)
        }
      }
    }
    return errors
  }
  
}
// This ENUM should cover all of the 400 bad request error messages
enum ValidationStateMessages {
  VALID_REQUEST = 'valid request',
  MISSING_TABLE_GET = 'Each GET request must specify a table parameter at minimum',
  MISSING_TABLE_POST = 'Each POST request must specify a table key:value property',
  MISSING_OPERATION = 'Each POST request must specify an operation key:value property: create, update, delete',
  MISSING_POST_BODY = 'Each POST request must have a vaild POST body in JSON',
  MISSING_ID = 'Each requests using the update or delete operations need to specify an id key:value property as a part of postBody.data'
}