const esbuild = require('./esbuild');
const htmlTransform = require('./html-transform');
const lightningCss = require('./lightning-css');
const {filterPlugin} = require('./filters');

module.exports = (eleventyConfig) => {
  eleventyConfig.addPlugin(esbuild);
  eleventyConfig.addPlugin(htmlTransform);
  eleventyConfig.addPlugin(lightningCss);
  eleventyConfig.addPlugin(filterPlugin);
};
