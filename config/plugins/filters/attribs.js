// A very naive function to add attributes to the first tag of an svg. But works for my cases :)
module.exports = function (template, attribs) {
  const attribString = Object.entries(attribs)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
  return template.replace(/<([\s\w:;|-/.=\n'"]*)>/, `<$1 ${attribString}>`);
};
