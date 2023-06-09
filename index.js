// modules
const line = require('@line/bot-sdk');
const { text } = require('body-parser');
const { spawn } = require('child_process');
const { google } = require('googleapis')

// modules for html reading
const https = require('https');
const cheerio = require('cheerio');

// get linebot channel access token and secret
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

// linebot
const lineClient = new line.Client(config);
const app = require('express')();

// redis
const redis = require('redis');
const { resolve } = require('path');

// gogle api
const customsearch = google.customsearch('v1');
const gApiKey = process.env.G_SEARCH_API_KEY;
const engineID = process.env.G_SEARCH_ENGINE_ID;

// create redis client
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

// create google search api
async function search(query) {
  const res = await customsearch.cse.list({
    auth: gApiKey,
    cx: engineID,
    q: query,
  });
  return res.data.items[0].link
}

// extract from html
async function getHtmlBody(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let html = '';

      res.on('data', (chunk) => {
        html += chunk;
      });

      res.on('end', () => {
        const $ = cheerio.load(html);
        const body = $('body').text();
        resolve(body);
      });
    }).on('error', (err) =>{
      reject(err);
    });
  });
}

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then((result) =>
    res.json(result)
  );
});

async function handleEvent(event) {
  if (event.type === 'message' && event.message.type === 'text') {
    const messageText = event.message.text;

    if ( event.message.text.startsWith('!s ')) {
      const url = await search(messageText.slice(3));
      const body = await getHtmlBody(url);
      const message = {
        type: 'text',
        text: url + '\n' + body,
      };

      return lineClient.replyMessage(event.replyToken, message);

    }else if ([...'あいうえお'].map(c => c.codePointAt(0)).includes(messageText.codePointAt(0))) {
      const message = {
        type: 'text',
        text: 'Node.js, あいうえお',  
      };
      return lineClient.replyMessage(event.replyToken, message);
    }else if ([...'かきくけこ'].map(c => c.codePointAt(0)).includes(messageText.codePointAt(0))) {
      const python = spawn('python', ['./python_scripts/python_kakikukeko.py', messageText]);
      python.stdout.on('data', (data) => {
        const message = {
          type: 'text',
          text: data.toString(),
        };
        lineClient.replyMessage(event.replyToken, message);
      });
      python.stderr.on('data', (data) => {
        console.error('stderr: ${data}');
      });
    }else{
      const message = {
        type: 'text',
        text: 'Received',
      };
      return lineClient.replyMessage(event.replyToken, message);
    }
  }
  return Promise.resolve(null);
}

app.listen(process.env.PORT || 3000);