const getProfile = require("./get-profile");

module.exports = async (ctx) => {
  const profile = await getProfile(ctx);
  return profile != null;
};
