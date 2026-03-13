let { getConfig } = require('./config')
let { getJsonData } = require('./files')

module.exports = {
    prefix: (options)=>{
        const { publicPath } = getJsonData(getConfig(options))
        return publicPath || ''
    }

}
