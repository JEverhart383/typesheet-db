import TypeSheet from '../TypeSheet'

export default class PutController {
  private tableName:string;
  private data: any;
  constructor(postData:any) {
    this.tableName = postData.table
    this.data = postData.data
  }

   processRequest () {
    const typeSheet = new TypeSheet({
      tableName: this.tableName,
      payload: this.data
    })
    return typeSheet.updateRecord()
  }
}