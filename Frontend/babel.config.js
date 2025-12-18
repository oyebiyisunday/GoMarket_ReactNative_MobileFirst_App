// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"], // ← this includes the router transform in SDK 50+
    // NO "plugins": ["expo-router/babel"] here anymore
  };
};
