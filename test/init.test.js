const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const init = require('../command/init');

function createTempWorkspace() {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'struggler-cli-init-'));
}

test('init dry-run does not create files and returns generated config', async () => {
    const previousCwd = process.cwd();
    const workspace = createTempWorkspace();

    try {
        process.chdir(workspace);

        const config = await init({
            config: './command/qiniu.json',
            dryRun: true,
        });

        assert.equal(fs.existsSync(path.join(workspace, 'command/qiniu.json')), false);
        assert.match(config.publicPath, /^\/\d{12}\/$/);
        assert.match(config.base, /^\/\d{12}\/$/);
    } finally {
        process.chdir(previousCwd);
        fs.rmSync(workspace, { recursive: true, force: true });
    }
});

test('init writes qiniu template and deploy config when not in dry-run mode', async () => {
    const previousCwd = process.cwd();
    const workspace = createTempWorkspace();

    try {
        process.chdir(workspace);

        const config = await init({
            config: './command/qiniu.json',
        });

        assert.equal(fs.existsSync(path.join(workspace, 'command/qiniu.json')), true);
        assert.equal(fs.existsSync(path.join(workspace, 'command/config.json')), true);
        assert.equal(config.publicPath.endsWith('/'), true);
        assert.equal(config.base.endsWith('/'), true);
    } finally {
        process.chdir(previousCwd);
        fs.rmSync(workspace, { recursive: true, force: true });
    }
});
