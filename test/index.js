const open = require('open');
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: false }));

const NestDeviceAccess = require('../nest-api/lib/index');

const NDA = new NestDeviceAccess({
  project_id: process.env.PROJECT_ID,
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  redirect_url: process.env.REDIRECT_URL,
});

let ACCESS_TOKEN = process.env.ACCESS_TOKEN;
let REFRESH_TOKEN = process.env.REFRESH_TOKEN;

app.get('/login', async (req, res) => {
  const loginURL = NDA.login();
  await open(loginURL);
  res.sendStatus(200);
});

app.get('/connect/callback', async (req, res) => {
  const oauth_code = req.query.code;
  const tokens = await NDA.getAccessTokens(oauth_code);
  ACCESS_TOKEN = tokens.access_token;
  REFRESH_TOKEN = tokens.refresh_token;
  res.send(200);
});

app.get('/getDevices', async (req, res) => {
  try {
    const devices = await NDA.getDevices(ACCESS_TOKEN);
    const promises = [];

    devices.forEach(d => {
      if (d.type.includes('sdm.devices.types.DOORBELL', 'sdm.devices.types.CAMERA')) {
        promises.push(NDA.get_camera_stream(d, ACCESS_TOKEN));
      }
    });

    const streams = await Promise.all(promises);
    console.log(streams);
  } catch (e) {
    console.log(e);
  }
});

app.listen(3000, () => {
  console.log(`Example app listening at http://localhost:${3000}`);
});
