const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const upload = require('../command/upload');
const deploy = require('../command/deploy');

function createWorkspace() {
    const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'struggler-cli-upload-'));
    fs.mkdirSync(path.join(workspace, 'command'), { recursive: true });
    fs.mkdirSync(path.join(workspace, 'dist/assets'), { recursive: true });

    fs.writeFileSync(path.join(workspace, 'command/qiniu.json'), JSON.stringify({
        path: 'demo-app',
        domain: 'https://cdn.example.com/',
    }, null, 2));
    fs.writeFileSync(path.join(workspace, 'command/config.json'), JSON.stringify({
        publicPath: 'demo-app/202603131600/',
        base: 'https://cdn.example.com/demo-app/202603131600/',
    }, null, 2));
    fs.writeFileSync(path.join(workspace, 'dist/index.html'), '<html></html>');
    fs.writeFileSync(path.join(workspace, 'dist/assets/app.js'), 'console.log("ok")');
    fs.writeFileSync(path.join(workspace, 'dist/assets/app.js.gz'), 'gzip');
    fs.writeFileSync(path.join(workspace, 'dist/.DS_Store'), 'noise');
    fs.writeFileSync(path.join(workspace, '.strugglerignore'), '.DS_Store\n');

    return workspace;
}

test('upload dry-run plans files, skips gz assets, and returns summary', async () => {
    const previousCwd = process.cwd();
    const workspace = createWorkspace();

    try {
        process.chdir(workspace);

        const summary = await upload({
            config: './command/qiniu.json',
            dir: './dist',
            dryRun: true,
            concurrency: '2',
        });

        assert.equal(summary.action, 'upload');
        assert.equal(summary.dryRun, true);
        assert.equal(summary.total, 2);
        assert.equal(summary.failedCount, 0);
        assert.deepEqual(
            summary.succeeded.map((item) => item.key),
            [
                'demo-app/202603131600/assets/app.js',
                'demo-app/202603131600/index.html',
            ]
        );
        assert.equal(summary.excludedPatterns.includes('.DS_Store'), true);
    } finally {
        process.chdir(previousCwd);
        fs.rmSync(workspace, { recursive: true, force: true });
    }
});

test('upload dry-run can write a manifest file', async () => {
    const previousCwd = process.cwd();
    const workspace = createWorkspace();

    try {
        process.chdir(workspace);

        const summary = await upload({
            config: './command/qiniu.json',
            dir: './dist',
            dryRun: true,
            manifest: './artifacts/upload.json',
        });

        const manifestPath = path.resolve(workspace, 'artifacts/upload.json');
        assert.equal(fs.existsSync(manifestPath), true);
        assert.equal(summary.manifestPath, fs.realpathSync(manifestPath));

        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        assert.equal(manifest.action, 'upload');
        assert.equal(manifest.total, 2);
    } finally {
        process.chdir(previousCwd);
        fs.rmSync(workspace, { recursive: true, force: true });
    }
});

test('deploy dry-run supports skip-refresh and json-friendly summary data', async () => {
    const previousCwd = process.cwd();
    const workspace = createWorkspace();

    try {
        process.chdir(workspace);

        const summary = await deploy({
            config: './command/qiniu.json',
            dir: './dist',
            dryRun: true,
            json: true,
            skipRefresh: true,
        });

        assert.equal(summary.action, 'deploy');
        assert.equal(summary.upload.total, 2);
        assert.equal(summary.refresh.skipped, true);
        assert.equal(summary.excludedPatterns.includes('.DS_Store'), true);
    } finally {
        process.chdir(previousCwd);
        fs.rmSync(workspace, { recursive: true, force: true });
    }
});
