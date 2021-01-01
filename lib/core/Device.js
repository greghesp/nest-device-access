class Device {
  constructor(dict) {
    this.name = dict.name;
    this.device_id = this.name.split('/')[3];
    this.type = dict.type;
    this.traits = dict.traits;
  }
}
module.exports = Device;
