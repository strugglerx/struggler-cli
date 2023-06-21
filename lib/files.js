// files.js

const fs = require('fs');
const path = require('path');

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
        fs.writeFile(
            filePath,
            JSON.stringify(data, null, "\t"
            ),
            (err) => { }
        )
    },
    setSyncJsonData: (filePath, data) => {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(
            filePath,
            JSON.stringify(data, null, "\t"),
        )
    }
};