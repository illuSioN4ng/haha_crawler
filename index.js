/**
 * Created with JetBrains WebStorm.
 * User: illuSioN4ng
 * Date: 2017/1/9
 * Description:
 */
let http = require('http'),
    cheerio = require('cheerio'),
    fs = require('fs');

let queryHref = "http://www.haha.mx/topic/1/new/",
    queryPageCount = 0;//记录已抓取到页数

let urls = [];//缓存所有待下载图片的地址

/**
 *
 * @param {String} href ： 根路径
 * @param {String} search ：页码
 */
function getHtmlData(href, search, pageMax){
    let pageData = '',
        req = http.get(href + search, (res) => {
            // console.log(res);
            // console.log(`STATUS: ${res.statusCode}`);
            // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
            res.setEncoding('utf8');

            res.on('data', (chunk) => {
                // console.log(`BODY: ${chunk}`);
                pageData += chunk;
            });

            res.on('end', () => {
                console.log('单页数据请求完毕');
                queryPageCount++;
                // console.log(pageData);
                let $ = cheerio.load(pageData);

                let html = $('.joke-list-item .joke-main-content a img'),
                    i = 0,
                    len = html.length;

                for(; i < len; i++){
                    let imgUrl = html.eq(i).attr('src');

                    //筛选部分广告
                    if(imgUrl.indexOf('http://image.haha.mx/') > -1){
                        urls.push(imgUrl);
                    }
                }
console.log(search, pageMax);
                if (queryPageCount === pageMax) {
                    console.log('图片链接获取完毕！共获取图片数：' + urls.length);
                    if (urls.length > 0){
                        downloadImg(urls.shift());
                    }else {
                        console.log('图片链接数为0');
                    }
                }
            })
        });

    req.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
    });

}

function downloadImg(imgUrl) {
    let pathArr = imgUrl.replace('http://image.haha.mx/', '').split('/'),
        imgRealUrl = imgUrl.replace('/small/', '/big/'),
        imgData = '',
        fileName = pathArr[0] + pathArr[1] + pathArr[2] + '_' + pathArr[4],
        savePath = "./download/" + fileName;

    http.get(imgRealUrl, (res) => {
        res.setEncoding('binary');
        res.on('data', (chunk) => {
            imgData += chunk;
        }).on('end', () => {
            fs.writeFile(savePath, imgData, 'binary', (err) => {
                if (err){
                    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!' + err);
                }else {
                    console.log(fileName);
                    console.log(`下载${fileName}完毕！`);
                    if (urls.length > 0){
                        downloadImg(urls.shift());
                    }else {
                        console.log('下载完成');
                    }

                }
            })
        })
    })
}

/**
 *
 * @param pageMax 查询页数
 */
function init(pageMax) {
    let i = 1;
    console.log('开始获取图片链接！');
    for(; i <= pageMax; i++){
        getHtmlData(queryHref, i, pageMax);
    }
}

init(20);
