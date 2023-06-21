#! /usr/bin/env node
const { magentaBright } = require('chalk');
const figlet = require('figlet');
const clear = require('clear');
const { program } = require('commander')
const  command = require("./command")


// 清除命令行
clear();

// 输出Logo
console.log(magentaBright(figlet.textSync('struggler-cli', { horizontalLayout: 'full' })),'\n\n');



program
.name('struggler-cli')
.description('CLI to Upload vite packaged files to Qiniu Cloud OSS.')
.version('0.0.1')
.option('-c, --config <path>', 'Specify the path to upload configuration file.', './command/qiniu.json')
.option('-d, --dir <path>', 'Specify the dir to upload.', './dist')


program
.command('init')
.description('Create upload configuration for specified path.')
.action(()=>{command.init(program.opts())})

program
.command('upload')
.description('Upload files under the specified file to Qiniu Cloud.')
    .action(() => { command.upload(program.opts()) })

program
    .command('addVersion')
    .description('Package add version.')
    .action(() => { command.addVersion(program.opts()) })

program.parse()

