const { getService } = require("@strapi/plugin-users-permissions/server/utils");

// Create user
module.exports = async (jwt, strapi) => {
  const pluginStore = await strapi.store({
    type: "plugin",
    name: "users-permissions",
  });
  const settings = await pluginStore.get({
    key: "advanced",
  });

  const role = await strapi
    .query("plugin::users-permissions.role")
    .findOne({ where: { type: settings.default_role } });

  return await getService("user").add({
    email: jwt.email,
    confirmed: jwt.email_verified,
    blocked: false,
    username: jwt.name,
    role: role.id,
  });
};
