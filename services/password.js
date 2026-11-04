const crypto = require('crypto');

exports.hash = pw => {
  const salt = crypto.randomBytes(16);
  return `${salt.toString('hex')}:${crypto.scryptSync(pw, salt, 64).toString('hex')}`;
};
exports.verify = (pw, stored) => {
  const [salt, hash] = stored.split(':');
  const expected = Buffer.from(hash, 'hex');
  const actual = crypto.scryptSync(pw, Buffer.from(salt, 'hex'), 64);
  return crypto.timingSafeEqual(actual, expected);
};
exports.DUMMY = exports.hash('not-a-real-password'); // used so unknown usernames take equally long
