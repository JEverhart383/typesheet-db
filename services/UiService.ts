import DataModel from "../DataModel";

export default class UiService {
  private callable:string = null
  private data:any = null
  constructor (callable:string, data:any) {
    this.callable = callable
    this.data = data
  }
  delegate () {
    if (typeof this[this.callable] === 'function') {
      return this[this.callable](this.data)
    } else {
      throw new Error('The callable passed to UiService was not a function')
    }
  }

  getDataModel () {
    return DataModel.getMasterPropsAsJSON();
  }

  getPublicURL () {
    return ScriptApp.getService().getUrl(); 
  }
}