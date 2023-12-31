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

    var config = new qiniu.conf.Config();

    // 空间对应的机房，zone_z1代表华北，其他配置参见七牛云文档

    config.zone = qiniu.zone[qiniuConfig.zone];

    // 是否使用https域名

    config.useHttpsDomain = true;

    // 上传是否使用cdn加速

    config.useCdnDomain = true;

    var formUploader = new qiniu.form_up.FormUploader(config);

    var putExtra = new qiniu.form_up.PutExtra();

    //文件前缀

    const prefix = qiniuPrefix.prefix(options);

    let dir = getDir(options)

    function upload(key, localFile) {
        //windows

        /* let str = null;

        if (localFile.indexOf("./dist\\") >= 0) {

            str = localFile.replace("./dist\\", "");

        } else if (localFile.indexOf("./dist/") >= 0) {

            //苹果

            str = localFile.replace("./dist/", "");

        } else {

            str = localFile;

        } */

        const str = path.relative(dir, localFile)

        key = prefix + str

        //上传之后的文件名
        key = key.replace(/\\/g, "/")

        //这里base-html是存储空间名

        // var Bucket = `cfun:${key}`;

        var Bucket = qiniuConfig.Bucket;

        var options = {

            // scope: Bucket,

            // https://developer.qiniu.com/kodo/1289/nodejs#overwrite-uptoken
            scope: Bucket + ":" + key

            // detectMime:0

            // MimeType: 'text/html;text/css;text/javascript;application/x-gzip',

        };

        var putPolicy = new qiniu.rs.PutPolicy(options);

        var uploadToken = putPolicy.uploadToken(mac);

        formUploader.putFile(uploadToken, key, localFile, null, function (respErr,

            respBody, respInfo) {

            if (respErr) {

                // console.log(uploadToken);

                console.log(localFile + "文件上传失败,正在重新上传-----------");

                // console.log(respInfo.statusCode);

                // console.log(respBody);

                upload('file2', localFile);

                throw respErr;

            } else {

                if (respInfo.statusCode == 200) {
                    respBody.key = qiniuConfig.domain + respBody.key

                    console.log(respBody);

                } else {

                    console.log(respInfo.statusCode);

                    console.log(respBody);

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

                    upload(key, localFile);

                }

            }

        })

    }

    displayFile(dir);

}




module.exports = main