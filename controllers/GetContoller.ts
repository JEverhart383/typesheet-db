import TypeSheet from '../TypeSheet'
export default class GetController {
  private tableName: string = null
  private parameters: object = null
  constructor(event: any) {
    this.tableName = event.parameter.table
    this.parameters = event.parameter
  }

  processRequest() {
    const typeSheet = new TypeSheet({
      tableName: this.tableName,
      searchParameters: this.parameters
    })
    return typeSheet.getRecords()
  }
}