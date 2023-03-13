// modules
const line = require('@line/bot-sdk');
const { text } = require('body-parser');
const {spawn} = require('child_process');

// get linebot channel access token and secret
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

// linebot
const client = new line.Client(config);
const app = require('express')();

// redis
const redis = require('redis');

// create redis client
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});


app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then((result) =>
    res.json(result)
  );
});

function handleEvent(event) {
  if (event.type === 'message' && event.message.type === 'text') {
    const messageText = event.message.text;

    if (['あ', 'い', 'う', 'え', 'お'].includes(messageText)) {
      const message = {
        type: 'text',
        text: 'Node.js, あいうえお',  
      };
      return client.replyMessage(event,replyToken, message);
    }else if (['か', 'き', 'く', 'け', 'こ',].includes(messageText)) {
      const python = spawn('python', ['./python_scripts/python_kakikukeko.py', messageText]);
      python.stdout.on('data', (data) => {
        const message = {
          type: 'text',
          text: 'Python Script, かきくけこ',
        };
        return client.replyMessage(event.replyToken, message);
      });
      python.stderr.on('data', (data) => {
        console.error('stderr: ${data}');
      });
    }else{
      const message = {
        type: 'text',
        text: 'Received',
      };
      return client.replyMessage(event.replyToken, message);
    }
  }
  return Promise.resolve(null);
}

app.listen(process.env.PORT || 3000);