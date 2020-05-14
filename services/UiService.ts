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
      const tableKey = sheet.toLowerCase()
      return {
        name: sheet,
        synced: dataModel.tables[tableKey] ? true : false,
        columns: dataModel.tables[tableKey] ? dataModel.tables[tableKey].columns : []
      }
    })

    return UiService.formatResponse({tables}, null, true, `✅ Loaded ${tables.length} table${tables.length === 0 || tables.length > 1 ? 's': '' }`)
  }

  addTableToSpreadsheet (newTable: any) {
    SheetsService.addTableToSpreadsheet(newTable);
    DataModel.updateMasterPropsAndSave(newTable);
    return UiService.formatResponse(newTable, 'home', false, `✅ Added table ${newTable.name}`)
  }

  deleteTable(tableName:string) {
    SheetsService.deleteTable(tableName);
    DataModel.deleteTableFromMasterProps(tableName);
    return UiService.formatResponse(null, 'home', false, `❌ Deleted table ${tableName}`)
  }

  setActiveTable(tableName:string) {
    SheetsService.setActiveTable(tableName)
    return UiService.formatResponse(null, null, false)
  }
}