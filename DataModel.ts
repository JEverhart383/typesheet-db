export default class DataModel {
  //make these all instance methods
  //we store the current model on instantiation
  //add methods to help map the JSON data model to Spreadsheet arrays
  //add methods to typecast based on data model

  //static validateRequest (data)
  // this method will check all required fields and do some basic type coercion, pushing errors to an error array
  // if there are errors, join and send a bad request response
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
