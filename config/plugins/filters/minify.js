// TODO: maybe use this
// https://github.com/mattdesl/optimize-shader

module.exports = function (str) {
  // this trims whitespaces, strips comments, removes newlines
  return str
    .replace(/\/\*(.|[\n\t])*\*\//g, '')
    .split('\n')
    .map((line) => {
      const trimmed = line
        .trim()
        .replace(/\s*(\W)\s*/g, '$1')
        .replace(/\/\/.*$/, '');
      // directives like #define need a newline
      return trimmed.startsWith('#') ? trimmed + '\n' : trimmed;
    })
    .filter((line) => !line.startsWith('//'))
    .join('');
};
