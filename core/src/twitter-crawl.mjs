import puppeteer from 'puppeteer';
import * as fs from "fs";

async function readAndSetCookies(page) {
    try {
        const filePath = './cookies.json';
        let cookiesData = {};

        // Read the file and wait for it to complete
        fs.readFile(filePath, (err, data) => {
            if (err) throw err;
            console.log(data);
            cookiesData = JSON.parse(data);
            let cookies = [
                {
                    name: cookiesData.name,
                    value: cookiesData.value,
                    domain: '.twitter.com',
                    path: '/',
                    expires: Math.floor(Date.now() / 1000) + 3600, // Set cookie expiry to one hour later
                }
            ];
            console.log('Cookies:', cookies);
            page.setCookie(...cookies);
        });

    } catch (error) {
        console.error('Error occurred:', error);
    }
}

(async () => {
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({headless: false});
    const uniqueSpans = new Set();
    const uniqueImages = new Set();
    const page = await browser.newPage();

    // 读取文件
    await readAndSetCookies(page)
    // Navigate the page to a URL
    await page.goto('https://twitter.com/home');
    // Set screen size
    await page.setViewport({width: 1080, height: 1024});
    await page.waitForTimeout(5000); // 等待5秒页面渲染
    let times = 2;
    let current_article_cnt = 0;
    let last_article_cnt = 0;
    while (times !== 0) {
        const articles = await page.$$('article');
        current_article_cnt = articles.length;
        console.log('enter')
        if (current_article_cnt !== last_article_cnt) {
            for (const article of articles) {
                // 在evaluate()中提取<article>元素的信息
                const spans = await article.$$('span');
                const images = await article.$$('img');
                // console.log(spans.length)
                for (const span of spans) {
                    // 在evaluate()中提取<span>元素的文本内容
                    // 使用正则表达式判断是否包含大于10个中文字符
                    const spanText = await page.evaluate(span => span.textContent, span);
                    const chinesePattern = /[\u4e00-\u9fa5]/g; // 匹配中文字符的正则表达式
                    const chineseMatches = spanText.match(chinesePattern);

                    if (chineseMatches && chineseMatches.length > 10) {
                        // 输出符合条件的内容
                        // console.log('文章中的<span>元素文本:', spanText);
                        uniqueSpans.add(spanText);
                    }
                }
                for (const image of images) {
                    // 在evaluate()中提取<span>元素的文本内容
                    // 使用正则表达式判断是否包含大于10个中文字符
                    const imageSrc = await page.evaluate(image => image.src, image);
                    // console.log(imageSrc)
                    // 包含media
                    const mediaPattern = /media/g; // 匹配 "media" 的正则表达式
                    const mediaMatches = imageSrc.match(mediaPattern);
                    if (mediaMatches && mediaMatches.length > 0) { // 只要包含 "media" 就输出
                        console.log('文章中的<span>图片文本:', imageSrc);
                        uniqueImages.add(imageSrc);
                    }
                }
            }
        }
        await page.evaluate(() => {
            window.scrollBy(0, 500); // 向下滚动500个像素，可以根据需要调整滚动距离
        });
        // 等待一段时间，以观察页面滚动效果
        await page.waitForTimeout(5000); // 等待5秒
        last_article_cnt = articles.length;
        times--;
    }
    console.log(uniqueSpans)
    setTimeout(async function () {
        await browser.close();
        console.log('10秒后执行的代码');
    }, 10000);
})();