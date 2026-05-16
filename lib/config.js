let path = require('path')
const { getJsonData } = require('./files');
const { resolveProfileConfigPath } = require('./profile');

const DEFAULT_QINIU_CONFIG = './command/qiniu.json';
const DEFAULT_META_DIR = './command';
const DEFAULT_CONFIG = './command/config.json';
const DEFAULT_CACHE = './command/upload-cache.json';

function resolveFromCwd(targetPath) {
    return path.resolve(process.cwd(), targetPath);
}

function getQiniuConfigPath(options = {}) {
    const profilePath = resolveProfileConfigPath(options);
    if (profilePath) {
        return profilePath;
    }
    return resolveFromCwd(options.config || DEFAULT_QINIU_CONFIG);
}

function resolveConfigDirOption(options = {}) {
    const value = options.configDir;
    if (value === true || value === '') {
        return DEFAULT_META_DIR;
    }
    if (typeof value === 'string') {
        return value;
    }
    return null;
}

/** config.json / upload-cache.json 所在目录；优先级：CLI --config-dir > qiniu.json configDir > 默认 ./command（与旧版一致，不随 -c 目录变化） */
function getMetaDir(options = {}) {
    const cliConfigDir = resolveConfigDirOption(options);
    if (cliConfigDir) {
        return resolveFromCwd(cliConfigDir);
    }

    const qiniuConfig = getJsonData(getQiniuConfigPath(options));
    if (qiniuConfig.configDir) {
        return resolveFromCwd(qiniuConfig.configDir);
    }

    return resolveFromCwd(DEFAULT_META_DIR);
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
