const Structure = function (structure) {
  return {
    name: structure.name,
    device_id: structure.name.split('/')[3],
    traits: structure.traits,
  };
};

module.exports = Structure;
