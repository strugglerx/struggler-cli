//npm run build打包前执行此段代码
let fs = require('fs');
let path = require('path')

let packagePath = path.resolve(process.cwd(), './package.json')
//返回package的json数据
function getPackageJson() {
    let data = fs.readFileSync(packagePath);//fs读取文件
    return JSON.parse(data);//转换为json对象
}



function main(){
    let packageData = getPackageJson();//获取package的json
    let arr = packageData.version.split('.');//切割后的版本号数组
    arr[2] = parseInt(arr[2]) + 1;
    packageData.version = arr.join('.');//转换为以"."分割的字符串
    //用packageData覆盖package.json内容
    fs.writeFile(
        packagePath,
        JSON.stringify(packageData, null, "\t"
        ),
        (err) => { }
    )
}


module.exports = main