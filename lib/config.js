let path = require('path')

const DEFAULT_QINIU_CONFIG = './command/qiniu.json';
const DEFAULT_CONFIG = './command/config.json';
const DEFAULT_CACHE = './command/upload-cache.json';

function resolveFromCwd(targetPath) {
    return path.resolve(process.cwd(), targetPath);
}

function getQiniuConfigPath(options = {}) {
    return resolveFromCwd(options.config || DEFAULT_QINIU_CONFIG);
}

function getConfigPath(options = {}) {
    if (!options.config) {
        return resolveFromCwd(DEFAULT_CONFIG);
    }

    const qiniuConfigPath = getQiniuConfigPath(options);
    return path.join(path.dirname(qiniuConfigPath), 'config.json');
}

function getCachePath(options = {}) {
    if (!options.config) {
        return resolveFromCwd(DEFAULT_CACHE);
    }

    const qiniuConfigPath = getQiniuConfigPath(options);
    return path.join(path.dirname(qiniuConfigPath), 'upload-cache.json');
}

module.exports = {
    getConfig: (options) => {
        return getConfigPath(options)
    },
    getQiniuConfig: (options) => {
        return getQiniuConfigPath(options)
    },
    getCachePath: (options) => {
        return getCachePath(options)
    },
    getDir: (options) => {
        return resolveFromCwd(options.dir || './dist')
    },
};
