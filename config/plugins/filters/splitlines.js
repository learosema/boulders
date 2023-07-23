// Splits a string into an array of lines, with a max number of words
// source: https://github.com/bnijenhuis/bnijenhuis-nl/blob/main/.eleventy.js
module.exports = (input, maxWords = 19) => {
  const parts = input.split(' ');
  const lines = parts.reduce(function (acc, cur) {
    if (!acc.length) {
      return [cur];
    }

    let lastOne = acc[acc.length - 1];

    if (lastOne.length + cur.length > maxWords) {
      return [...acc, cur];
    }

    acc[acc.length - 1] = lastOne + ' ' + cur;

    return acc;
  }, []);

  return lines;
};
