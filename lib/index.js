const axios = require('axios');
const { DEVICE_URL, COMMAND_URL, REDIRECT_URL, LOGIN_URL, AUTH_URL } = require('./variables');
const createError = require('./helpers/createError');

const Device = require('./core/Device');
const CameraStream = require('./core/CameraStream');

class NestDevicesAccess {
  constructor({ project_id, client_id, client_secret, redirect_url = REDIRECT_URL }) {
    if (!client_id) throw new Error('Missing Client ID');
    if (!client_secret) throw new Error('Missing Client Secret');
    if (!project_id) throw new Error('Missing Project ID');
    if (!redirect_url) console.warn('No Redirect URL Provided');

    this.project_id = project_id;
    this.client_id = client_id;
    this.client_secret = client_secret;
    this.redirect_url = redirect_url;
  }

  static invalid_token(refresh_token) {
    if (refresh_token) {
      return this.refresh;
    }
    return createError(
      `No OAuth Code Provided. Go to this link to get the OAuth Token: ${this.loginUrl()}`,
    );
  }

  async refresh(refresh_token) {
    if (!refresh_token) return this.invalid_token(refresh_token);
    const response = await axios.post(
      REFRESH_URL(this.client_id, this.client_secret, this.refresh_token),
    );
    if (response.status !== 200) {
      if (response.status === 400) this.invalid_token(refresh_token);
    }

    this.access_token = response.data.access_token;
  }

  async getAccessTokens(oauth_code) {
    const data = {
      client_id: this.client_id,
      client_secret: this.client_secret,
      code: oauth_code,
      grant_type: 'authorization_code',
      redirect_uri: this.redirect_url,
    };

    try {
      const response = await axios.post(AUTH_URL, data);
      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
      };
    } catch (e) {
      if (e.response.status === 400) return this.invalid_token();
    }
  }

  login() {
    return LOGIN_URL(this.project_id, this.client_id, this.redirect_url);
  }

  async getDevices(access_token) {
    if (!access_token) throw new Error('Authorisation Error');
    try {
      const { data } = await axios({
        url: DEVICE_URL(this.project_id),
        method: 'get',
        headers: {
          authorization: `Bearer ${access_token}`,
        },
      });

      const devices_dict = data.devices;
      const devices = [];

      devices_dict.forEach(d => {
        devices.push(d);
      });

      return devices;
    } catch (e) {
      console.log(e);
    }
  }

  async get_camera_stream(device, access_token) {
    if (!device.type.includes('sdm.devices.types.DOORBELL', 'sdm.devices.types.CAMERA')) {
      throw new Error('Device is not a camera');
    }

    if (!access_token) {
      createError('Authorisation Error', 401);
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
        authorization: `Bearer ${access_token}`,
      },
    });

    return response.data;
  }
}

module.exports = NestDevicesAccess;
