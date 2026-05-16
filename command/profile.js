const path = require('path');
const chalk = require('chalk');
const {
    listProfiles,
    readCurrentProfile,
    writeCurrentProfile,
    importProfile,
    addProfile,
    getProfilePath,
    getProfilesDir,
} = require('../lib/profile');
const { printMessage } = require('../lib/output');
const { getLocale } = require('../lib/i18n');

const TEMPLATE_PATH = path.resolve(__dirname, '../def/qiniu.json');

function listAction(options) {
    const { messages } = getLocale(options.lang);
    const profiles = listProfiles();
    const current = readCurrentProfile();

    if (profiles.length === 0) {
        printMessage(options, chalk.yellow(`  ${messages.profileListEmpty}`));
        printMessage(options, chalk.dim(`     ${getProfilesDir()}`));
        return { profiles: [], current: null };
    }

    printMessage(options, messages.profileListTitle);
    profiles.forEach((name) => {
        const marker = name === current ? chalk.green(' *') : '  ';
        const file = getProfilePath(name);
        printMessage(options, `${marker} ${name}${chalk.dim(`  →  ${file}`)}`);
    });
    if (current) {
        printMessage(options, chalk.dim(messages.profileListCurrentHint));
    }
    return { profiles, current };
}

function useAction(name, options) {
    const { messages } = getLocale(options.lang);
    const profilePath = writeCurrentProfile(name);
    printMessage(options, chalk.green(`  ✓  ${messages.profileUseDone(name)}`));
    printMessage(options, chalk.dim(`     ${profilePath}`));
    return { name, path: profilePath };
}

function currentAction(options) {
    const { messages } = getLocale(options.lang);
    const current = readCurrentProfile();
    if (!current) {
        printMessage(options, chalk.yellow(`  ${messages.profileNoCurrent}`));
        return { current: null };
    }
    const profilePath = getProfilePath(current);
    printMessage(options, `${messages.profileCurrentLabel} ${chalk.cyan(current)}`);
    printMessage(options, chalk.dim(`     ${profilePath}`));
    return { current, path: profilePath };
}

function addAction(name, options) {
    const { messages } = getLocale(options.lang);
    const profilePath = addProfile(name, TEMPLATE_PATH);
    printMessage(options, chalk.green(`  ✓  ${messages.profileAddDone(name)}`));
    printMessage(options, chalk.dim(`     ${profilePath}`));
    printMessage(options, chalk.dim(messages.profileEditHint));
    return { name, path: profilePath };
}

function importAction(name, fromPath, options) {
    const { messages } = getLocale(options.lang);
    const profilePath = importProfile(name, fromPath);
    printMessage(options, chalk.green(`  ✓  ${messages.profileImportDone(name)}`));
    printMessage(options, chalk.dim(`     ${profilePath}`));
    return { name, path: profilePath, from: path.resolve(fromPath) };
}

module.exports = {
    list: listAction,
    use: useAction,
    current: currentAction,
    add: addAction,
    import: importAction,
};
