const LANGUAGES = {
    zh: {
        appDescription: '用于将前端打包产物上传到七牛云 OSS 的命令行工具。',
        messages: {
            initTemplateCreated: '七牛配置不存在，已生成模版，请填写必要信息：',
            initConfigUpdated: '配置已更新：',
            initDryRunCreate: (p) => `[预览] 将创建配置模版：${p}`,
            initDryRunWrite: (p) => `[预览] 将写入配置：${p}`,
            uploadRetrying: (file, attempt) => `${file} 上传失败，正在进行第 ${attempt} 次重试`,
            uploadDone: '上传完成',
            uploadLabel: '上传',
            uploadSkippedLabel: '跳过',
            uploadFailedLabel: '失败',
            uploadTotalLabel: '合计',
            uploadCacheHint: '缓存命中，无变更',
            uploadLinksTitle: '已上传文件链接',
            uploadFileUnit: '个文件',
            uploadFailed: (n) => `上传完成，${n} 个失败`,
            refreshDone: '刷新完成',
            refreshSucceededLabel: '成功',
            refreshFailedLabel: '失败',
            refreshTotalLabel: '合计',
            refreshUnit: '个',
            refreshFailed: (n) => `刷新完成，${n} 个失败`,
            deployDone: '部署完成',
            deploySkipRefresh: '刷新步骤已跳过 (--skip-refresh)',
            deployUploadLabel: '上传',
            deployRefreshLabel: '刷新',
            deployFileUnit: '个文件',
            deployUnit: '个',
            errorTitle: '出错了',
            errorMissingConfig: '配置不完整，以下字段缺失或为空：',
            errorMissingConfigHint: '请检查 command/qiniu.json 和 command/config.json，或运行 struggler-cli init 初始化配置。',
            dryRunLabel: '预览',
            dryRunPlan: (action, n) => `[预览] ${action} 计划 (${n} 个文件)`,
            manifestWritten: '清单已写入：',
        },
        options: {
            version: '显示版本号。',
            config: '指定上传配置文件路径。',
            dir: '指定要上传的目录。',
            dryRun: '仅预览执行计划，不写文件也不调用七牛接口。',
            concurrency: '设置上传并发数。',
            exclude: '排除文件匹配规则，支持逗号分隔多个模式。',
            ignoreFile: '指定自定义忽略文件。',
            manifest: '将命令执行结果写入 manifest JSON 文件。',
            json: '输出机器可读的 JSON 结果。',
            skipInit: '在 deploy 时跳过 init 步骤。',
            skipRefresh: '在 deploy 时跳过 refresh 步骤。',
            noCache: '禁用上传缓存，强制重新上传所有文件。',
            lang: '切换菜单语言，可选 zh / en。',
            help: '显示帮助信息。',
        },
        commands: {
            init: '为指定路径生成上传配置。',
            upload: '将指定目录下文件上传到七牛云。',
            refresh: '刷新七牛云 CDN 文件。',
            deploy: '一次执行 init、upload 和 refresh。',
        },
        help: {
            helpCommandDescription: '显示指定命令的帮助信息',
            commandUsage: '用法：',
            commandDescription: '说明：',
            commandOptions: '参数：',
            commandCommands: '命令：',
            subcommandTerm: '命令',
            optionTerm: '参数',
            argumentTerm: '参数',
            usage: '用法',
            options: '参数',
            commands: '命令',
            arguments: '参数',
        },
    },
    en: {
        appDescription: 'CLI to upload front-end build files to Qiniu Cloud OSS.',
        messages: {
            initTemplateCreated: 'Qiniu config not found, template created. Please fill in the required fields:',
            initConfigUpdated: 'Config updated:',
            initDryRunCreate: (p) => `[dry-run] would create template: ${p}`,
            initDryRunWrite: (p) => `[dry-run] would write config: ${p}`,
            uploadRetrying: (file, attempt) => `${file} upload failed, retrying (attempt ${attempt})`,
            uploadDone: 'Upload complete',
            uploadLabel: 'Uploaded',
            uploadSkippedLabel: 'Skipped',
            uploadFailedLabel: 'Failed',
            uploadTotalLabel: 'Total',
            uploadCacheHint: 'cached, no changes',
            uploadLinksTitle: 'Uploaded file links',
            uploadFileUnit: 'files',
            uploadFailed: (n) => `Upload finished with ${n} failures`,
            refreshDone: 'Refresh complete',
            refreshSucceededLabel: 'Succeeded',
            refreshFailedLabel: 'Failed',
            refreshTotalLabel: 'Total',
            refreshUnit: '',
            refreshFailed: (n) => `Refresh finished with ${n} failures`,
            deployDone: 'Deploy complete',
            deploySkipRefresh: 'Refresh step skipped (--skip-refresh)',
            deployUploadLabel: 'Upload',
            deployRefreshLabel: 'Refresh',
            deployFileUnit: 'files',
            deployUnit: '',
            errorTitle: 'Error',
            errorMissingConfig: 'Incomplete config, the following fields are missing or empty:',
            errorMissingConfigHint: 'Check command/qiniu.json and command/config.json, or run struggler-cli init.',
            dryRunLabel: 'dry-run',
            dryRunPlan: (action, n) => `[dry-run] ${action} plan (${n} files)`,
            manifestWritten: 'Manifest written:',
        },
        options: {
            version: 'Display the version number.',
            config: 'Specify the path to the upload configuration file.',
            dir: 'Specify the directory to upload.',
            dryRun: 'Preview actions without writing files or calling Qiniu APIs.',
            concurrency: 'Set upload concurrency.',
            exclude: 'Exclude file glob patterns, supports comma-separated values.',
            ignoreFile: 'Specify a custom ignore file.',
            manifest: 'Write the command summary to a manifest JSON file.',
            json: 'Print machine-readable JSON output.',
            skipInit: 'Skip init during deploy.',
            skipRefresh: 'Skip refresh during deploy.',
            noCache: 'Disable upload cache and force re-upload all files.',
            lang: 'Switch menu language, supported values: zh / en.',
            help: 'Display help information.',
        },
        commands: {
            init: 'Create upload configuration for the specified path.',
            upload: 'Upload files under the specified directory to Qiniu Cloud.',
            refresh: 'Refresh Qiniu Cloud CDN files.',
            deploy: 'Run init, upload, and refresh in one command.',
        },
        help: {
            helpCommandDescription: 'display help for command',
            commandUsage: 'Usage:',
            commandDescription: 'Description:',
            commandOptions: 'Options:',
            commandCommands: 'Commands:',
            subcommandTerm: 'command',
            optionTerm: 'option',
            argumentTerm: 'argument',
            usage: 'Usage',
            options: 'Options',
            commands: 'Commands',
            arguments: 'Arguments',
        },
    },
};

