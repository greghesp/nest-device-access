const open = require('open');
const dotenv = require('dotenv');
const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: false }));
dotenv.config();

const NestDeviceAccess = require('../lib/index');

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
  res.json({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  });
});

app.get('/get-devices', async (req, res) => {
  try {
    const devices = await NDA.getDevices(ACCESS_TOKEN);
    res.json(devices);
  } catch (e) {
    console.log(e);
  }
});

app.get('/get-structures', async (req, res) => {
  try {
    const structures = await NDA.getStructures(ACCESS_TOKEN);
    res.json(structures);
  } catch (e) {
    console.log(e);
  }
});

app.get('/get-camera-streams', async (req, res) => {
  try {
    const devices = await NDA.getDevices(ACCESS_TOKEN);
    const promises = [];

    devices.forEach(d => {
      if (d.type.includes('sdm.devices.types.DOORBELL', 'sdm.devices.types.CAMERA')) {
        promises.push(NDA.getCameraStream(d, ACCESS_TOKEN));
      }
    });

    const streams = await Promise.all(promises);
    res.json(streams);
  } catch (e) {
    console.log(e);
  }
});

app.listen(3000, () => {
  console.log(`Example app listening at http://localhost:${3000}`);
  console.log(`Get Devices: http://localhost:${3000}/get-devices`);
  console.log(`Get Structures: http://localhost:${3000}/get-structures`);
  console.log(`Login: http://localhost:${3000}/login`);
});
