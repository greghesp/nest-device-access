const CameraStream = function(device) {
  return {
    rtsp_stream_url: device.results.streamUrls.rtspUrl,
    stream_token: device.results.streamToken,
    expires_at: device.results.expiresAt
  }
};

module.exports = CameraStream;

