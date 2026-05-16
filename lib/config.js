let path = require('path')
const { getJsonData } = require('./files');

const DEFAULT_QINIU_CONFIG = './command/qiniu.json';
const DEFAULT_META_DIR = './command';
const DEFAULT_CONFIG = './command/config.json';
const DEFAULT_CACHE = './command/upload-cache.json';

function resolveFromCwd(targetPath) {
    return path.resolve(process.cwd(), targetPath);
}

function getQiniuConfigPath(options = {}) {
    return resolveFromCwd(options.config || DEFAULT_QINIU_CONFIG);
}

/** config.json / upload-cache.json 所在目录；优先级：CLI --config-dir > qiniu.json configDir > 与 qiniu 同目录 > ./command */
function getMetaDir(options = {}) {
    if (options.configDir) {
        return resolveFromCwd(options.configDir);
    }

    const qiniuConfigPath = getQiniuConfigPath(options);
    const qiniuConfig = getJsonData(qiniuConfigPath);
    if (qiniuConfig.configDir) {
        return resolveFromCwd(qiniuConfig.configDir);
    }

    if (!options.config) {
        return resolveFromCwd(DEFAULT_META_DIR);
    }

    return path.dirname(qiniuConfigPath);
}

function getConfigPath(options = {}) {
    return path.join(getMetaDir(options), 'config.json');
}

function getCachePath(options = {}) {
    return path.join(getMetaDir(options), 'upload-cache.json');
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
    getMetaDir: (options) => {
        return getMetaDir(options)
    },
    getDir: (options) => {
        return resolveFromCwd(options.dir || './dist')
    },
};
