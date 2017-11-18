const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 8080;
const url = "https://www.tipsport.cz/live";

app.get('/', function(req, res) {
    (async() => {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        await page.goto('https://www.tipsport.cz/live', { waitUntil: 'domcontentloaded' });

        await page.type('#userNameId', 'sindelka95');
        await page.type('#passwordId', 'sindelka');
        await page.click('input[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
        await page.waitForSelector("#ss16");
        await page.evaluate("var matchs = document.getElementById('ss16'); document.write(matchs.innerHTML);");
        //const matchs = await page.$("#ss16");
        //console.log("------------------");
        //console.log(matchs);
        //await page.waitFor(5000);
        //await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
        
        await page.screenshot({ fullPage: true }).then(function(buffer) {
            res.setHeader('Content-Disposition', 'attachment;filename="' + url + '.png"');
            res.setHeader('Content-Type', 'image/png');
            res.send(buffer);
        });

        await browser.close();
    })();
});

app.listen(port, function() {
    console.log('App listening on port ' + port)
})
