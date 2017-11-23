var cluster = require('cluster');
var numWorkers = require('os').cpus().length;

const express = require('express');
const puppeteer = require('puppeteer');
const numCPUs = require('os').cpus().length;
const app = express();
const port = process.env.PORT || 8080;
const url = "https://www.tipsport.cz/live";

const newPage = async (res) => {
        console.log(numWorkers);
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
console.log("a ahaaa a");
        const page = await browser.newPage();
console.log("wwwwww");
        await page.goto('https://www.tipsport.cz/live');
console.log("mmmm mm");
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
        await page.waitFor(500);
        
        await page.evaluate(() => {
            document.getElementById('submitButton').click();
        });
        
        //await page.waitFor(5000);
        
        const buffer = await page.screenshot({ fullPage: true });
    
        await browser.close();
    
    return buffer;
}

if(cluster.isMaster) {
    console.log('Master cluster setting up ' + numWorkers + ' workers...');

    for(var i = 0; i < 1; i++) {
        cluster.fork();
    }

    cluster.on('online', function(worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });

    cluster.on('exit', function(worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    });
    
    newPage();
} else {




app.get('/', async function(req, res) {
        newPage(res);
        newPage(res);

     res.setHeader('Content-Disposition', 'attachment;filename="' + url + '.png"');
            res.setHeader('Content-Type', 'image/png');
            res.send();
});

app.listen(port, function() {
    console.log('App listening on port ' + port)
    console.log('Process ' + process.pid + ' is listening to all incoming requests');
})
} 
