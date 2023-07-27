const array = require('./array');
const formatDate = require('./formatdate');
const isoDate = require('./isodate');
const limit = require('./limit');
const minify = require('./minify');
const where = require('./where');
const splitLines = require('./splitlines');
const slugify = require('./slugify');

const filterPlugin = (eleventyConfig) => {
  eleventyConfig.addFilter('array', array);
  eleventyConfig.addFilter('formatDate', formatDate);
  eleventyConfig.addFilter('isoDate', isoDate);
  eleventyConfig.addFilter('limit', limit);
  eleventyConfig.addFilter('minify', minify);
  eleventyConfig.addFilter('where', where);
  eleventyConfig.addFilter('splitLines', splitLines);
  eleventyConfig.addFilter('slugify', slugify);
  eleventyConfig.addFilter('keys', Object.keys);
  eleventyConfig.addFilter('values', Object.values);
  eleventyConfig.addFilter('entries', Object.entries);
  eleventyConfig.addFilter('json', JSON.stringify);
};

module.exports = {
  formatDate,
  isoDate,
  limit,
  minify,
  where,
  splitLines,
  slugify,
  filterPlugin,
};
