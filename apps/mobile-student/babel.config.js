module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'] // Change it to this
  };
};