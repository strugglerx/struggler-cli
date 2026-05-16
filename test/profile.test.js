const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
    addProfile,
    importProfile,
    writeCurrentProfile,
    readCurrentProfile,
    listProfiles,
    resolveProfileConfigPath,
    isFileConfigPath,
} = require('../lib/profile');
const { getQiniuConfig } = require('../lib/config');

function makeWorkspace() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'struggler-cli-profile-'));
    return fs.realpathSync(dir);
}

function withTempProfileHome(workspace, run) {
    const prevHome = process.env.STRUGGLER_CLI_HOME;
    process.env.STRUGGLER_CLI_HOME = path.join(workspace, '.home');
    try {
        return run();
    } finally {
        if (prevHome === undefined) {
            delete process.env.STRUGGLER_CLI_HOME;
        } else {
            process.env.STRUGGLER_CLI_HOME = prevHome;
        }
    }
}

function samePath(a, b) {
    const norm = (p) => {
        try {
            return fs.realpathSync(p);
        } catch {
            const dir = path.dirname(p);
            const base = path.basename(p);
            try {
                return path.join(fs.realpathSync(dir), base);
            } catch {
                return path.resolve(p);
            }
        }
    };
    return norm(a) === norm(b);
}

test('profile paths work on any platform', () => {
    const workspace = makeWorkspace();
    const prev = process.cwd();
    process.chdir(workspace);
    try {
        withTempProfileHome(workspace, () => {
            addProfile('prod', path.resolve(__dirname, '../def/qiniu.json'));
            const profileFile = path.join(workspace, '.home', '.struggler-cli', 'profiles', 'prod.json');
            assert.equal(fs.existsSync(profileFile), true);
            assert.match(profileFile, /profiles[\\/]prod\.json$/);
        });
    } finally {
        process.chdir(prev);
    }
});

test('resolve current profile when -c is omitted', () => {
    const workspace = makeWorkspace();
    const prev = process.cwd();
    process.chdir(workspace);
    try {
        withTempProfileHome(workspace, () => {
            addProfile('staging', path.resolve(__dirname, '../def/qiniu.json'));
            writeCurrentProfile('staging');
            const resolved = resolveProfileConfigPath({});
            const expected = path.join(workspace, '.home', '.struggler-cli', 'profiles', 'staging.json');
            assert.equal(samePath(resolved, expected), true);
        });
    } finally {
        process.chdir(prev);
    }
});

test('-c prod resolves profile name; -c with path resolves file', () => {
    const workspace = makeWorkspace();
    const prev = process.cwd();
    process.chdir(workspace);
    try {
        withTempProfileHome(workspace, () => {
            importProfile('prod', path.resolve(__dirname, '../def/qiniu.json'));
            const byName = resolveProfileConfigPath({ config: 'prod' });
            assert.equal(
                samePath(byName, path.join(workspace, '.home', '.struggler-cli', 'profiles', 'prod.json')),
                true
            );

            const legacy = path.join(workspace, 'command', 'qiniu.json');
            fs.mkdirSync(path.dirname(legacy), { recursive: true });
            fs.copyFileSync(path.resolve(__dirname, '../def/qiniu.json'), legacy);
            assert.equal(isFileConfigPath('./command/qiniu.json'), true);
            assert.equal(
                samePath(resolveProfileConfigPath({ config: './command/qiniu.json' }), legacy),
                true
            );
        });
    } finally {
        process.chdir(prev);
    }
});

test('getQiniuConfig falls back to command/qiniu.json without profile', () => {
    const workspace = makeWorkspace();
    const prev = process.cwd();
    process.chdir(workspace);
    try {
        withTempProfileHome(workspace, () => {
            assert.equal(listProfiles().length, 0);
            assert.equal(readCurrentProfile(), null);
            assert.equal(
                samePath(getQiniuConfig({}), path.join(workspace, 'command', 'qiniu.json')),
                true
            );
        });
    } finally {
        process.chdir(prev);
    }
});
