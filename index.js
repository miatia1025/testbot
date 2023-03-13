const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.Client(config);

const app = require('express')();

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then((result) =>
    res.json(result)
  );
});

function handleEvent(event) {
  if (event.type === 'message' && event.message.type === 'text') {
    const message = {
      type: 'text',
      text: 'Received',
    };
    return client.replyMessage(event.replyToken, message);
  }
  return Promise.resolve(null);
}

app.listen(process.env.PORT || 3000);
