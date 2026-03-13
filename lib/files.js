// files.js

const fs = require('fs');
const path = require('path');
const fsp = fs.promises;

async function walkFiles(filePath) {
    const entries = await fsp.readdir(filePath, { withFileTypes: true });
    const files = await Promise.all(entries.map(async (entry) => {
        const absolutePath = path.join(filePath, entry.name);
        if (entry.isDirectory()) {
            return walkFiles(absolutePath);
        }

        return [absolutePath];
    }));

    return files.flat();
}

module.exports = {
    // 获取目录名称
    getCurrentDirectoryBase: () => {
        return path.basename(process.cwd());
    },

    // 判断目录是否存在
    directoryExists: (filePath) => {
        return fs.existsSync(filePath);
    },


    getJsonData: (filePath) => {
        if (!fs.existsSync(filePath)) {return {}}
        let data = fs.readFileSync(filePath);//fs读取文件
        return JSON.parse(data);//转换为json对象
    },

    setJsonData: (filePath,data) => {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(
            filePath,
            JSON.stringify(data, null, "\t"
            )
        )
    },
    setSyncJsonData: (filePath, data) => {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(
            filePath,
            JSON.stringify(data, null, "\t"),
        )
    },
    listFiles: async (filePath) => {
        if (!fs.existsSync(filePath)) {
            return [];
        }

        const stat = await fsp.stat(filePath);
        if (!stat.isDirectory()) {
            return [filePath];
        }

        return walkFiles(filePath);
    }
};
