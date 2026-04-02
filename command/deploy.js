const init = require('./init');
const upload = require('./upload');
const refresh = require('./refresh');
const chalk = require('chalk');
const { collectDeployFiles, createSummary, finalizeOutput } = require('../lib/deploy');
const { getDir } = require('../lib/config');
const { createIgnoreMatcher } = require('../lib/ignore');
const { printMessage } = require('../lib/output');
const { getLocale } = require('../lib/i18n');

async function main(options) {
    const startedAt = Date.now();
    const dir = getDir(options);
    const ignoreMatcher = createIgnoreMatcher(dir, options);
    const files = await collectDeployFiles(dir, options);
    const manifestExtra = {
        command: 'deploy',
        skippedSteps: {
            init: Boolean(options.skipInit),
            refresh: Boolean(options.skipRefresh),
        },
    };

    let initConfig = null;
    if (!options.skipInit) {
        initConfig = await init(options);
    }

    const prefix = initConfig ? initConfig.publicPath : undefined;
    const uploadSummary = await upload(options, {
        files,
        prefix,
        excludePatterns: ignoreMatcher.patterns,
        suppressOutput: true,
    });

    let refreshSummary = createSummary('refresh', Boolean(options.dryRun), [], startedAt, {
        skipped: Boolean(options.skipRefresh),
        prefix: uploadSummary.prefix,
        excludedPatterns: ignoreMatcher.patterns,
    });

    if (!options.skipRefresh) {
        const refreshFiles = uploadSummary.succeeded.map((item) => item.localFile);
        refreshSummary = await refresh(options, {
            files: refreshFiles,
            prefix: uploadSummary.prefix,
            excludePatterns: ignoreMatcher.patterns,
            suppressOutput: true,
        });
    } else {
        const { messages } = getLocale(options && options.lang);
        printMessage(options, `  ${chalk.dim(`↩  ${messages.deploySkipRefresh}`)}`);
    }

    const deploySummary = finalizeOutput(createSummary('deploy', Boolean(options.dryRun), [
        {
            ok: uploadSummary.failedCount === 0,
            step: 'upload',
            detail: uploadSummary,
        },
        {
            ok: options.skipRefresh || refreshSummary.failedCount === 0,
            step: 'refresh',
            detail: refreshSummary,
        },
    ], startedAt, {
        upload: uploadSummary,
        refresh: refreshSummary,
        prefix: uploadSummary.prefix,
        excludedPatterns: ignoreMatcher.patterns,
    }), options, manifestExtra);

    const { messages } = getLocale(options && options.lang);
    const uploadOk = uploadSummary.failedCount === 0;
    const refreshOk = options.skipRefresh || refreshSummary.failedCount === 0;
    const allOk = uploadOk && refreshOk;
    printMessage(options, '');
    printMessage(options, `  ${allOk ? chalk.green('✓') : chalk.red('✗')}  ${chalk.bold(messages.deployDone)}`);
    printMessage(options, '');
    printMessage(options, `     ${chalk.dim(messages.deployUploadLabel)}  ${chalk.green(uploadSummary.succeededCount)} / ${uploadSummary.total} ${messages.deployFileUnit}`);
    if (!options.skipRefresh) {
        printMessage(options, `     ${chalk.dim(messages.deployRefreshLabel)}  ${chalk.green(refreshSummary.succeededCount)} / ${refreshSummary.total} ${messages.deployUnit}`);
    }
    printMessage(options, '');
    return deploySummary;
}

module.exports = main
