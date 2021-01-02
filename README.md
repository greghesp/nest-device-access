# nest-device-access

> This is a Work In Progress.  Please feel free to contribute

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) 

A Node.js wrapper around the Nest Device Access REST API, to be used for integration for Nest Smart Home products.

## Usage

Create a new instance of NestDeviceAccess to get started:
```js
const NestDeviceAccess = require('../lib/index');

const NDA = new NestDeviceAccess({
  project_id: process.env.PROJECT_ID,
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  redirect_url: process.env.REDIRECT_URL,
});
```

Get your Nest Device Access login URL:

```js
NDA.login();
```

Get the users Access and Refresh token:

```js
const { access_token, refresh_token } = await NDA.getAccessTokens(oauth_code);
```

Get users Nest devices:

```js
await NDA.getDevices(ACCESS_TOKEN);
```

Get camera stream URLs:

```js
await NDA.getCameraStream(d, ACCESS_TOKEN)
```

### References:

https://developers.google.com/nest/device-access
