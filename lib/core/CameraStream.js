class CameraStream {
  constructor(dict) {
    this.rtsp_stream_url = dict.results.streamUrls.rtspUrl;
    this.stream_token = dict.results.streamToken;
    this.expires_at = dict.results.expiresAt;
  }
}
module.exports = CameraStream;
