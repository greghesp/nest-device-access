const axios = require('axios');
const {
  DEVICE_URL,
  COMMAND_URL,
  REDIRECT_URL,
  LOGIN_URL,
  AUTH_URL,
  REFRESH_URL,
  STRUCTURE_URL,
} = require('./variables');
const createError = require('./helpers/createError');

const Device = require('./core/Device');
const Structure = require('./core/Structure');
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

  async refreshAccessToken(refresh_token) {
    if (!refresh_token) {
      return console.error('Refresh Token Required');
    }
    const response = await axios.post(
      REFRESH_URL(this.client_id, this.client_secret, this.refresh_token),
    );

    return response.data.access_token;
  }

  async getAccessTokens(oauth_code) {
    const data = {
      client_id: this.client_id,
      client_secret: this.client_secret,
      code: oauth_code,
      grant_type: 'authorization_code',
      redirect_uri: this.redirect_url,
    };

    const response = await axios.post(AUTH_URL, data);
    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
    };
  }

  login() {
    return LOGIN_URL(this.project_id, this.client_id, this.redirect_url);
  }

  async getDevices(access_token) {
    if (!access_token) {
      return console.error('Access Token Required');
    }

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
      devices.push(Device(d));
    });

    return devices;
  }

  async getStructures(access_token) {
    if (!access_token) {
      return console.error('Access Token Required');
    }

    const { data } = await axios({
      url: STRUCTURE_URL(this.project_id),
      method: 'get',
      headers: {
        authorization: `Bearer ${access_token}`,
      },
    });

    const structures_dict = data.structures;
    const structures = [];

    structures_dict.forEach(d => {
      structures.push(Structure(d));
    });

    return structures;
  }

  async getCameraStream(device, access_token) {
    if (!device.type.includes('sdm.devices.types.DOORBELL', 'sdm.devices.types.CAMERA')) {
      return;
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

    return CameraStream(response.data);
  }
}

module.exports = NestDevicesAccess;
