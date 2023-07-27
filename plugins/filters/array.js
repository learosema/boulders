module.exports = (input) => {
  if (!input) {
    return [];
  }
  if (typeof input === 'string' && /\w+(\s*,\s*\w+)/.test(input)) {
    return input.split(/s*,\s*/);
  }
  return input instanceof Array ? input : [input];
};
