function base64encode(text) {
  return Buffer.from(text).toString('base64');
}

module.exports = {
  base64encode,
};