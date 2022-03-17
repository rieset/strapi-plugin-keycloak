module.exports = [
  {
    method: "GET",
    path: "/",
    handler: "keycloak.index",
    config: {
      auth: false,
    },
  },
  {
    method: "GET",
    path: "/login",
    handler: "keycloak.login",
    config: {
      auth: false,
    },
  },
  {
    method: "GET",
    path: "/logout",
    handler: "keycloak.logout",
    config: {
      auth: false,
    },
  },
  {
    method: "GET",
    path: "/callback",
    handler: "keycloak.callback",
    config: {
      auth: false,
    },
  },
  {
    method: "GET",
    path: "/isLoggedIn",
    handler: "keycloak.isLoggedIn",
    config: {
      auth: false,
    },
  },
  {
    method: "GET",
    path: "/profile",
    handler: "keycloak.profile",
    config: {
      auth: false,
    },
  },
];
