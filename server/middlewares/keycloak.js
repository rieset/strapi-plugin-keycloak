"use strict";

const isUserLoggedIn = require("../utils/is-user-logged-in");

/**
 * `keycloak` middleware.
 */

module.exports = () => {
  // Add your own logic here.
  return async (ctx, next) => {
    if (!(await isUserLoggedIn(ctx))) {
      ctx.status = 403;
      ctx.body = "Please supply header Authorization or have a valid session.";
      return;
    }

    await next();
  };
};
