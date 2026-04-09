const path = require('path');

const MIME_TYPES = {
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.cjs': 'application/javascript',
    '.css': 'text/css',
    '.html': 'text/html',
    '.htm': 'text/html',
    '.json': 'application/json',
    '.map': 'application/json',
    '.txt': 'text/plain',
    '.xml': 'application/xml',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.eot': 'application/vnd.ms-fontobject',
    '.wasm': 'application/wasm',
};

function loadMimeResolver() {
    try {
        const qiniuDir = path.dirname(require.resolve('qiniu'));
        const mimePath = require.resolve('mime', { paths: [qiniuDir] });
        return require(mimePath);
    } catch (error) {
        return null;
    }
}

const mimeResolver = loadMimeResolver();

function resolveMimeType(filePath) {
    if (mimeResolver && typeof mimeResolver.getType === 'function') {
        const detected = mimeResolver.getType(filePath);
        if (detected) {
            return detected;
        }
    }

    const extension = path.extname(filePath).toLowerCase();
    return MIME_TYPES[extension] || null;
}

module.exports = {
    resolveMimeType,
};
