"use strict";
const fetch = require("node-fetch");
const getProfile = require("../utils/get-profile");
const isUserLoggedIn = require("../utils/is-user-logged-in");

const {
  clientId,
  redirectUri,
  authEndpoint,
  tokenEndpoint,
  redirectToUrlAfterLogin,
  appendAccessTokenToRedirectUrlAfterLogin,
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
      body: `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}&client_id=${clientId}`,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    });
    const { access_token: accessToken, error } = await response.json();

    if (accessToken && !error) {
      ctx.session.keycloak = {
        accessToken,
      };

      if (redirectToUrlAfterLogin != null) {
        let redirectUrl = redirectToUrlAfterLogin;

        if (appendAccessTokenToRedirectUrlAfterLogin) {
          redirectUrl += `?accessToken=${accessToken}`;
        }

        ctx.redirect(redirectUrl);
        return;
      }

      ctx.body = "Welcome!";
    } else {
      delete ctx.session.keycloak;
      ctx.body = "Error logging in";
    }
  },
  isLoggedIn: async (ctx) => {
    ctx.body = await isUserLoggedIn(ctx);
  },
  profile: async (ctx) => {
    ctx.body = await getProfile(ctx);
  },
};
