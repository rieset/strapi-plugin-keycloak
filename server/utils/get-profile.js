const { userinfoEndpoint } = strapi.config.keycloak;
const fetch = require("node-fetch");

module.exports = async (ctx) => {
  let accessToken = ctx.cookies.get("token") || null;

  if (!accessToken) {
    return;
  }

  if (accessToken.startsWith("Bearer ")) {
    accessToken = accessToken.substr("Bearer ".length);
  }

  // verify that user is valid by getting user info
  const userInfoResponse = await fetch(userinfoEndpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const userInfo = await userInfoResponse.json();

  return userInfo;
};
