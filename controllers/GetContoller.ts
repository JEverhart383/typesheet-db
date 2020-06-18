import TypeSheet from '../TypeSheet'
export default class GetController {
  private tableName: string = null
  private searchParameters: object = null
  constructor(event: any) {
    this.tableName = event.parameter.table
    const params = event.parameter
    //delete the table prop so we have a list of only filter values
    delete params['table']
    this.searchParameters = params
  }

  processRequest() {
    const typeSheet = new TypeSheet({
      tableName: this.tableName,
      searchParameters: this.searchParameters
    })
    return typeSheet.getRecords()
  }
}