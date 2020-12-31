const AUTH_URL = `https://www.googleapis.com/oauth2/v4/token`;
const REFRESH_URL = (client_id, client_secret, refresh_token) =>
  `https://www.googleapis.com/oauth2/v4/token?client_id=${client_id}
    client_secret=${client_secret}&refresh_token=${refresh_token}&grant_type=refresh_token`;
const BASE_URL = `https://smartdevicemanagement.googleapis.com/v1`;
const DEVICE_URL = project_id =>
  `https://smartdevicemanagement.googleapis.com/v1/enterprises/${project_id}/devices`;
const COMMAND_URL = (project_id, device_id) =>
  `https://smartdevicemanagement.googleapis.com/v1/enterprises/${project_id}/devices/${device_id}:executeCommand`;
const LOGIN_URL = (project_id, client_id, redirect_url) =>
  `https://nestservices.google.com/partnerconnections/${project_id}/auth?` +
  `redirect_uri=${redirect_url}&access_type=offline&prompt=consent&client_id=${client_id}&` +
  `response_type=code&scope=https://www.googleapis.com/auth/sdm.service`;

module.exports = {
  AUTH_URL,
  REFRESH_URL,
  BASE_URL,
  DEVICE_URL,
  COMMAND_URL,
  LOGIN_URL,
};
