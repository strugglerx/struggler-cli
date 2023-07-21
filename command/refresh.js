var fs = require('fs');

var path = require('path');

var qiniu = require("qiniu");

var qiniuPrefix = require("../lib/prefix")

let { getQiniuConfig, getDir } = require('../lib/config')
let { getJsonData, setJsonData } = require('../lib/files')


function main(options) {
    const qiniuConfig = getJsonData(getQiniuConfig(options))

    //自己七牛云的秘钥

    var accessKey = qiniuConfig.accessKey

    var secretKey = qiniuConfig.secretKey;

    var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

    var cdnManager = new qiniu.cdn.CdnManager(mac);

    //文件前缀
    const prefix = qiniuPrefix.prefix(options);

    let dir = getDir(options)

    function refresh(key, localFile) {

        const str = path.relative(dir, localFile)

        key = prefix + str

        //上传之后的文件名
        key = key.replace(/\\/g, "/")

        var url_file = qiniuConfig.domain + key

        //URL 列表
        var urlsToRefresh = [
            url_file
        ];
        //单次请求链接不可以超过10个，如果超过，请分批发送请求
        cdnManager.refreshUrls(urlsToRefresh, function (respErr, respBody, respInfo) {
            if (respErr) {
                console.log(url_file + "文件刷新失败");
                throw respErr;

            } else {
                if (respInfo.statusCode == 200) {
                    
                    console.log(respBody.error,":", Object.keys(respBody.taskIds));

                } else {
                    console.log(respInfo.statusCode);
                    if (respBody.error) {

                        console.log(respBody.error)

                    }

                }

            }
        });

    }

    //遍历文件夹

    function displayFile(param) {

        //转换为绝对路径

        //var param = path.resolve(param);

        fs.stat(param, function (err, stats) {

            //如果是目录的话，遍历目录下的文件信息

            if (stats.isDirectory()) {

                fs.readdir(param, function (err, file) {

                    file.forEach((e) => {

                        //遍历之后递归调用查看文件函数

                        //遍历目录得到的文件名称是不含路径的，需要将前面的绝对路径拼接

                        var absolutePath = path.join(param, e);

                        //var absolutePath = path.resolve(path.join(param, e));

                        displayFile(absolutePath)

                    })

                })

            } else {

                //file2/这里是空间里的文件前缀

                var key = 'file2';

                var localFile = param;

                if (!localFile.endsWith(".gz")) {

                    refresh(key, localFile);

                }

            }

        })

    }

    displayFile(dir);

}




module.exports = main