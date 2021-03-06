"use strict";

// Keycloak plugin
const controllers = require("./controllers");
const routes = require("./routes");
const middlewares = require("./middlewares");

module.exports = {
  controllers,
  routes,
  middlewares,
};
