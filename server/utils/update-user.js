// const { getService } = require("@strapi/plugin-users-permissions/server/utils");
const keycloakRole = require("./keycloak-role");

module.exports = async (jwt, strapi, user) => {

  const roleIds = await keycloakRole(jwt, strapi);

  const firstName = jwt.given_name;
  const lastName = jwt.family_name;
  const username = jwt.preferred_username;

  const data = { first_name: firstName, last_name: lastName, username, user_rls: roleIds };
  let result = await strapi.service("plugin::users-permissions.user").edit(user.id, data);

  return result;

};
