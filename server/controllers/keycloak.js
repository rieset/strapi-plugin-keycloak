"use strict";
const fetch = require("node-fetch");
const getProfile = require("../utils/get-profile");
const createUser = require("../utils/create-user");
const isUserLoggedIn = require("../utils/is-user-logged-in");
const { getService } = require("@strapi/plugin-users-permissions/server/utils");

const emailRegExp =
  // eslint-disable-next-line
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

function cleanUrl(url) {
  const cleanUrl = url.startsWith("http") ? url : `http://example.com${url}`;

  return new URL(cleanUrl);
}

function parseJwt(token) {
  try {
    if (!token) return {};

    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(
      Buffer.from(base64, "base64")
        .toString()
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (err) {
    return {};
  }
}

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
} = strapi.config.keycloak;

const scope = "profile";

/**
 * A set of functions called "actions" for `keycloak`
 */

module.exports = ({ strapi }) => ({
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
    const jwtService = getService("jwt");

    // Strapi sometimes does not include the host name and protocol, making it an invalid URL.
    // With this code, we clean that up.
    const code = cleanUrl(ctx.req.url).searchParams.get("code");

    const jwt = await fetch(`${tokenEndpoint}`, {
      method: "POST",
      body: `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}&client_id=${clientId}&client_secret=${clientSecret}`,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          throw new Error(data.error.message);
        }

        if (!data.access_token) {
          throw new Error("Access token is empty");
        }

        const jwt = parseJwt(data.access_token);

        if (!emailRegExp.test(jwt.email.toLowerCase())) {
          throw new Error("Wrong email");
        }

        return strapi.db
          .query("plugin::users-permissions.user")
          .findOne({
            where: {
              email: jwt.email.toLowerCase(),
            },
          })
          .then(async (user) => {
            if (!user) {
              return await createUser(jwt, strapi);
            }

            return user;
          })
          .catch(() => {
            throw new Error("User is not exist");
          });
      })
      .then((user) => {
        if (!user) {
          throw new Error("User not found and creation failed");
        }

        return jwtService.issue({ id: user.id });
      })
      .catch((err) => {
        ctx.statusCode = 403;
        ctx.body = err.message;
        console.log(err);
        return null;
      });

    ctx.cookies.set("token", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      maxAge: 1000 * 60 * 60 * 24 * 1, // 14 Day Age
      domain:
        process.env.NODE_ENV === "production"
          ? process.env.PUBLIC_URL
          : "localhost",
    });

    let redirectUrl = redirectToUrlAfterLogin;

    if (redirectUrl && appendAccessTokenToRedirectUrlAfterLogin) {
      redirectUrl += `?accessToken=${jwt}`;
    }

    if (redirectUrl != null) {
      ctx.redirect(redirectUrl);
      return;
    }

    ctx.statusCode = 200;
    ctx.body = "Welcome!";
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
});
