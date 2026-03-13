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
    if (arr.length !== 3 || arr.some((item) => Number.isNaN(parseInt(item, 10)))) {
        throw new Error(`Invalid semver version: ${packageData.version}`)
    }
    arr[2] = parseInt(arr[2]) + 1;
    packageData.version = arr.join('.');//转换为以"."分割的字符串
    fs.writeFileSync(
        packagePath,
        JSON.stringify(packageData, null, "\t"
        )
    )
    console.log(`Version updated to ${packageData.version}`)
}


module.exports = main

if (require.main === module) {
    main()
}
