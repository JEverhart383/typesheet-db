// const TypeSheetDB =(function(){
//   function TypeSheetDB(url) {
//     this.url = url
//   }
//   TypeSheetDB.prototype.get = function(request) {
//     const table = request.table
//     const params = request.parameters
//     const queryString = `?table=${table}`
//     for (let [key, value] of Object.entries(params)){
//       queryString.concat(`&${key}=${value}`)
//     }
//     return new Promise(resolve, reject) {
//       fetch()
//     }
//   }
//   return TypeSheetDB
// }())