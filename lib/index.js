const axios = require('axios');
const { AUTH_URL, REFRESH_URL, DEVICE_URL, COMMAND_URL } = require('./variables');

class NestDeviceAccessAuth {
  constructor({ project_id, client_id, client_secret, oauth_code, redirect_url, session = null }) {
    if (!client_id || !client_secret || !project_id)
      throw 'Missing Client ID, Client Secret or Project ID';

    this.project_id = project_id;
    this.client_id = client_id;
    this.client_secret = client_secret;
    this._res = {};
    this.access_token = null;
    this.refresh_token = null;
    this.redirect_url = redirect_url;
    this._session = session;
    this.oauth_code = oauth_code;
  }

  call() {
    if (!this.access_token) this.login();
    return `Bearer ${this.access_token}`;
  }

  async login() {
    const data = {
      client_id: this.client_id,
      client_secret: this.client_secret,
      code: this.oauth_code,
      grant_type: 'authorization_code',
      redirect_uri: this.redirect_url,
    };

    try {
      const response = await axios.post(AUTH_URL, data);
      this._res = response.data;
      this.access_token = this._res.access_token;
      this.refresh_token = this._res.refresh_token;
      console.log(response.data);
      console.log(`Logged In: ${response.data}`);
      return { access_token: this.access_token, refresh_token: this.refresh_token };
    } catch (e) {
      if (e.response.status === 400) return this.invalid_token();
    }
  }

  invalid_token() {
    if (this.refresh_token) {
      return this.refresh;
    }
    console.log(
      `Go to this link to get OAuth token: https://nestservices.google.com/partnerconnections/${this.project_id}/auth?redirect_uri=https://www.google.com&access_type=offline&prompt=consent&client_id=${this.client_id}&response_type=code&scope=https://www.googleapis.com/auth/sdm.service`,
    );
  }

  async refresh() {
    if (!this.refresh_token) return this.invalid_token();
    const response = await axios.post(
      REFRESH_URL(this.client_id, this.client_secret, this.refresh_token),
    );
    if (response.status !== 200) {
      if (response.status === 400) this.invalid_token();
    }

    this.access_token = response.data.access_token;
  }
}

class Device {
  constructor(dict) {
    this.name = dict.name;
    this.device_id = this.name.split('/')[3];
    this.type = dict.type;
    this.traits = dict.traits;
  }
}

class CameraStream {
  constructor(dict) {
    this.rtsp_stream_url = dict.results.streamUrls.rtspUrl;
    this.stream_token = dict.results.streamToken;
    this.expires_at = dict.results.expiresAt;
  }
}

class NestDevicesAccess {
  constructor({ project_id, client_id, client_secret, oauth_code, redirect_url = REDIRECT_URL }) {
    this.auth = new NestDeviceAccessAuth({
      project_id,
      client_id,
      client_secret,
      oauth_code,
      redirect_url,
    });

    this.access_token = null;
    this.refresh_token = null;
    this.project_id = project_id;
    this.client_id = client_id;
    this.client_secret = client_secret;
  }

  async login() {
    await this.auth.login();
  }

  async get_devices() {
    if (!this.auth.access_token) throw 'Authorisation Error';
    try {
      const { data } = await axios({
        url: DEVICE_URL(this.project_id),
        method: 'get',
        headers: {
          authorization: this.auth.call(),
        },
      });

      const devices_dict = data.devices;
      const devices = [];

      devices_dict.forEach(d => {
        const device = new Device(d);
        devices.push(device);
      });

      return devices;
    } catch (e) {
      console.log(e);
    }
  }

  async get_camera_stream(device) {
    if (!device.type.includes('sdm.devices.types.DOORBELL', 'sdm.devices.types.CAMERA')) {
      console.error('Device not a camera');
    }

    if (!this.auth.access_token) {
      console.error('Auth Error');
    }

    const data = {
      command: 'sdm.devices.commands.CameraLiveStream.GenerateRtspStream',
      params: {},
    };

    const response = await axios({
      method: 'post',
      url: COMMAND_URL(this.project_id, device.device_id),
      data,
      headers: {
        authorization: this.auth.call(),
      },
    });

    return new CameraStream(response.data);
  }
}

module.exports = NestDevicesAccess;
