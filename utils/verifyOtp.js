const generateOtpExpiry = (minutes = 1) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

module.exports = generateOtpExpiry;
