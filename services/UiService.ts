import DataModel from "../DataModel";
import SheetsService from "../services/SheetsService"

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

  static formatResponse (data: any, changeView: any, updateVue: boolean, message:string = '👍 All is good') {
    return {
      data,
      changeView,
      updateVue,
      message
    }
  }

  getDataModel () {
    return DataModel.getMasterPropsAsJSON();
  }

  getPublicURL () {
    return ScriptApp.getService().getUrl(); 
  }

  getAllTables () {
    const dataModel = DataModel.getMasterPropsAsJSON();
    const sheets = SheetsService.getAllTableNames();
    const tables = sheets.map(sheet => {
      return {
        name: sheet,
        synced: dataModel.tables[sheet] ? true : false,
        columns: dataModel.tables[sheet] ? dataModel.tables[sheet].columns : []
      }
    })

    return UiService.formatResponse({tables}, null, true)
  }
}