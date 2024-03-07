import puppeteer from 'puppeteer';
import {promises as fs} from 'fs';
import axios from "axios";
import path, {join} from "path";

async function readAndSetCookies(page) {
    try {
        const filePath = '../../cookies.json';
        let cookiesData = {};

        // Read the file and wait for it to complete
        const data = await fs.readFile(filePath);
        // await fs.readFile(filePath);
        console.log('File read result:', data);
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
        await page.setCookie(...cookies);
        console.log('Cookie complete.')

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
    let repeat_times = 2;
    let current_article_cnt = 0;
    let last_article_cnt = 0;
    while (repeat_times !== 0) {
        const articles = await page.$$('article');
        current_article_cnt = articles.length;
        if (current_article_cnt !== last_article_cnt) {
            const article = articles[0]
            // for (const article of articles) {
            // 在evaluate()中提取<article>元素的信息
            const spans = await article.$$('.css-1qaijid');
            const images = await article.$$('img');
            for (const span of spans) {
                // 使用正则表达式判断是否包含大于10个中文字符
                const spanText = await page.evaluate(span => span.textContent, span);
                const chinesePattern = /[\u4e00-\u9fa5]/g; // 匹配中文字符的正则表达式
                const chineseMatches = spanText.match(chinesePattern);

                if (chineseMatches && chineseMatches.length > 10) {
                    // 输出符合条件的内容
                    console.log('文章中的<span>元素文本:', spanText);
                    uniqueSpans.add(spanText.replaceAll('\n', ''));
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
                    const imageName = path.basename(imageSrc).replaceAll('/', ''); // 提取图片文件名
                    // console.log(imageName)
                    axios
                        .get(imageSrc, {responseType: 'stream'})
                        .then((response) => {
                            // 创建一个可写流，将图像数据保存到内存中
                            const imageData = [];
                            response.data.on('data', (chunk) => {
                                imageData.push(chunk);
                            });
                            return new Promise((resolve, reject) => {
                                response.data.on('end', () => {
                                    resolve(Buffer.concat(imageData));
                                });
                                response.data.on('error', reject);
                            });
                        })
                        .then((imageBuffer) => {
                            // 创建一个可写流，将图像数据保存到文件
                            let imagePath = join('storage/', imageName);
                            imagePath += '.jpg'
                            return fs.writeFile(imagePath, imageBuffer);
                        })
                        .then(() => {
                            console.log(`已成功下载图片到 ${imageSrc}`);
                        })
                        .catch((error) => {
                            console.error('下载图片时出错：', error);
                        });
                }
            }
            // }
        }

        //模拟用户鼠标滚动
        for (let i = 0; i < 5; i++) {
            setTimeout(async () => {
                await page.evaluate(() => {
                    window.scrollBy(0, 200); // 向下滚动200个像素，可以根据需要调整滚动距离
                });
            }, 400); // 400毫秒后执行
        }
        // 等待一段时间，以观察页面滚动效果
        await page.waitForTimeout(3000); // 等待5秒
        last_article_cnt = articles.length;
        repeat_times--;
    }
    console.log(uniqueSpans)
    console.log(uniqueImages)
    // 保存到本地文件
    await fs.writeFile('./storage/spans.txt', Array.from(uniqueSpans).join('\n'));
    await fs.writeFile('./storage/images.txt', Array.from(uniqueImages).join('\n'));
    setTimeout(async function () {
        await browser.close();
        console.log('10秒后执行的代码');
    }, 10000);
})();