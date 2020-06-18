export default class DataModel {

  //TODO: Deal with this later, but there is a philospical underpinning here that needs to be examined.
  //Namely, do we add items using the data model we can extract from the spreadsheet in a flexible way,
  //or do we enforce consistency to provide more secure data; right now, we're favoring consistency 

  //make these all instance methods
  //we store the current model on instantiation
  //add methods to help map the JSON data model to Spreadsheet arrays
  //add methods to typecast based on data model

  //static validateRequest (data)
  // this method will check all required fields and do some basic type coercion, pushing errors to an error array
  // if there are errors, join and send a bad request response

  //TODO: consider another class here, and maybe this is all in DataModel
  //createTable, updateTable, importTable, getTables, getTableByName
  private tableDefinition = null
  constructor(tableName) {
    this.tableDefinition = DataModel.getTableDefinitionFromMasterProps(tableName)
  }
  public tableExists():boolean {
    return this.tableDefinition ? true : false
  }

  public isValidInput(payload):boolean {
    return true;
  }
  public getTableDefinition() {
    return this.tableDefinition
  }
  static setMasterProps (jsonMasterProps) {
    try {
      const props = PropertiesService.getScriptProperties();
      props.setProperty('TypeSheetDB::MasterProps', JSON.stringify(jsonMasterProps)); 
    } catch (err) {
      Logger.log(err)
    }
  }
  static getMasterPropsAsJSON() {
    const props = PropertiesService.getScriptProperties()
    const returnedProps = props.getProperty('TypeSheetDB::MasterProps')
    return returnedProps === null ? {tables:{}} : JSON.parse(returnedProps)
  }
  static updateMasterPropsAndSave(tableDef) {
    const masterProps = DataModel.getMasterPropsAsJSON(); 
    const tableKey = tableDef.name.toLowerCase(); 
    masterProps.tables[tableKey] = tableDef; 
    DataModel.setMasterProps(masterProps); 
    return DataModel.getMasterPropsAsJSON(); 
  }
  static deleteTableFromMasterProps(tableName) {
    const masterProps = DataModel.getMasterPropsAsJSON(); 
    delete masterProps.tables[tableName.toLowerCase()]; 
    DataModel.setMasterProps(masterProps); 
    return DataModel.getMasterPropsAsJSON(); 
  }
  static getTableDefinitionFromMasterProps(tableName) {
    var masterProps = DataModel.getMasterPropsAsJSON()
    return masterProps.tables[tableName.toLowerCase()]
  }

}