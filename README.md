# Strapi Keycloak Plugin

This is a Strapi plugin to support Keycloak authentication for end-users. **It is not designed for admin users**.

## Quickstart

To configure Keycloak, see [this guide](./docs/configure-keycloak.md).

Install the plugin in your Strapi project:

```shell
yarn add @hipsquare/strapi-keycloak-plugin
```

Enable the plugin in **config/plugins.js** (create the file if it does not exist so far):

```javascript
module.exports = {
  keycloak: {
    enabled: true,
  },
};
```

Create **config/keycloak.js** and configure Keycloak accordingly:

```javascript
module.exports = {
  // client ID configured in Keycloak
  clientId: "strapi",

  // if the client access type is set to "confidential" in keycloak, add the client secret here. otherwise, don't set this value.
  clientSecret: "abcdefg",

  // auth endpoint, right value comes from Keycloak
  authEndpoint:
    "http://localhost:8080/realms/strapi/protocol/openid-connect/auth",

  // token endpoint, right value comes from Keycloak
  tokenEndpoint:
    "http://localhost:8080/realms/strapi/protocol/openid-connect/userinfo",

  // user info endpoint, right value comes from Keycloak
  userinfoEndpoint:
    "http://localhost:8080/realms/strapi/protocol/openid-connect/userinfo",

  // logout endpoint, right value comes from Keycloak
  logoutEndpoint:
    "http://localhost:8080/realms/strapi/protocol/openid-connect/logout",

  // redirect URI after Keycloak login, should be the full URL of the Strapi instance and always point to the `keycloak/callback` endpoint
  redirectUri: "http://localhost:1337/keycloak/callback",

  // URL to redirect to when login process is finished. In normal cases, this would redirect you back to the application using Strapi data
  redirectToUrlAfterLogin: "http://localhost:1337/api/todos",

  // URL to redirect to after logout
  redirectToUrlAfterLogout: "http://localhost:1337/",
};
```

To protect a route, apply the middleware to that route in **`api/[content-type]/routes/[content-type].js`** (in our example `todo`).

```javascript
const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = createCoreRouter("api::todo.todo", {
  config: {
    find: {
      middlewares: ["plugin::keycloak.keycloak"],
    },
  },
});
```

Restart Strapi.

Open [http://localhost:1337/keycloak/login](http://localhost:1337/keycloak/login) to start the login process.

Now open the `find` endpoint of your content type, in this example [http://localhost:1337/api/todos](http://localhost:1337/api/todos).

## Login flow for frontend apps

The login flow above works, but only in environments where session cookies are supported (so most browser use cases). It doesn't work that well, however, for Capacitor or other native applications that don't fully support session cookies.

To solve that, you can set `appendAccessTokenToRedirectUrlAfterLogin` to `true` in the config. When redirecting to `redirectToUrlAfterLogin`, it will append a query parameter called `accessToken` with the access token retrieved.

The login flow then would work like that:

1. The frontend application redirects to Strapi's `/keycloak/login` endpoint.
2. Strapi initiates the login with Keycloak.
3. Once done, Strapi redirects back to the frontend using the defined `redirectToUrlAfterLogin` and appends the access token as a query parameter `accessToken`.
4. The frontend reads the query parameter, stores it (e.g. session storage) and and sets the `Keycloak` header in requests to Strapi:
   ```shell
   curl http://localhost:1337/api/todos -H "Keycloak: Bearer [Access Token]"
   ```

## Check if user is logged in

To check if the user is currently logged in with a valid access token, you can call the `/keycloak/isLoggedIn` endpoint. It will return `true` or `false`.

The endpoint works both with session cookies and with an explicitly set access token in the `Keycloak` header.

## Logout

To initiate a logout, redirect the user to `/keycloak/logout`.
