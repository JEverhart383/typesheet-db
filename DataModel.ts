var DataModel = {
  setMasterProps: function (jsonMasterProps) {
    try {
      const props = PropertiesService.getDocumentProperties();
      props.setProperty('RESTfulSheets::MasterProps', JSON.stringify(jsonMasterProps)); 
    } catch (err) {
      Logger.log(err)
    }
  },
  getMasterPropsAsJSON: function () {
    const props = PropertiesService.getDocumentProperties()
    const returnedProps = props.getProperty('RESTfulSheets::MasterProps')
    Logger.log(returnedProps)
    return JSON.parse(returnedProps)
  },
  updateMasterPropsAndSave: function (tableDef) {
    const masterProps = this.getMasterPropsAsJSON(); 
    var tableName = tableDef.name; 
    masterProps.tables[tableName] = tableDef; 
    this.setMasterProps(masterProps); 
    return this.getMasterPropsAsJSON(); 
  },
  deleteTableFromMasterProps: function (tableName) {
    const masterProps = this.getMasterPropsAsJSON(); 
    delete masterProps.tables[tableName]; 
    this.setMasterProps(masterProps); 
    return this.getMasterPropsAsJSON(); 
  },
  getTableDefinitionFromMasterProps: function (tableName) {
    var masterProps = this.getMasterPropsAsJSON()
    var tableDef = masterProps.tables[tableName]
    return tableDef
  }

}
