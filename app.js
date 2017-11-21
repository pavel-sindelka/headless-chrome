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

        await page.goto('https://www.tipsport.cz/live');

        await page.type('#userNameId', 'sindelka95');
        await page.type('#passwordId', 'sindelka');
        await page.click('input[type="submit"]');
        
        await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
        await page.waitForSelector("#ss16");
        
        await page.evaluate(() => {
            var matchs = document.getElementById('ss16').getElementsByClassName('match');
            var index;
            for (var i = 0; i < matchs.length; i++) {
                var teams = matchs[i].getElementsByClassName('nameMatch')[0].innerHTML.split(' - ');
                var text = teams[0];
                var tip = 'a';
                var reg = '.*' + tip.replace(/\\s/g,'').split('').join('+.*') + '+.*';
                var match = text.match(new RegExp(reg, 'i'));
                if (match !== null) {
                    index = i;
                    break;
                }
            }
            matchs[index].click();
        });
        
        await page.waitForNavigation();
        await page.waitForSelector(".tdEventTable");
        
        await page.evaluate(() => {
            document.getElementsByClassName('tdEventTable opportunity')[0].click();
            document.getElementById('amountPaid').value = 808;
        });
        
        await page.waitForSelector("#submitButton");
        
        await page.evaluate(() => {
            document.getElementById('submitButton').click();
        });
        
        await page.click("#submitButton");
        
        await page.waitFor(5000);
        
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
