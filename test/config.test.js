const test = require('node:test');
const assert = require('node:assert/strict');
const { getConfig, getQiniuConfig, getDir } = require('../lib/config');
const { normalizeConcurrency, toRemoteKey } = require('../lib/deploy');
const { normalizeExcludePatterns } = require('../lib/ignore');

test('config helpers resolve qiniu and derived config paths together', () => {
    const options = {
        config: './test/command/qiniu.json',
        dir: './test/dist3',
    };

    assert.equal(
        getQiniuConfig(options),
        `${process.cwd()}/test/command/qiniu.json`
    );
    assert.equal(
        getConfig(options),
        `${process.cwd()}/test/command/config.json`
    );
    assert.equal(
        getDir(options),
        `${process.cwd()}/test/dist3`
    );
});

test('config-dir overrides default meta directory', () => {
    const options = {
        config: './test/command/qiniu.json',
        configDir: './test/meta',
    };

    assert.equal(
        getConfig(options),
        `${process.cwd()}/test/meta/config.json`
    );
});

test('config-dir flag without path defaults to ./command', () => {
    const options = {
        config: './test/command/qiniu.json',
        configDir: true,
    };

    assert.equal(
        getConfig(options),
        `${process.cwd()}/command/config.json`
    );
});

test('deploy helpers normalize concurrency and build remote keys', () => {
    assert.equal(normalizeConcurrency('0'), 5);
    assert.equal(normalizeConcurrency('3'), 3);
    assert.equal(
        toRemoteKey('release/20260313/', '/tmp/dist', '/tmp/dist/assets/app.js'),
        'release/20260313/assets/app.js'
    );
});

test('ignore helpers split exclude patterns consistently', () => {
    assert.deepEqual(
        normalizeExcludePatterns('*.map,.DS_Store, dist/**'),
        ['*.map', '.DS_Store', 'dist/**']
    );
});
