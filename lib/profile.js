const fs = require('fs');
const os = require('os');
const path = require('path');
const { setSyncJsonData, getJsonData } = require('./files');

const PROFILE_DIR_NAME = '.struggler-cli';
const PROFILES_SUBDIR = 'profiles';
const CURRENT_FILE = 'current';
const PROFILE_NAME_RE = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

function getStoreRoot() {
    const customHome = process.env.STRUGGLER_CLI_HOME;
    if (customHome && customHome.trim()) {
        return path.join(path.resolve(customHome), PROFILE_DIR_NAME);
    }
    return path.join(os.homedir(), PROFILE_DIR_NAME);
}

function getProfilesDir() {
    return path.join(getStoreRoot(), PROFILES_SUBDIR);
}

function getCurrentFile() {
    return path.join(getStoreRoot(), CURRENT_FILE);
}

function assertProfileName(name) {
    if (!PROFILE_NAME_RE.test(name)) {
        throw new Error(
            `Invalid profile name "${name}". Use letters, numbers, _ or -, and start with a letter.`
        );
    }
}

function getProfilePath(name) {
    assertProfileName(name);
    return path.join(getProfilesDir(), `${name}.json`);
}

function ensureProfilesDir() {
    fs.mkdirSync(getProfilesDir(), { recursive: true });
}

function readCurrentProfile() {
    const currentFile = getCurrentFile();
    if (!fs.existsSync(currentFile)) {
        return null;
    }
    const name = fs.readFileSync(currentFile, 'utf8').trim();
    return name || null;
}

function writeCurrentProfile(name) {
    assertProfileName(name);
    const profilePath = getProfilePath(name);
    if (!fs.existsSync(profilePath)) {
        throw new Error(`Profile "${name}" does not exist. Run: struggler-cli profile list`);
    }
    fs.mkdirSync(getStoreRoot(), { recursive: true });
    fs.writeFileSync(getCurrentFile(), `${name}\n`, 'utf8');
    return profilePath;
}

function listProfiles() {
    const dir = getProfilesDir();
    if (!fs.existsSync(dir)) {
        return [];
    }
    return fs.readdirSync(dir)
        .filter((file) => file.endsWith('.json'))
        .map((file) => path.basename(file, '.json'))
        .sort();
}

function isFileConfigPath(configValue, cwd = process.cwd()) {
    if (!configValue) {
        return false;
    }
    if (configValue.includes('/') || configValue.includes('\\')) {
        return true;
    }
    const resolved = path.resolve(cwd, configValue);
    return fs.existsSync(resolved) && fs.statSync(resolved).isFile();
}

function resolveProfileConfigPath(options = {}, cwd = process.cwd()) {
    const configValue = options.config;

    if (!configValue) {
        const current = readCurrentProfile();
        if (current) {
            return getProfilePath(current);
        }
        return null;
    }

    if (isFileConfigPath(configValue, cwd)) {
        return path.resolve(cwd, configValue);
    }

    assertProfileName(configValue);
    const profilePath = getProfilePath(configValue);
    if (!fs.existsSync(profilePath)) {
        throw new Error(
            `Profile "${configValue}" not found at ${profilePath}. Run: struggler-cli profile list`
        );
    }
    return profilePath;
}

function importProfile(name, fromPath, cwd = process.cwd()) {
    assertProfileName(name);
    const source = path.resolve(cwd, fromPath);
    if (!fs.existsSync(source)) {
        throw new Error(`Config file not found: ${source}`);
    }
    ensureProfilesDir();
    const target = getProfilePath(name);
    fs.copyFileSync(source, target);
    return target;
}

function addProfile(name, templatePath) {
    assertProfileName(name);
    ensureProfilesDir();
    const target = getProfilePath(name);
    if (fs.existsSync(target)) {
        throw new Error(`Profile "${name}" already exists.`);
    }
    setSyncJsonData(target, getJsonData(templatePath));
    return target;
}

module.exports = {
    PROFILE_DIR_NAME,
    getStoreRoot,
    getProfilesDir,
    getProfilePath,
    getCurrentFile,
    assertProfileName,
    readCurrentProfile,
    writeCurrentProfile,
    listProfiles,
    isFileConfigPath,
    resolveProfileConfigPath,
    importProfile,
    addProfile,
};
