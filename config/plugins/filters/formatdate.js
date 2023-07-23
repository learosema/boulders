const dayjs = require('dayjs');

/** Formats a date using dayjs's conventions: https://day.js.org/docs/en/display/format */
module.exports = (date, format) => dayjs(date).format(format);
