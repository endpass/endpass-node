# Endpass OAuth2 client

## Installation

Install client with your favorite package manager. For example with `yarn`:

```shell
yarn add endpass-node
```

Or with `npm`:

```shell
npm i --save endpass-node
```

## Usage

This library allows to use endpass public API. Before requesting you should create
your owl application at [Vault](https://vault.endpass.com) and create client.

For example, we want to create client for requesting user data:

```js
const { Client } = require('endpass-node');

const client = new Client({
  clientId: '<your_application_id>',
  clientSecret: '<your_application_secret>',
  scopes: ['user:email:read', 'user:phone:read'],
  state: '<random_string>',
  redirectUrl: '<your_application_redirect_url>',
});
```

You can generate authorization code with `getAuthUrl` method and redirect user for receive
authorization code, which can be used for access token requesting.

When you will receive authorization code you can try to request access token and
make some requests with that:

```js
const token = await client.exchange('<authorization_code>');

try {
  const { email } = await client.request({
    path: '/user',
    accessToken: token.accessToken,
  });

  // There would be profile data
} catch (err) {
  // Error handling
}
```

Also, you can create `EndpassRequester` instance for multiple requests with one access token:

```js
const token = await client.exchange('<authorization_code>');
const requester = client.createRequester(token.accessToken);

try {
  const { email } = await requester.request('/user');
  // ...
  // There would be profile data
} catch (err) {
  // Error handling
}
```

In the case abow, your access token will be cached in requester instance. Do not forget
about access token expiration!

**Notice**: `endpass-node` client is not storing access tokens, you should solve it by
yourself.

Also, yor can check example application [here](https://github.com/lamartire/endpass-node/tree/master/example).

## API reference

### Client constructor

**Notice**: all properties are required.

| Property       | Description                                    |
| -------------- | ---------------------------------------------- |
| `clientId`     | Oauth2 application client id                   |
| `clientSecret` | Oauth2 application client secret               |
| `scopes`       | Scopes which can be allowed to client requests |
| `redirectUrl`  | Redirect for receiving authorization code      |
| `state`        | Unique string for validating OAuth2 responses  |

### Client methods

**Notice**: you can find more information in the JSDOC notations for each method.

| Method       | Arguments                                                | Returned value    | Description                                                                |
| ------------ | -------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------- |
| `getAuthUrl` |                                                          | `string`          | Returns url where user can receive authorization code for token requesting |
| `exchange`   | `code: string`                                           | `Promise<Token>`  | Requests authorization token with authorization code                       |
| `refresh`    | `refreshToken: string`                                   | `Promise<Token>`  | Refresh authorization token with earlier received refresh token            |
| `request`    | `{ origin?: string, path: string, accessToken: string }` | `Promise<object>` | Request some data from endpass public API endpoint with access token       |

## Links

- [Endpass OAuth2 example application](https://github.com/lamartire/endpass-node/tree/master/example).
