const fs = require('fs');
const crypto = require('crypto');
const { getJsonData, setSyncJsonData } = require('./files');

function computeFileMd5(filePath) {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
}

function readCache(cachePath) {
    return getJsonData(cachePath);
}

function writeCache(cachePath, cache) {
    setSyncJsonData(cachePath, cache);
}

function isCacheHit(cache, relativeKey, localMd5) {
    const entry = cache[relativeKey];
    return entry && entry.localMd5 === localMd5;
}

function updateCacheEntry(cache, relativeKey, localMd5, qiniuHash) {
    cache[relativeKey] = {
        localMd5,
        qiniuHash,
        uploadedAt: new Date().toISOString(),
    };
}

module.exports = {
    computeFileMd5,
    readCache,
    writeCache,
    isCacheHit,
    updateCacheEntry,
};
