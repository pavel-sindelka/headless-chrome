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
        
        await page.waitForSelector("#ss16");
        
        const matches = await page.$$("#ss16 .match");
        let index;
        for (var i = 0; i < matches.length; i++) {
            const teams = await matches[i].$(".nameMatch").innerHTML.split(' - '); 
            const text = teams[0];
            const tip = 'sms';
            const reg = '.*' + tip.replace(/\\s/g,'').split('').join('+.*') + '+.*';
            const match = text.match(new RegExp(reg, 'i'));
            if (match !== null) {
                index = i;
                break;
            }
        }
        //matches[index].click();*/
        //await page.evaluate("var matchs = document.getElementById('ss16').getElementsByClassName('match'); var index; for (var i = 0; i < matchs.length; i++) { var teams = matchs[i].getElementsByClassName('nameMatch')[0].innerHTML.split(' - '); var text = teams[0]; var tip = 'sms'; var reg = '.*' + tip.replace(/\\s/g,'').split('').join('+.*') + '+.*'; var match = text.match(new RegExp(reg, 'i')); console.log(match); if (match !== null) { index = i; break; } } console.log(index); matchs[index].click();");
        
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
