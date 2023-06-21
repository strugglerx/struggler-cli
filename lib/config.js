let fs = require('fs');
let path = require('path')


module.exports = {
    getConfig: (options) => {
        return path.resolve(process.cwd(), './command/config.json')
    },
    getQiniuConfig: (options) => {
        return path.resolve(process.cwd(), options.config || './command/qiniu.json')
    },
    getDir: (options) => {
        return path.resolve(process.cwd(), options.dir || './dist')
    },
};
