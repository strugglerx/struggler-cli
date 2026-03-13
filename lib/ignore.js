const fs = require('fs');
const path = require('path');

const DEFAULT_IGNORE_FILE = '.strugglerignore';

function escapeRegExp(value) {
    return value.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
}

function patternToRegExp(pattern) {
    const normalizedPattern = pattern.replace(/\\/g, '/');
    const escaped = escapeRegExp(normalizedPattern)
        .replace(/\\\*\\\*/g, '.*')
        .replace(/\\\*/g, '[^/]*');
    return new RegExp(`(^|/)${escaped}$`);
}

function parseIgnoreFile(ignoreFilePath) {
    if (!fs.existsSync(ignoreFilePath)) {
        return [];
    }

    return fs.readFileSync(ignoreFilePath, 'utf8')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#'));
}

function normalizeExcludePatterns(value) {
    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return value.flatMap((item) => normalizeExcludePatterns(item));
    }

    return String(value)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

function createIgnoreMatcher(rootDir, options = {}) {
    const ignoreFilePath = path.resolve(process.cwd(), options.ignoreFile || DEFAULT_IGNORE_FILE);
    const patterns = [
        ...parseIgnoreFile(ignoreFilePath),
        ...normalizeExcludePatterns(options.exclude),
    ];
    const matchers = patterns.map((pattern) => patternToRegExp(pattern));

    return {
        patterns,
        shouldIgnore(filePath) {
            if (matchers.length === 0) {
                return false;
            }

            const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
            return matchers.some((matcher) => matcher.test(relativePath));
        },
    };
}

module.exports = {
    DEFAULT_IGNORE_FILE,
    normalizeExcludePatterns,
    createIgnoreMatcher,
};
