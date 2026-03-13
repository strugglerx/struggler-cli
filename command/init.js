let { getConfig, getQiniuConfig } = require('../lib/config')
const chalk = require('chalk');
let { getJsonData, setJsonData, setSyncJsonData, directoryExists } = require('../lib/files')
let path = require('path')
const { formatDate } = require('../lib/date');
const { printMessage } = require('../lib/output');

function init(qiniuConfigPath, options){
    if (!directoryExists(qiniuConfigPath)){
        printMessage(options, chalk.red("七牛配置不存在 正在生成模版 请稍后在下面的文件里填写必要的信息!"))
        printMessage(options, chalk.blue(qiniuConfigPath))
        if (options.dryRun) {
            printMessage(options, `[dry-run] init would create template ${qiniuConfigPath}`)
            return
        }
        setSyncJsonData(qiniuConfigPath, getJsonData(path.resolve(__dirname, '../def/qiniu.json')))
    }

}

function main(options){
    let configPath = getConfig(options)
    let qiniuConfigPath = getQiniuConfig(options)
    init(qiniuConfigPath, options)
    const qiniuConfig = getJsonData(qiniuConfigPath)
    let domain = qiniuConfig.domain
    const versionPrefix = formatDate()
    let config = getJsonData(configPath)
    config.publicPath = `${qiniuConfig.path || ''}/${versionPrefix}/`
    config.base = `${domain || ''}${qiniuConfig.path || ''}/${versionPrefix}/`
    if (options.dryRun) {
        printMessage(options, `[dry-run] init would write ${configPath}`)
        printMessage(options, JSON.stringify(config, null, 2))
        return config
    }
    printMessage(options, JSON.stringify(config, null, 2))
    setJsonData(configPath, config)
    return config
}

module.exports = main
