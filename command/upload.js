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
    normalizeConcurrency,
    runWithConcurrency,
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
            logPlan('upload', plans, options);
        }
        const summary = createSummary('upload', true, plans.map((plan) => ({
            ok: true,
            localFile: plan.localFile,
            key: plan.key,
            target: plan.target,
        })), startedAt, {
            prefix,
            concurrency: normalizeConcurrency(options.concurrency),
            excludedPatterns,
        });
        return runtime.suppressOutput ? summary : finalizeOutput(summary, options, runtime.manifestExtra);
    }

    ensureRequiredConfig(
        { ...qiniuConfig, 'publicPath(config.json)': prefix },
        ['accessKey', 'secretKey', 'Bucket', 'zone', 'domain', 'publicPath(config.json)']
    );

    var accessKey = qiniuConfig.accessKey
    var secretKey = qiniuConfig.secretKey;
    var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    var config = new qiniu.conf.Config();
    config.zone = qiniu.zone[qiniuConfig.zone];
    config.useHttpsDomain = true;
    config.useCdnDomain = true;

    var formUploader = new qiniu.form_up.FormUploader(config);
    var putExtra = new qiniu.form_up.PutExtra();

    function upload(plan, attempt = 1) {
        var uploadOptions = {
            scope: `${qiniuConfig.Bucket}:${plan.key}`
        };
        var putPolicy = new qiniu.rs.PutPolicy(uploadOptions);
        var uploadToken = putPolicy.uploadToken(mac);

        return new Promise((resolve, reject) => {
            formUploader.putFile(uploadToken, plan.key, plan.localFile, putExtra, async function (respErr, respBody, respInfo) {
                if (respErr || respInfo.statusCode !== 200) {
                    if (attempt < 3) {
                        console.log(`${plan.localFile} 上传失败，正在进行第 ${attempt + 1} 次重试`);
                        try {
                            const retryResult = await upload(plan, attempt + 1);
                            resolve(retryResult);
                        } catch (retryError) {
                            reject(retryError);
                        }
                        return;
                    }

                    const errorMessage = respErr || (respBody && respBody.error) || `statusCode=${respInfo && respInfo.statusCode}`;
                    reject(new Error(errorMessage));
                    return;
                }

                resolve({
                    hash: respBody.hash,
                    key: plan.key,
                    target: plan.target,
                });
            });
        });
    }

    const results = await runWithConcurrency(plans, normalizeConcurrency(options.concurrency), async (plan) => {
        try {
            const response = await upload(plan);
            if (!runtime.suppressOutput) {
                printMessage(options, `[uploaded] ${plan.localFile} -> ${plan.target}`);
            }
            return {
                ok: true,
                localFile: plan.localFile,
                key: response.key,
                target: response.target,
                hash: response.hash,
            };
        } catch (error) {
            return {
                ok: false,
                localFile: plan.localFile,
                key: plan.key,
                target: plan.target,
                error: error.message,
            };
        }
    });

    const summary = createSummary('upload', false, results, startedAt, {
        prefix,
        concurrency: normalizeConcurrency(options.concurrency),
        excludedPatterns,
    });
    const finalSummary = runtime.suppressOutput ? summary : finalizeOutput(summary, options, runtime.manifestExtra);
    if (finalSummary.failedCount > 0) {
        throw new Error(`Upload finished with ${summary.failedCount} failures`);
    }

    return finalSummary;
}

module.exports = main
