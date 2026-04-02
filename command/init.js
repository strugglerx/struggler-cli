let { getConfig, getQiniuConfig } = require('../lib/config')
const chalk = require('chalk');
let { getJsonData, setJsonData, setSyncJsonData, directoryExists } = require('../lib/files')
let path = require('path')
const { formatDate } = require('../lib/date');
const { printMessage } = require('../lib/output');
const { getLocale } = require('../lib/i18n');

function init(qiniuConfigPath, options){
    const { messages } = getLocale(options && options.lang);
    if (!directoryExists(qiniuConfigPath)){
        printMessage(options, chalk.yellow(`  ⚠  ${messages.initTemplateCreated}`));
        printMessage(options, `     ${chalk.dim(qiniuConfigPath)}`);
        if (options.dryRun) {
            printMessage(options, chalk.dim(messages.initDryRunCreate(qiniuConfigPath)));
            return
        }
        setSyncJsonData(qiniuConfigPath, getJsonData(path.resolve(__dirname, '../def/qiniu.json')))
    }
}

function main(options){
    const { messages } = getLocale(options && options.lang);
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
        printMessage(options, chalk.dim(messages.initDryRunWrite(configPath)));
        printMessage(options, chalk.dim(JSON.stringify(config, null, 2)));
        return config
    }
    printMessage(options, `  ${chalk.green('✓')}  ${messages.initConfigUpdated}`);
    printMessage(options, `     ${chalk.dim(configPath)}`);
    setJsonData(configPath, config)
    return config
}

module.exports = main
