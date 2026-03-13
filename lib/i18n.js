const LANGUAGES = {
    zh: {
        appDescription: '用于将前端打包产物上传到七牛云 OSS 的命令行工具。',
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
