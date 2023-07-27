const slugify = require('slugify');

/** Converts string to a slug form. */
module.exports = (str) => {
  return slugify(str, {
    replacement: '-',
    remove: /[#,&,+()$~%.'":*?<>{}]/g,
    lower: true,
  });
};
