let { getConfig } = require('./config')
let { getJsonData } = require('./files')

//七牛文件上传前缀，使用时间戳作为文件上传前缀
function formatDate(date) {
    date  = date || new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes()

    return `${year}${month < 10 ? `0${month}` : month}${day < 10 ? `0${day}` : day}${hours < 10 ? `0${hours}` : hours}${minutes < 10 ? `0${minutes}` : minutes}`
}



module.exports = {
    prefix: (options)=>{
        const { publicPath } = getJsonData(getConfig(options))
        return publicPath
    }

}