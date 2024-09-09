const { roleMappingPrefix, roleMapping } = strapi.config.keycloak;

// Keycloak role mapping
module.exports = async (jwt, strapi) => {
    const permissionsRole = strapi.query("api::user-rl.user-rl")
    if (roleMapping) {
        const allRoles = await permissionsRole.findMany({});
        let jwtRoles = jwt.resource_access[jwt.azp]?.roles || []
        if (roleMappingPrefix && jwt.realm_access.roles) {
            jwtRoles.push(...jwt.realm_access.roles.filter(r => r.startsWith(roleMappingPrefix)).map(r => r.substring(roleMappingPrefix.length)));
        }

        let jwtMappedRoles = allRoles.filter(r => jwtRoles.includes(r.name));
        return jwtMappedRoles.map((r) => r.id);
    }
    return [];
};
