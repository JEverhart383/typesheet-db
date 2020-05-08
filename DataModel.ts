export default class DataModel {
  //make these all instance methods
  //we store the current model on instantiation 
  //add methods to help map the JSON data model to Spreadsheet arrays
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
    Logger.log(returnedProps)
    return returnedProps === null ? {tables:{}} : JSON.parse(returnedProps)
  }
  static updateMasterPropsAndSave(tableDef) {
    const masterProps = DataModel.getMasterPropsAsJSON(); 
    var tableName = tableDef.name; 
    masterProps.tables[tableName] = tableDef; 
    DataModel.setMasterProps(masterProps); 
    return DataModel.getMasterPropsAsJSON(); 
  }
  static deleteTableFromMasterProps(tableName) {
    const masterProps = DataModel.getMasterPropsAsJSON(); 
    delete masterProps.tables[tableName]; 
    DataModel.setMasterProps(masterProps); 
    return DataModel.getMasterPropsAsJSON(); 
  }
  static getTableDefinitionFromMasterProps(tableName) {
    var masterProps = DataModel.getMasterPropsAsJSON()
    var tableDef = masterProps.tables[tableName]
    return tableDef
  }

}
