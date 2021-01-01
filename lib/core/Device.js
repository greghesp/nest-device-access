const Device = function(device) {
  return {
    name: device.name,
    device_id: device.name.split('/')[3],
    type: device.type,
    traits: device.traits
  }
};

module.exports = Device;
