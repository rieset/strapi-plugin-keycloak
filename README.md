# Strapi Keycloak Plugin


This is a Strapi plugin to support Keycloak authentication for end-users. **It is not designed for admin users**.

## Quickstart

Install the plugin in your Strapi project:

```shell
yarn add @rieset/strapi-plugin-keycloak
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
    "http://localhost:8080/realms/strapi/protocol/openid-connect/token",

  // user info endpoint, right value comes from Keycloak
  userinfoEndpoint:
    "http://localhost:8080/realms/strapi/protocol/openid-connect/userinfo",

  // logout endpoint, right value comes from Keycloak
  logoutEndpoint:
    "http://localhost:8080/realms/strapi/protocol/openid-connect/logout",

  // redirect URI after Keycloak login, should be the full URL of the Strapi instance and always point to the `keycloak/callback` endpoint
  redirectUri: "http://localhost:1337/keycloak/callback",

  // default URL to redirect to when login process is finished. In normal cases, this would redirect you back to the application using Strapi data
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

The login flow use extends OpenId for check permission. After confirming permissions in Keycloak, it returns the Strapi native user profile and its token.

To solve that, you can set `appendAccessTokenToRedirectUrlAfterLogin` to `true` in the config. When redirecting to `redirectToUrlAfterLogin`, it will append a query parameter called `accessToken` with the access token retrieved.

The login flow than would work like that:

1. The frontend application redirects to Strapi's `/keycloak/login` endpoint.
2. Strapi initiates the login with Keycloak.
3. Creates a user in the Strapi database and gives his own access token.
4. Strapi then redirects back to the frontend using the defined `redirectToUrlAfterLogin` and adds an access token to the cookie with the option httpOnly=true.
5. Frontend uses API according to the documentation, the restriction of rights on requests is defined within the admin panel

## Check if user is logged in

To check if the user is currently logged in with a valid access token, you can call the `/keycloak/isLoggedIn` endpoint. It will return `true` or `false`.

## Logout

To initiate a logout, redirect the user to `/keycloak/logout`.
