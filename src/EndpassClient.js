const { OAuth2 } = require('oauth');
const EndpassRequester = require('./EndpassRequester');

/**
 * Authorization token object which can be recieved with exchange method
 * @typedef {object} Token
 * @property {string} accessToken OAuth2 access token
 * @property {string} refreshToken OAuth2 refresh token
 * @property {number} expiresIn Access token lifetime in ms
 * @property {string} tokenType Received token type
 * @property {string} scope Scopes granted by token
 */

class EndpassClient {
  /**
   * @param {string} options.clientId
   * @param {string} options.clientSecret
   * @param {string[]} options.scopes
   * @param {string} options.redirectUrl
   * @param {string} options.state
   * @param {string} [options.apiUrl]
   * @param {string} [options.oauth2BaseUrl]
   */
  constructor({
    clientId,
    clientSecret,
    scopes,
    redirectUrl,
    state,
    apiUrl = 'https://api.endpass.com/v1',
  }) {
    this.state = state;
    this.apiUrl = apiUrl;
    this.redirectUrl = redirectUrl;
    this.scopes = scopes;
    this.oauth2 = new OAuth2(
      clientId,
      clientSecret,
      apiUrl,
      '/oauth/auth',
      '/oauth/token',
    );
  }

  /**
   * Returns url where user can receive authorization code for token
   * requesting
   * @returns {string} Authorization URL
   */
  getAuthUrl() {
    return this.oauth2.getAuthorizeUrl({
      redirect_url: this.redirectUrl,
      scope: this.scopes,
      state: this.state,
      response_type: 'code',
    });
  }

  /**
   * Requests authorization token with authorization code
   * Requested token object includes accessToken field which can be used to
   * request anything from endpass public API
   * @param {string} code Authorization code
   * @returns {Promise<Token>} Authorization token object
   */
  exchange(code) {
    return new Promise((resolve, reject) => {
      this.oauth2.getOAuthAccessToken(
        code,
        {
          grant_type: 'authorization_code',
        },
        (err, ...response) => {
          if (err) return reject(err);

          return resolve(this.formatTokenResponse(...response));
        },
      );
    });
  }

  /**
   * Refresh authorization token with earlier received refresh token
   * @param {string} refreshToken Refresh token
   * @returns {Promise<Token>} Authorization token object
   */
  refresh(refreshToken) {
    return new Promise((resolve, reject) => {
      this.oauth2.getOAuthAccessToken(
        refreshToken,
        {
          grant_type: 'refresh_token',
        },
        (err, ...response) => {
          if (err) return reject(err);

          return resolve(this.formatTokenResponse(...response));
        },
      );
    });
  }

  /**
   * Formats API response to authorization Token object
   * @param {string} accessToken
   * @param {string} refreshToken
   * @param {object} results
   * @param {string} results.expires_in
   * @param {number} results.token_type
   * @param {string} results.scope
   * @returns {Token} Authorization token object
   */
  formatTokenResponse(accessToken, refreshToken, results) {
    const { expires_in: expiresIn, token_type: tokenType, scope } = results;

    return {
      expiresIn,
      scope,
      tokenType,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Request some data from endpass public API endpoint with access token
   * Also it can pass into request custom Origin header, which allows to
   * use OAuth2 client in specific environment. For example, on localhost
   * @example
   * const res = await c.request({ path: '/user', accessToken: 'access_token' })
   * // { email: 'example@email.com', phones: [] }
   * @param {object} params
   * @param {string} [params.origin] The Host. Optionally needs for working in
   *  some special environments, like localhost
   * @param {string} params.path Public API endpoint
   * @param {string} params.accessToken Access token string
   * @returns {Promise<object>} Request result
   */
  request({ origin, path, accessToken }) {
    const requestPath = `${this.apiUrl}/${path.replace(/^\//, '')}`;
    const requestHeaders = {
      Authorization: `Bearer ${accessToken}`,
    };

    if (origin) {
      Object.assign(requestHeaders, {
        Origin: origin,
      });
    }

    return new Promise((resolve, reject) => {
      /**
       * Using private method because public is not provide ability to change
       * request headers
       */
      this.oauth2._request(
        'GET',
        requestPath,
        requestHeaders,
        '',
        null,
        (err, res) => {
          if (err) {
            const { message, code } = JSON.parse(err.data);
            const error = new Error(`${code}: ${message}`);

            return reject(error);
          }

          return resolve(JSON.parse(res));
        },
      );
    });
  }

  createRequester(accessToken) {
    return new EndpassRequester({ client: this, accessToken });
  }
}

module.exports = EndpassClient;
