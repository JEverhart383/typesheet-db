import API from '../API'
import SheetsService from '../services/SheetsService'
import DataModel from '../DataModel'
import TypeSheet from '../TypeSheet'
export default class GetController {
  private table: string = null
  private parameters: any = null
  constructor(event: any) {
    this.table = event.parameter.table
    this.parameters = event.parameter
  }

  processRequest() {
    const typeSheet = new TypeSheet(this.table, this.parameters)
    return typeSheet.getRecords()
  }
}