function normalizeLocaleTag(value) {
    if (!value) {
        return '';
    }

    return value.toLowerCase().replace('.', '_');
}

function detectLangFromLocale(localeValue) {
    const normalized = normalizeLocaleTag(localeValue);
    if (!normalized) {
        return null;
    }

    if (normalized.startsWith('en')) {
        return 'en';
    }

    if (normalized.startsWith('zh')) {
        return 'zh';
    }

    return null;
}

function detectLangFromVSLang(value) {
    if (!value) {
        return null;
    }

    const normalized = String(value).trim();
    const englishCodes = new Set(['1033', '2057', '4105', '5129', '6153']);
    const chineseCodes = new Set(['2052', '1028', '3076', '4100']);

    if (englishCodes.has(normalized)) {
        return 'en';
    }

    if (chineseCodes.has(normalized)) {
        return 'zh';
    }

    return null;
}

function detectLangFromWindowsValue(value) {
    return detectLangFromLocale(value);
}

function detectSystemLang(env = process.env) {
    const localeCandidates = [
        env.LC_ALL,
        env.LC_MESSAGES,
        env.LANG,
        env.PreferredUILanguages,
        env.UILANG,
        env.Culture,
        env.UserLanguage,
    ];

    for (const candidate of localeCandidates) {
        const detected = detectLangFromLocale(candidate);
        if (detected) {
            return detected;
        }
    }

    const windowsSpecificCandidates = [
        env.VSLANG,
        env.PREFERRED_UI_LANGUAGES,
        env.UI_LANG,
    ];

    for (const candidate of windowsSpecificCandidates) {
        const detected = detectLangFromVSLang(candidate) || detectLangFromWindowsValue(candidate);
        if (detected) {
            return detected;
        }
    }

    return 'zh';
}

function resolveLang(argv) {
    const langFlagIndex = argv.findIndex((item) => item === '--lang');
    if (langFlagIndex >= 0 && argv[langFlagIndex + 1] && LANGUAGES[argv[langFlagIndex + 1]]) {
        return argv[langFlagIndex + 1];
    }

    const inlineFlag = argv.find((item) => item.startsWith('--lang='));
    if (inlineFlag) {
        const [, value] = inlineFlag.split('=');
        if (LANGUAGES[value]) {
            return value;
        }
    }

    return detectSystemLang();
}

function getLocale(lang) {
    return LANGUAGES[lang] || LANGUAGES.zh;
}

module.exports = {
    LANGUAGES,
    detectSystemLang,
    resolveLang,
    getLocale,
};
