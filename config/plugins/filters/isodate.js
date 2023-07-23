const dayjs = require('dayjs');

/** Converts the given date string to ISO8610 format. */
module.exports = (dateString) => dayjs(dateString).toISOString();
