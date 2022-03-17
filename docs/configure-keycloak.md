# Configure Keycloak

## Start Keycloak

Start Keycloak as described in [the Keycloak guide](https://www.keycloak.org/getting-started/getting-started-zip).

## Create a realm

Follow the guide to create a realm. Call the realm "strapi".

## Create a client

In the strapi realm, create a new client (follow "Secure your first app" from the Keycloak guide).

Give the client the client ID "strapi" and make sure to pick "openid-connect" as the client protocol. Use your Strapi URL as the root URL, e.g. `http://localhost:1337`. Click "Save".

Now, the client settings should open. In the client settings, set the "Access Type" to "public" (to open Keycloak up for access by any client without a client secret required) or "confidential" (to require a client secret to be sent with the `token` request and therefore to close down Keycloak for unknown clients). You'll normally want to set it to "confidential".

Save the client.

## Get the relevant configuration values

Open the Strapi Realm Settings in the Keycloak navigation bar. Under "Endpoints", click "OpenID Endpoint Configuration". The configuration will open as a JSON object.

You can fill your Strapi config (`config/keycloak.js`) from the Keycloak endpoint configuration (see the main [readme](../README.md)):

| `config/keycloak.js` entry in Strapi | Keycloak endpoint config property                                                                                                   |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `clientId`                           | The client ID you entered when creating the client (we use "strapi" in this guide)                                                  |
| `clientSecret`                       | If the client access type if set to "confidential", put the client secret (tab "credentials") in. Otherwise, leave this field empty |
| `authEndpoint`                       | `authorization_endpoint`                                                                                                            |
| `tokenEndpoint`                      | `token_endpoint`                                                                                                                    |
| `userinfoEndpoint`                   | `userinfo_endpoint`                                                                                                                 |
| `logoutEndpoint`                     | `end_session_endpoint`                                                                                                              |

## Create a user

Follow the Keycloak guide to create a user.
