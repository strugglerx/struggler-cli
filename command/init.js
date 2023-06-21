let { getConfig, getQiniuConfig } = require('../lib/config')
const chalk = require('chalk');
let { getJsonData, setJsonData, setSyncJsonData, directoryExists } = require('../lib/files')
let path = require('path')

function formatDate(date) {
    date = date || new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes()

    return `${year}${month < 10 ? `0${month}` : month}${day < 10 ? `0${day}` : day}${hours < 10 ? `0${hours}` : hours}${minutes < 10 ? `0${minutes}` : minutes}`
}

function init(qiniuConfigPath, configPath){
    if (!directoryExists(qiniuConfigPath)){
        console.log(chalk.red("七牛配置不存在 正在生成模版 请稍后在下面的文件里填写必要的信息!"))
        console.log(chalk.blue(qiniuConfigPath))
        setSyncJsonData(qiniuConfigPath, getJsonData(path.resolve(__dirname, '../def/qiniu.json')))
    }

}

function main(options){
    let configPath = getConfig(options)
    let qiniuConfigPath = getQiniuConfig(options)
    init(qiniuConfigPath, configPath)
    const qiniuConfig = getJsonData(qiniuConfigPath)
    let domain = qiniuConfig.domain
    
    let config = getJsonData(configPath)
    config.publicPath = qiniuConfig.path + '/' + formatDate() + '/'
    config.base = domain + qiniuConfig.path + '/' + formatDate() + '/'
    //用packageData覆盖package.json内容
    console.log(config)
    setJsonData(configPath, config)
}

module.exports = main
