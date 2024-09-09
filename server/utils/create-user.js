// const { t } = require("@strapi/plugin-users-permissions");

const keycloakRole = require("./keycloak-role");


// Create user
module.exports = async (jwt, strapi) => {
  const pluginStore = await strapi.store({
    type: "plugin",
    name: "users-permissions",
  });
  const settings = await pluginStore.get({ key: "advanced" });
  const permissionsRole = strapi.query("plugin::users-permissions.role")

  const defaultRole = await permissionsRole.findOne({ where: { type: settings.default_role } });

  let roleId = defaultRole.id;

  const roleIds = await keycloakRole(jwt, strapi);


  // const roleId = await keycloakRole(jwt, strapi)
  return await strapi.plugins['users-permissions'].services.user.add({
    email: jwt.email,
    confirmed: jwt.email_verified,
    password: Math.random().toString(36).slice(2),
    blocked: false,
    provider: 'local',
    created_by: 1, //user admin id
    updated_by: 1, //user admin id
    username: jwt.preferred_username,
    first_name: jwt.given_name,
    last_name: jwt.family_name,
    role: roleId,
    user_rls: roleIds
  });

};
