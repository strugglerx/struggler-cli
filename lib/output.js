const fs = require('fs');
const path = require('path');

function shouldUseJson(options = {}) {
    return Boolean(options.json);
}

function printMessage(options, message) {
    if (!shouldUseJson(options)) {
        console.log(message);
    }
}

function printError(options, message) {
    if (!shouldUseJson(options)) {
        console.error(message);
    }
}

function printJson(payload) {
    console.log(JSON.stringify(payload, null, 2));
}

function writeManifest(filePath, payload) {
    const resolvedPath = path.resolve(process.cwd(), filePath);
    fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
    fs.writeFileSync(resolvedPath, JSON.stringify(payload, null, 2));
    return resolvedPath;
}

module.exports = {
    shouldUseJson,
    printMessage,
    printError,
    printJson,
    writeManifest,
};
