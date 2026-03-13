var qiniu = require("qiniu");

var qiniuPrefix = require("../lib/prefix")

let { getQiniuConfig, getDir } = require('../lib/config')
let { getJsonData } = require('../lib/files')
const { createIgnoreMatcher } = require('../lib/ignore');
const {
    collectDeployFiles,
    createSummary,
    ensureRequiredConfig,
    finalizeOutput,
    logPlan,
    toRemoteKey,
} = require('../lib/deploy');
const { printMessage } = require('../lib/output');

async function main(options, runtime = {}) {
    const qiniuConfig = getJsonData(getQiniuConfig(options))
    const prefix = runtime.prefix || qiniuPrefix.prefix(options);
    let dir = getDir(options)
    const startedAt = Date.now();
    const ignoreMatcher = createIgnoreMatcher(dir, options);
    const excludedPatterns = runtime.excludePatterns || ignoreMatcher.patterns;
    const files = runtime.files || await collectDeployFiles(dir, options);
    const plans = files.map((localFile) => {
        const key = toRemoteKey(prefix, dir, localFile);
        return {
            localFile,
            key,
            target: `${qiniuConfig.domain || ''}${key}`,
        };
    });

    if (options.dryRun) {
        if (!runtime.suppressOutput) {
            logPlan('refresh', plans, options);
        }
        const summary = createSummary('refresh', true, plans.map((plan) => ({
            ok: true,
            localFile: plan.localFile,
            key: plan.key,
            target: plan.target,
        })), startedAt, {
            prefix,
            excludedPatterns,
        });
        return runtime.suppressOutput ? summary : finalizeOutput(summary, options, runtime.manifestExtra);
    }

    ensureRequiredConfig(
        { ...qiniuConfig, 'publicPath(config.json)': prefix },
        ['accessKey', 'secretKey', 'domain', 'publicPath(config.json)']
    );

    var accessKey = qiniuConfig.accessKey
    var secretKey = qiniuConfig.secretKey;
    var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    var cdnManager = new qiniu.cdn.CdnManager(mac);

    function refresh(plan) {
        return new Promise((resolve, reject) => {
            cdnManager.refreshUrls([plan.target], function (respErr, respBody, respInfo) {
                if (respErr || respInfo.statusCode !== 200) {
                    const errorMessage = respErr || (respBody && respBody.error) || `statusCode=${respInfo && respInfo.statusCode}`;
                    reject(new Error(errorMessage));
                    return;
                }

                resolve(respBody);
            });
        });
    }

    const results = [];
    for (const plan of plans) {
        try {
            await refresh(plan);
            if (!runtime.suppressOutput) {
                printMessage(options, `[refreshed] ${plan.target}`);
            }
            results.push({
                ok: true,
                localFile: plan.localFile,
                key: plan.key,
                target: plan.target,
            });
        } catch (error) {
            results.push({
                ok: false,
                localFile: plan.localFile,
                key: plan.key,
                target: plan.target,
                error: error.message,
            });
        }
    }

    const summary = createSummary('refresh', false, results, startedAt, {
        prefix,
        excludedPatterns,
    });
    const finalSummary = runtime.suppressOutput ? summary : finalizeOutput(summary, options, runtime.manifestExtra);
    if (finalSummary.failedCount > 0) {
        throw new Error(`Refresh finished with ${summary.failedCount} failures`);
    }

    return finalSummary;
}

module.exports = main
