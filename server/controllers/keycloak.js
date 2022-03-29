"use strict";
const fetch = require("node-fetch");
const getProfile = require("../utils/get-profile");
const isUserLoggedIn = require("../utils/is-user-logged-in");

const {
  clientId,
  clientSecret,
  redirectUri,
  authEndpoint,
  tokenEndpoint,
  logoutEndpoint,
  redirectToUrlAfterLogin,
  redirectToUrlAfterLogout,
  appendAccessTokenToRedirectUrlAfterLogin,
  permittedOverwriteRedirectUrls = [],
} = strapi.config.keycloak;

const scope = "profile";

/**
 * A set of functions called "actions" for `keycloak`
 */

module.exports = {
  index: async (ctx) => {
    ctx.body = "The Keycloak plugin is running.";
  },
  login: async (ctx) => {
    if (ctx.session.keycloak == null) {
      ctx.session.keycloak = {};
    }

    ctx.session.keycloak.redirectTo = ctx.query.redirectTo;

    ctx.response.redirect(
      `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`
    );
  },
  callback: async (ctx) => {
    // Strapi sometimes does not include the host name and protocol, making it an invalid URL.
    // With this code, we clean that up.
    const cleanUrl = ctx.req.url.startsWith("http")
      ? ctx.req.url
      : `http://example.com${ctx.req.url}`;

    const requestUrl = new URL(cleanUrl);
    const code = requestUrl.searchParams.get("code");

    const response = await fetch(`${tokenEndpoint}`, {
      method: "POST",
      body: `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}&client_id=${clientId}&client_secret=${clientSecret}`,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    });
    const { access_token: accessToken, error } = await response.json();

    if (accessToken && !error) {
      const overwriteRedirectUrl = ctx.session.keycloak?.redirectTo;

      ctx.session.keycloak = {
        accessToken,
      };

      let redirectUrl = redirectToUrlAfterLogin;

      // allow URL override only for permitted URLs
      if (
        overwriteRedirectUrl &&
        permittedOverwriteRedirectUrls.find((permittedUrl) =>
          overwriteRedirectUrl.startsWith(permittedUrl)
        )
      ) {
        redirectUrl = overwriteRedirectUrl;
      }

      if (redirectUrl && appendAccessTokenToRedirectUrlAfterLogin) {
        redirectUrl += `?accessToken=${accessToken}`;
      }

      if (requestUrl != null) {
        ctx.redirect(redirectUrl);
        return;
      }

      ctx.body = "Welcome!";
    } else {
      strapi.log.warn(
        "Error retrieving token from Keycloak: " + JSON.stringify(error)
      );
      delete ctx.session.keycloak;
      ctx.body = "Error logging in: ";
    }
  },
  logout: (ctx) => {
    ctx.redirect(
      `${logoutEndpoint}?redirect_uri=${redirectToUrlAfterLogout ?? ""}`
    );
  },
  isLoggedIn: async (ctx) => {
    ctx.body = await isUserLoggedIn(ctx);
  },
  profile: async (ctx) => {
    ctx.body = await getProfile(ctx);
  },
};
